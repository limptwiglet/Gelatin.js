(function() {//Class.Mutators.Bindings = function (items) {
	//Object.each(items, function (path, prop) {
		//path = path.split('.');
		//var targEnd = path.pop();
		//path = path.join('.');

		//var targ = getPath(path);

		//Gelatin.addObserver(targ, targEnd, function (key, value) {
			//console.log(this);
			//Gelatin.set(this, 'change', 'YUS');
		//}.bind(this));
	//}.bind(this));
//};

// Setup our Gelatin namespace
var Gelatin = this.Gelatin = {};

/**
 * Returns the path to a given dot seperated string
 *
 * @param {String} - The path to the property
 * @param {Object} - The context to search from, the default is window
 */
var getPath = Gelatin.getPath = function (path, context) {
	context = context || window;	
	path =  path.split('.');

	var root = context;

	while(path.length) {
		root = get(root, path.shift());

		if (root === undefined) path = [];
	}

	return root;
};

/**
 * Returns the property on the passed object
 *
 * @param {Object} - The object to get the property from
 * @param {String} - The path or property to get
 * @return Returns the property
 */
var get = Gelatin.get = function (obj, key) {
	var value;

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

/**
 * Sets a properties value
 *
 * @param {Object} - The target object
 * @param {String} - Key name of the property we are settings
 * @param {Mixed} - The value
 */
var set = Gelatin.set = function (obj, key, value) {
	var oldValue = get(obj, key);

	if (oldValue === undefined) {
		if (typeOf(obj.setUnknown) === 'function') {
			obj.setUnknown(key, value);
		} else {
			obj[key] = value;
		}
	} else if (typeOf(obj[key]) === 'computedproperty') {
		obj[key].set(obj, key, value);
	} else {
		obj[key] = value;
	}

	var newValue = get(obj, key);

	Gelatin.checkObservers(obj, key, newValue, oldValue);

	return newValue;
};

Gelatin.observers = {};

Gelatin.checkObservers = function (obj, key, newValue, oldValue) {
	if (newValue === oldValue) return;

	var objId = get(obj, '_observerId');
	var observers = get(Gelatin.observers, objId);

	if (!observers) return;

	if (observers[key])
		Gelatin.notifyObservers(obj, observers[key], key, newValue, oldValue);

	if (observers['*'])
		Gelatin.notifyObservers(obj, observers['*'], key, newValue, oldValue);
};

Gelatin.notifyObservers = function (obj, observers, key, newValue, oldValue) {
	var i = 0, l = observers.length, observer;

	for (; i < l; i++) {
		var observer = observers[i];
		observer.call(obj, key, newValue, oldValue);
	}
};

Gelatin.addObserver = function (obj, key, fn) {
	var objId = get(obj, '_observerId');

	if (!objId) {
		objId = set(obj, '_observerId', String.uniqueID());
		observers = set(Gelatin.observers, objId, {'*': []});
	} else {
		observers = get(Gelatin.observers, objId);
	}

	if (!observers[key]) {
		observers[key] = [];
	}

	observers[key].push(fn);
};


Gelatin.removeObservers = function (obj, key, fn) {
	var objId = get(obj, '_observerId');

	if (!key) {
		delete Gelatin.observers[objId]
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
 * Enumerable mixin 
 */
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

	setEach: function () {

	},

	push: function (item) {
		var content = get(this, 'content');
		content = content.slice();
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
		content = content.slice();
		set(this, 'content', content);
	}
});

/**
 * Base class that allows observing of properties but only if properties 
 * are accessed via the provided get and set methods
 */
var Obj = Gelatin.Object = new Class({
	Implements: Options,

	options: {
		bindings: {}
	},

	/**
	 * Constructor function accepts properties that you want to set
	 * when creating the object
	 */
	initialize: function (props, options) {
		this.setOptions(options);
		Object.append(this, props);

		this.initBindings(this.options.bindings);

		this.init();

		return this;
	},

	/**
	 * Sets up any bindings defined in the options object
	 */
	initBindings: function (bindings) {
		Object.each(bindings, function (path, key) {
			Gelatin.binding({ from: path, to: key, toContext: this});
		}.bind(this));
	},


	/**
	 * init function is an overridable method that is called once object 
	 * initialization is done
	 */
	init: function () {},

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
	 */
	setProperties: function (obj) {
		var keys = Object.keys(obj);

		keys.each(function (key) {
			this.set(key, obj[key]);	
		}.bind(this));
	},

	/**
	 * Convenience method for adding an observer to this object
	 *
	 * @key {String} - The key to observer
	 * @fn {Function} - The observer function
	 */
	addObserver: function (key, fn) {
		Gelatin.addObserver(this, key, fn);
	},

	destroy: function () {
		Gelatin.removeObservers(this);
	}
});


var binding = Gelatin.binding = function (o) {
	var from = binding.getPathToProperty(o.from, o.fromContext);
	var to = Gelatin.binding.getPathToProperty(o.to, o.toContext);

	set(to.obj, to.property, get(from.obj, from.property));

	Gelatin.addObserver(from.obj, from.property, function (key, value) {
		set(to.obj, to.property, value);
	});

	if (!o.oneWay) {
		Gelatin.addObserver(to.obj, to.property, function (key, value) {
			set(from.obj, from.property, value);
		});
	}
};

binding.getPathToProperty = function (target, context) {
	var ret = {obj: context, property: target};

	if (!context) {
		var parts = target.split('.');
		ret.property = parts.pop();
		ret.obj = getPath(parts.join('.'));
	}

	return ret;
};

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

		Gelatin.addObserver(m, '*', this.modelAttributeChange.bind(this, m));

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

		if (m === undefined) return;

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

	initialize: function (props, options) {
		props = this.initData(props || {});
		this.parent(props, options);
	},

	initData: function (data) {
		var def;

		for (var key in this.attributes) {
			def = this.attributes[key];

			if (typeOf(def) === 'object' && def.value) {
				def = def.value;
			}

			if (!(key in data)) {
				data[key] = def;	
			}
		}

		return data;
	},

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

		this.parent();
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

var View = Gelatin.View = new Class({
	Extends: Gelatin.Object,

	options: {
		tag: 'div',
		attributes: {},

		events: { }
	},

	hasRendered: false,

	inject: function () {
		this.render();
		this.el.inject.apply(this.el, Array.from(arguments));
	},

	_render: function () {
		if (get(this, 'hasRendered')) return;

		this.el = new Element(this.options.tag, this.options.attributes);

		Object.each(this.options.events, function (value, key) {
			this.el.addEvent(key, this[value].bind(this));
		}.bind(this));

		set(this, 'hasRendered', true);
	},

	render: function () {
		this._render();
	},

	destroy: function () {
		this.el.destroy();		
		this.parent();
	}
});


var CollectionView = Gelatin.CollectionView = new Class({
	Extends: View,

	childViews: [],

	initialize: function (props, options) {
		this.parent(props, options);
		this.addObserver('content', this._contentChange.bind(this));
	},

	_contentChange: function (key, newValue, oldValue) {
		var views = this.childViews;

		while(views.length) {
			views.pop().destroy();
		}

		this._renderItems();
	},

	_renderItems: function () {
		var items = get(this, 'content');
		
		items.each(function (item) {
			this.childViews.push(this._renderItem(item));
		}.bind(this));
	},

	_renderItem: function (item) {
		var view = new this.options.itemView({ content: item });
		view.inject(this.el);

		return view;
	},

	_render: function () {
		this.parent();	
		this._renderItems();
	}
});
})();