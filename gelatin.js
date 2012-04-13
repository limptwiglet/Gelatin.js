(function () {
	var root = this;

	Class.Mutators.Static = function (items) {
		this.extend(items);
	};

	// Setup our Gelatin namespace
	var Gelatin = root.Gelatin = {};


	/**
	 * Generates a uniqui id
	 *
	 * @param {String} - Prefix the id
	 */
	var curCid = 0;
	var getCid = function (prefix) {
		return String.uniqueID();
	};


	/**
	 * Returns the property at the given path
	 *
	 * @param {Object} - The object to get the property from
	 * @param {String} - The path or property to get
	 * @return Returns the property
	 */
	var get = Gelatin.get = function (obj, key) {
		key = key.toString();
		var path = ~key.indexOf('.') ? key.split('.') : false, value;

		if (path) {
			var root = obj;

			while(path.length) {
				root = get(root, path.shift());
			}

			return root;
		}

		if (!(key in obj)) {
			if (typeOf(obj.getUnknown) === 'function') {
				value = obj.getUnknown(key);	
			}
		} else {
			value = obj[key];

			//if (typeOf(value) === 'object' && 'get' in value) {
				//value = value.get(obj, key);
			//}
		}

		return value;
	};


	var set = Gelatin.set = function (obj, key, value) {
		if (!(key in obj)) {
			if (typeOf(obj.setUnknown) === 'function') {
				return obj.setUnknown(key, value);
			}
		}

		var prop = obj[key];

		if (typeOf(prop) === 'object') {
			return prop.set(obj, key, value);
		}

		return obj[key] = value;
	};


	// TODO: This needs to be refactored to work with getters and setters
	var ComputedProperty = Gelatin.ComputedProperty = new Class({
		Implements: [Options],

		options: {

		},

		initialize: function (func, options) {
			this.setOptions(options);
			this.func = func;

			return this;
		},

		property: function () {
			this.props = Array.from(arguments);
			return this;
		},

		get: function (obj, key) {
			var ret = this.func.call(obj, key);
			return ret;
		},

		set: function (obj, key, value) {
			this.func.call(obj, key, value);			
		}
	});

	var computed = Gelatin.computed = function () {
		var computed = new ComputedProperty(arguments[0]);
		return computed;
	};

	/**
	 * Base class that allows observing of properties but only if properties 
	 * are accessed via the provided get and set methods
	 */
	var Obj = Gelatin.Object = new Class({
		Implements: [Events],

		// TODO: Remove meta properties this shouldnt be needed especially
		// for hasChanged
		meta: {
			hasChanged: false
		},

		/**
		 * Constructor function accepts properties that you want to set
		 * when creating the object
		 */
		initialize: function (props) {
			Object.append(this, props);
			this._prevAttrs = {};

			return this;
		},

		/**
		 * Returns a property set on this class
		 *
		 * @param {String} - The property to get
		 * @return {Mixed} - The value of the property
		 */
		get: function (key) {
			return get(this, key);
		}.overloadGetter(),

		
		/**
		 * This should be a no-op function in most cases
		 */
		getUnknown: function (key) {
			if (key in this.meta) {
				return get(this.meta, key);
			}
			return undefined;
		},

		/**
		 * Set the property and triggers event listeners
		 *
		 * @param {String} - Property name to set
		 * @param {Mixed} - The value you wish to set the property to
		 * @param {Boolean} - Silent makes the change not trigger listeners
		 */
		set: function (key, value, silent) {
			var oldValue = this.get(key);

			if (oldValue !== value) {
				value = set(this, key, value);
				this._prevAttrs[key] = oldValue;
				set(this, 'hasChanged', true);

				if (silent == undefined || silent != true) {
					this.fireEvent('change', [key, value, oldValue]);
					this.triggerChange('hasChanged', key);
				}
			}

			return value;
		},

		/**
		 * Convinence method for setting multiple properties defined in a object 
		 * by iterating over the object keys callong set
		 *
		 * @param {Object} - A hash of properties and values to set
		 * @param {Boolean} - Slient flag
		 */
		setProperties: function (obj, silent) {
			var keys = Object.keys(obj);

			keys.each(function (key) {
				this.set(key, obj[key], true);	
			}.bind(this));

			keys.push('hasChanged');

			this.triggerChange.attempt(keys, this);
		},

		/**
		 * Triggers event handlers for the passed in keys
		 *
		 * @params {String} - Keys to trigger events for
		 */
		triggerChange: function () {
			var keys = Array.from(arguments);

			keys.each(function (key) {
				var name = 'change:'+key;

				if (name in this.$events) {
					// TODO: This is stupid, need to change this to native moo 
					// event triggering
					this.$events[name].each(function (e) {
						e(key, this.get(key), get(this, '_prevAttrs.'+key));
					}.bind(this));
				}
			}.bind(this));
		}
	});


	/**
	 * A data store class for handling updating models via an adapter
	 */
	Gelatin.Store = new Class({
		Implements: [Options],

		options: {
			transport: null
		},

		initialize: function (options) {
			this.setOptions(options);

			this.records = {};
			this.modelMap = {};
			this.newRecords = {};
		},

		getModelMap: function (Model) {
			var modelId = get(Model, '_modelId');

			if (!modelId) {
				modelId = String.uniqueID();
				set(Model, '_modelId', modelId);
			}

			var modelMap = this.modelMap[modelId];

			if (modelMap) {
				return modelMap;
			} else {
				return this.modelMap[modelId] = {
					id2Cid: {}
				};
			}
		},

		create: function (Model, data) {
			data = data || {};

			var id = data[Model.prototype.primaryKey];

			var modelMap = this.getModelMap(Model);

			var cId = String.uniqueID();

			var m = new Model(data);
			set(m, 'cId', cId);
			set(m, 'isLoaded', true);
			set(m, 'isNew', true);

			if (id) {
				modelMap.id2Cid[id] = cId;
				set(m, 'isNew', false);
			}

			return this.records[cId] = m;
		},

		find: function (Model, id) {
			var modelMap = this.getModelMap(Model);

			var cId = modelMap.id2Cid[id];

			if (cId) {
				return get(this.records, cId);
			} else {
				var m = new Model();
				cId = set(m, 'cId', String.uniqueID());
				modelMap.id2Cid[id] = cId;
				set(m, 'isLoaded', false);

				set(this.records, cId, m);

				if (this.options.transport)
					this.options.transport.find(this, Model, id);

				return m;
			}
		},

		findAll: function (Model) {
			var modelMap = this.getModelMap(Model);

			if (modelMap.all) return modelMap.all;

			var allArray = new Gelatin.ModelArray();

			modelMap.all = allArray;

			return allArray;

		},

		load: function (Model, id, data) {
			var modelMap = this.getModelMap(Model);
			var m = null;

			if (data === undefined) data = id;

			var pk = Model.prototype.primaryKey;
			var id = data[pk];

			var cId = modelMap.id2Cid[id];

			// If no client ID exists we need to create a new model instance
			if (!cId) {
				m = new Model(data);
				cId = set(m, 'cId', String.uniqueID());
				set(this.records, cId, m);
			} else {
				m = get(this.records, cId);
			}

			// Update the model map with the client id
			modelMap.id2Cid[id] = cId;

			m.set('isLoaded', true);
		},

		loadMany: function (Model, ids, datas) {
			ids.each(function (id, i) {
				this.load(Model, id, datas ? datas[i] : undefined);	
			}.bind(this));
		}
	});
	new Type('Store', Gelatin.Store);


	Gelatin.Model = new Class({
		Extends: Gelatin.Object,

		primaryKey: 'id',

		cId: null,

		id: false,

		isLoaded: false,
		isNew: false
	});
	new Type('Model', Gelatin.Model);


	Gelatin.ModelArray = new Class({
		Extends: Gelatin.Object,

		initialize: function () {
			this.parent();
			this.models = Array.from(arguments);
		}
	});

	Gelatin.ModelArray.implement({
		each: function (fn) {
			Array.each(this.models, fn);
		},

		push: function (model) {
			var models = this.get('models');
			model = models.push(model);
			this.set('models', models);
			return model;
		}
	});


	Gelatin.View = new Class({
		Implements: [Options],

		options: {
			tagName: 'div',
			id: ''
		},

		initialize: function(options) {
			this.setOptions(options);
			this.el;
			this.render();
		},

		render: function(options) {
			this.setOptions(options);
			this.el = new Element(this.options.tagName, {
				id: this.options.id

			});

			return this;
		},

		remove: function() {			
			this.el.dispose();

			return this;
		},

		inject: function(root) {		
			this.el.inject(root);

			return this;
		}
	});

	Gelatin.View.Button = new Class({
		Extends: Gelatin.View,

		options: {
			className: 'button',
			tagName: 'a',
			href: '#'
		},

		render: function(options) {
			this.setOptions(options);
			this.el = new Element(this.options.tagName, {
				id: this.options.id,
				'class': this.options.className,
				href: this.options.href
			});
			
			return this;
		}
	});

})(this);
