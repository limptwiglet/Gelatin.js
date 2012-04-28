// Setup our Gelatin namespace
var Gelatin = {};

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

Function.implement('observer', function () {
});


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
