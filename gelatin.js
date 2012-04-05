(function () {
	var root = this;

	// Setup our Gelatin namespace
	var Gelatin = root.Gelatin = {};


	/**
	 * Generates a uniqui id
	 *
	 * @param {String} - Prefix the id
	 */
	var curCid = 0;
	var getCid = function (prefix) {
		var id = curCid++;
		return prefix ? prefix + id : id;
	};


	/**
	 * Returns the property at the given path
	 *
	 * @param {Object} - The object to get the property from
	 * @param {String} - The path or property to get
	 * @return Returns the property
	 */
	var get = Gelatin.get = function (obj, key) {
		var path = ~key.indexOf('.') ? key.split('.') : false;

		if (path) {
			var root = obj;

			while(path.length) {
				root = get(root, path.shift());
			}

			return root;
		}

		var value = obj[key];

		if (typeOf(value) === 'object' && 'get' in value) {
			value = value.get(obj, key);
		}

		return value;
	};


	var set = Gelatin.set = function (obj, key, value) {
		var prop = obj[key];

		if (typeOf(prop) === 'object') {
			return prop.set(obj, key, value);
		}

		return obj[key] = value;
	};


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

	var Obj = Gelatin.Object = new Class({
		Implements: [Events],

		_observers: {},

		initialize: function (props) {
			Object.append(this, props);

			this.addEvent('prop:change', this.triggerObservers.bind(this, 'change'));
		},

		get: function (key) {
			return get(this, key);
		},

		addObserver: function (key, func) {
			if (typeOf(key) === 'array') {
				key.each(function (k) {
					this.addObserver(k, func);
				}.bind(this));

				return;
			}

			this._observers[key] = this._observers[key] || [];
			this._observers[key].push(func);
		},

		removeObserver: function (key, func) {
			var o = this._observers[key];

			if (!o) return;

			var l = o.length, i = 0;

			for (; i < l; i++) {
				if (o[i] === func) {
					o.splice(i, 1);
				}
			}
		},

		triggerObservers: function (type, key, value) {
			var o = this._observers[key];

			if (!o) return;

			var l = o.length, i = 0;

			if (l) {
				for (; i < l; i++) {
					o[i].call(this, type, key, value);
				}
			}
		},

		set: function (key, value) {
			var oldValue = this.get(key);

			if (oldValue !== value) {
				value = set(this, key, value);
				this.fireEvent('prop:change', [key, value]);
			}

			return value;
		}
	});

	Gelatin.Model = new Class({
		Extends: Obj,

		isDirty: true,
		isClean: false,

		cId: getCid(),

		initialize: function (props) {
			this.parent(props);
			this.addObserver(Object.keys(props), this._dataChange.bind(this));
		},

		_dataChange: function (type, key, value) {
			this.set('isDirty', true);
			this.set('isClean', false);
		}
	});


	Gelatin.View = new Class({
		Implements: [Options],

		options: {
			tagName: 'div',
			id: 'test'
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
		}
	});
})(this);
