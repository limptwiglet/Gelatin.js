(function () {
	var root = this;

	// Setup our Gelatin namespace
	var Gelatin = root.Gelatin = {};

	var get = Gelatin.get = function (obj, key) {
		var value = obj[key];

		if (typeOf(value) === 'object') {
			value = value.get(obj, key);
		}

		return value;
	};


	Gelatin.set = function (obj, key, value) {
		var prop = obj[key];

		if (typeOf(prop) === 'object') {
			return prop.set(obj, key, value);
		}

		obj[key] = value;
	};


	Gelatin.ComputedProperty = new Class({
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

	Gelatin.computed = function () {
		var computed = new Gelatin.ComputedProperty(arguments[0]);
		return computed;
	};
})(this);
