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

		obj[key] = value;

		triggerObservers(obj, key);

		return obj[key];
	};


	var Observerable = new Class({
		Extends: Events,
		_previousAttributes: {}
	});


	var hasObservers = function (obj) {
		return typeOf(obj['$events']) == 'object';
	};

	var addObserver = Gelatin.addObserver = function (obj, key, fn) {
		if (!hasObservers(obj)) {
			Object.append(obj, new Observerable);

			if (key !== '*')
				obj._previousAttributes[key] = get(obj, key);
		}

		obj.addEvent((key === '*' ? key : 'change:' + key), fn);
	};

	var triggerObservers = Gelatin.triggerObservers = function (obj, key) {
		if (!hasObservers(obj)) return false;

		var old = obj._previousAttributes[key];
		var value = get(obj, key);

		if (old !== value) {
			obj._previousAttributes[key] = value;
			obj.fireEvent('*', [key, value, old]);
			obj.fireEvent('change:' + key, [key, value, old]);
		}
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
		},

		
		/**
		 * This should be a no-op function in most cases
		 */
		getUnknown: function (key) {
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
			return set(this, key, value);
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
		},


		addObserver: function (key, fn) {
			addObserver(this, key, fn);
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

	var Enumerable = Gelatin.Enumerable = new Class({
		each: function (fn) {
			var content = get(this, 'content');
			content.each(fn.bind(this));
		},

		getEach: function (key) {
			var content = get(this, 'content');

			return content.map(function (item) {
				return get(item, key);
			});
		},

		push: function (item) {
			var content = get(this, 'content');
			content.push(item);
			set(this, 'content', content);
		},

		indexOf: function (item) {
			return this.content.indexOf(item);
		},

		remove: function (item) {
			var idx = this.indexOf(item);
			var content = get(this, 'content');

			content.splice(idx, 1);
			set(this, 'content', content);
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
			this.destroyRecords = {};
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

			if (transport && transport.create) {
				Object.each(this.newRecords, function (m, cId) {
					transport.create(this, m);
				}.bind(this));
			}

			if (transport && transport.update) {
				Object.each(this.dirtyRecords, function (m, cId) {
					transport.update(this, m);
				}.bind(this));
			}

			// Destroy records marked for destruction
			var destroy = this.destroyRecords;
			
			Object.each(this.destroyRecords, function (m, cId) {
				if (transport && transport.destroy) {
					transport.destroy(this, m.$constructor, m);
				} else {
					this.didDestroy(m);
				}
			}.bind(this));
		},

		create: function (Model, data) {
			data = data || {};

			var id = data[Model.prototype.primaryKey];

			var modelMap = this.getModelMap(Model);

			var m = this.generateModel(Model, id, data);

			var cId = m.get('cId'); 

			if (id) {
				modelMap.id2Cid[id] = cId;
				modelMap.cIds.push(cId);
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

		destroy: function (Model, cId) {
			var modelMap = this.getModelMap(Model);
			var model = get(this.records, cId);
			
			set(this.destroyRecords, cId, model);
		},

		didDestroy: function (m) {
			var Model = m.$constructor;
			var modelMap = this.getModelMap(m.$constructor);
			var cId = get(m, 'cId');
			var id = get(m, get(m, 'primaryKey'));

			modelMap.cIds.splice(modelMap.cIds.indexOf(cId), 1);

			if (id) {
				delete modelMap.id2Cid[id];
			}

			set(m, 'store', null); // Detach the model from the store
			m.set('isDestroyed', true); // Mark the model as being destroyed
			this.updateModelArrays(Model, cId);
			this.records[cId] = undefined;
			delete this.records[cId];
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
				var m = this.generateModel(Model, id);
				set(m, 'isLoaded', false);

				if (this.options.transport)
					this.options.transport.find(this, Model, id);

				return m;
			}
		},

		generateModel: function (Model, id, data) {
			var modelMap = this.getModelMap(Model);

			var m = new Model(data);
			cId = set(m, 'cId', String.uniqueID());

			modelMap.id2Cid[id] = cId;
			modelMap.cIds.push(cId);

			set(m, 'isLoaded', true);
			set(m, 'store', this);

			var isNew = true;

			if (id && modelMap.id2Cid[id]) {
				isNew = false;
			}

			set(m, 'isNew', isNew);

			set(this.records, cId, m);

			m.addObserver('*', this.modelAttributeChange.bind(this, m));

			return m;
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
				m = this.generateModel(Model, id, data);
				cId = get(m, 'cId');
			} else {
				m = get(this.records, cId);
			}

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

				if (m.get('isDestroyed')) {
					add = false;
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

				this.updateModelArrays(model.$constructor, cId);
			}
		}
	});
	new Type('Store', Gelatin.Store);


	Gelatin.RESTTransport = new Class({
		Implements: [Options],

		options: {
			baseUrl: ''
		},

		initialize: function (options) {
			this.setOptions(options);
		},

		getUrl: function (Model, plural) {
			var url = Model.prototype.url;

			if (plural === true) {
				url+= 's';
			}

			url = this.options.baseUrl + url + '/';

			return url;
		},

		createRequest: function (options) {
			return new Request.JSON(options);
		},

		find: function (store, Model, id) {
			var options = {
				url: this.getUrl(Model) + id,

				onSuccess: function (data) {
				
				},

				onFailure: function () {
					console.log('here');
				}
			};

			var req = this.createRequest(options);

			req.send();
		},

		findAll: function (store, Model) {
			var req = new Request.JSON();

			var options = {
				url: this.getUrl(Model, true),

				onSuccess: function (data) {
						
				},

				onFailure: function () {
					console.log('here');
				}
			};

			req.setOptions(options);
			req.send();
		},

		query: function (store, Model, query, array) {
			var req = new Request.JSON();

			var options = {
				url: this.getUrl(Model, true),

				onSuccess: function (data) {
						
				},

				onFailure: function () {
					console.log('here');
				}
			};

			req.setOptions(options);
			req.get(query);
		},

		update: function (store, model) {

		},

		create: function (store, model) {

		},

		destroy: function (store, model) {

		}
	});


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
			var obj = {};

			for (var k in this.attributes) {
				obj[k] = get(this, k);
			}

			return obj;
		}.computed(),

		destroy: function () {
			var store = get(this, 'store');
			var cId = get(this, 'cId');

			if (store) {
				store.destroy(this.$constructor, cId);
			}
		}
	});
	new Type('Model', Gelatin.Model);


	Gelatin.ModelArray = new Class({
		Extends: Gelatin.Object,
		Implements: Enumerable,

		initialize: function () {
			this.parent();
			this.content = Array.from(arguments);
			this.length = this.content.length;
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
