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

			if (typeOf(value) === 'object' && 'get' in value) {
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

		meta: {
			hasChanged: false
		},

		initialize: function (props) {
			Object.append(this, props);
			this._prevAttrs = {};
		},

		get: function (key) {
			return get(this, key);
		},

		getUnknown: function (key) {
			if (key in this.meta) {
				return get(this.meta, key);
			}
			return undefined;
		},

		set: function (key, value, silent) {
			var oldValue = this.get(key);

			if (oldValue !== value) {
				value = set(this, key, value);
				this._prevAttrs[key] = oldValue;

				if (silent == undefined || silent != true) {
					this.fireEvent('change', [key, value, oldValue]);
					this.triggerChange('hasChanged', key);
				}
			}

			return value;
		},

		triggerChange: function () {
			var keys = Array.from(arguments);

			keys.each(function (key) {
				var name = 'change:'+key;

				if (name in this.$events) {
					this.$events[name].each(function (e) {
						e(key, this.get(key), this._prevAttrs[key]);
					}.bind(this));
				}
			}.bind(this));
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
