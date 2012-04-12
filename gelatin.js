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

		$name: 'Store',	
		
		options: {
			adapter: null
		},

		initialize: function(options) {
			this.setOptions(options);	

			this.records = {};
			this.newRecords = {};
			this.dirtyRecords = {};
			this.typeMap = {};
		},

		typeMapFor: function (model) {
			var	typeId = get(model, '_typeId');

			if (!typeId) {
				typeId = String.uniqueID();
				set(model, '_typeId', typeId);
			}

			var typeMap = this.typeMap[typeId];

			if (typeMap) {
				return typeMap;
			} else {
				return this.typeMap[typeId] = {
					idToCid: {}
				};
			}
		},

		load: function (model, id, data) {
			var typeMap = this.typeMapFor(model);

			console.log(this.records[typeMap.idToCid[id]]);

		},

		createRecord: function(type, data) {
			var typeMap = this.typeMapFor(type);
			var cId = getCid();

			var model = new type({
				store: this
			});

			model.set('cId', cId);
			model.set('isNew', true);

			model.addEvent('change', this._modelChanged.bind(this, model));

			this.newRecords[cId] = this.records[cId] = model;

			if (data)
				model.setProperties(data);

			var id = model.get('id');

			if (id) {
				typeMap.idToCid[id] = cId;
			}

			return model;
		},

		_modelChanged: function (model, key, value) {
			var cId = get(model, 'cId');
			var record = get(this.records, cId);

			if (!key in model.attributes)
				return;

			model.set('isDirty', true);

			if (!(cId in this.dirtyRecords)) {
				set(this.dirtyRecords, cId, record);
			}
		},

		find: function (model, id) {
			var typeMap = this.typeMapFor(model);

			if (id in typeMap.idToCid) {
				return this.records[typeMap.idToCid[id]];
			} else {
				var cId = String.uniqueID();
				var m = new model({
					store: this,
					cId: cId	
				});
				typeMap.idToCid[id] = cId;
				this.records[cId] = m;
				this.options.adapter.find(this, model, id);
				return m;
			}
		},

		commit: function () {
			this._createRecords();
			this._updateRecords();			
		},

		_createRecords: function () {
			var records = get(this, 'newRecords');
			var adapter = this.options.adapter;

			Object.each(records, function (model) {
				adapter.createRecord(this, model.$constructor, model);
			}.bind(this));
		}.protect(),


		didCreateRecord: function (model, data) {
			var typeMap = this.typeMapFor(model.$constructor);
			var cId = get(model, 'cId');
			var pk = get(model, 'primaryKey');
			var id = get(data, pk);
			set(model, 'id', id);

			typeMap.idToCid[id] = cId;

			if (data) {
				this._setHash(model, data);
			}
		},

		_updateRecords: function () {
			var records = get(this, 'dirtyRecords');
			var adapter = this.options.adapter;

			Object.each(records, function (model) {
				adapter.updateRecord(this, model.$constructor, model);
			}.bind(this));
		}.protect(),


		didUpdateRecord: function (model, data) {
			var cId = get(model, 'cId');

			delete this.dirtyRecords[cId];

			if (data) {
				this._setHash(model, data);
			}
		},

		_setHash: function (model, data) {
			var attrs = get(model, 'attributes');

			data = Object.filter(data, function (value, key) {
				return key in attrs;
			});

			model.setProperties(data);
		}
	});
	new Type('Store', Gelatin.Store);


	Gelatin.Model = new Class({
		Extends: Gelatin.Object,

		primaryKey: 'id',

		isNew: false,
		isDirty: false,

		// Server side id
		id: null,

		// Client side id
		cId: null,

		// The store this model belongs to
		store: null,

		// Attributes hash contains attributes
		attributes: {},

		initialize: function () {
			this.parent.attempt(Array.from(arguments), this);
			this.hash = {};
		}
	});
	new Type('Model', Gelatin.Model);


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
