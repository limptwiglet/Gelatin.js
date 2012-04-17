(function () {
	var root = this;

	Class.Mutators.Static = function (items) {
		this.extend(items);
	};


	Object.implement('equal', function (a, b) {
		if (typeOf(a) !== typeOf(b)) return false;

		var aKeys = Object.keys(a);
		var bKeys = Object.keys(b);

		if (aKeys.length !== bKeys.length) return false;

		var i = aKeys.length;

		while (i--) {
			if (bKeys.indexOf(aKeys[i]) !== -1) {
				if (typeOf(a[aKeys[i]]) !== 'object') {
					if (a[aKeys[i]] !== b[bKeys[i]])
						return false;
				} else {
					if (!Object.equal(a[aKeys[i]], b[aKeys[i]]))
						return false;
				}
			} else {
				return false;
			}
		}

		return true;
	});



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

			if (typeOf(value) === 'computedproperty') {
				value = value.get(obj, key);
			}
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

		if (typeOf(prop) === 'computedproperty') {
			return prop.set(obj, key, value);
		}

		return obj[key] = value;
	};


	var ComputedProperty = Gelatin.ComputedProperty = new Class({
		initialize: function (func) {
			this.func = func;
		},

		get: function (obj, key) {
			return this.func.call(obj, key);		
		},

		set: function (obj, key, value) {
			return this.func.call(obj, key, value);
		}
	});
	new Type('ComputedProperty', ComputedProperty);

	Function.implement('computed', function () {
		var props = Array.from(arguments);

		var cp = new ComputedProperty(this);

		return cp;
	});



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
			this.modelArrays = {};
			this.dirtyRecords = {};
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
					id2Cid: {},
					cIds: [],
					modelArrays: []
				};
			}
		},

		save: function () {
			var transport = this.options.transport;

			if (transport.create) {
				Object.each(this.newRecords, function (m, cId) {
					transport.create(this, m);
				}.bind(this));
			}

			if (transport.update) {
				Object.each(this.dirtyRecords, function (m, cId) {
					transport.update(this, m);
				}.bind(this));
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
			set(m, 'store', this);
			m.addEvent('change', this.modelAttributeChange.bind(this, m));

			if (id) {
				modelMap.id2Cid[id] = cId;
				modelMap.cIds.push(cId);
				set(m, 'isNew', false);
			} else {
				set(this.newRecords, cId, m);
			}

			this.updateModelArrays(Model, cId);

			return this.records[cId] = m;
		},


		didCreate: function (model, data) {
			var cId = get(model, 'cId');
			var pk = get(model, 'primaryKey');
			var id = get(data, pk);

			model.setProperties(data, true);

			if (id) {
				model.set('isNew', false);
			}

			delete this.newRecords[cId];
		},

		didUpdate: function (model, data) {
			var cId = get(model, 'cId');
			delete this.dirtyRecords[cId];

			if (data) {
				model.setProperties(data);
			}

			model.set('isDirty', false);
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

		query: function(Model, query) {
			var modelMap = this.getModelMap(Model);	
			var transport = this.options.transport;

			if (transport && transport.query) {
				var array = new Gelatin.ModelArray();
				transport.query(this, Model, query, array);
				return array;
			}
			return false;
		},

		filter: function (Model, filter) {
			var array = new Gelatin.ModelArray();
			set(array, 'filter', filter);
			this.addModelArray(Model, array);
			return array;
		},

		findAll: function (Model) {
			var modelMap = this.getModelMap(Model);

			if (modelMap.all) return modelMap.all;

			var array = new Gelatin.ModelArray();

			this.addModelArray(Model, array);

			modelMap.all = array;

			var transport = this.options.transport;

			if (transport && transport.findAll) {
				transport.findAll(this, Model);
			}

			return array;
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
			modelMap.cIds.push(cId);

			m.set('isLoaded', true);
			this.updateModelArrays(Model, cId);
			return m;
		},

		loadMany: function (Model, ids, datas) {
			var models = [];
			ids.each(function (id, i) {
				var m = this.load(Model, id, datas ? datas[i] : undefined);
				models.push(m);
			}.bind(this));
			return models;
		},

		updateModelArrays: function (Model, cId) {
			var modelMap = this.getModelMap(Model);
			var m = get(this.records, cId);

			modelMap.modelArrays.each(function (array) {
				var filter = get(array, 'filter');

				var inArray = array.indexOf(m) !== -1;
				var add = false;

				if (!filter || filter(m)) {
					add = true;
				}

				if (add && !inArray) {
					array.push(m);
				} else if (!add && inArray) {
					array.remove(m);	
				}
			}.bind(this));
		},

		addModelArray: function(Model, array) {
			var modelMap = this.getModelMap(Model);
			modelMap.modelArrays.push(array);

			modelMap.modelArrays.each(function (array) {
				var filter = get(array, 'filter');

				for (var i = 0; i < modelMap.cIds.length; i++) {
					var m = get(this.records, modelMap.cIds[i])
					var inArray = array.indexOf(m) !== -1;
					var add = false;

					if (!filter || filter(m)) {
						add = true;
					}

					if (add && !inArray) {
						array.push(m);
					} else if (!add && inArray) {
						array.remove(m);	
					}
				}
			}.bind(this));
		},

		modelAttributeChange: function (model, key, value, old) {
			if (key in model.attributes) {
				var cId = get(model, 'cId');
				model.set('isDirty', true);
				set(this.dirtyRecords, cId, model);
			}
		}
	});
	new Type('Store', Gelatin.Store);


	Gelatin.Model = new Class({
		Extends: Gelatin.Object,

		primaryKey: 'id',

		cId: null,

		id: null,

		isLoaded: false,
		isNew: true,
		isDirty: false,
		store: null,

		// Hash containing model attributes
		attributes: {},

		data: function () {

		},

		deleteRecord: function () {

		}
	});
	new Type('Model', Gelatin.Model);


	Gelatin.ModelArray = new Class({
		Extends: Gelatin.Object,

		initialize: function () {
			this.parent();
			this.models = Array.from(arguments);
			this.length = this.models.length;
		}
	});

	Gelatin.ModelArray.implement({
		indexOf: function (model) {
			var models = this.get('models');
			return models.indexOf(model);
		},

		remove: function (model) {
			var models = this.get('models');
			models.splice(models.indexOf(model), 1);
			this.set('models', models);
		},

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
