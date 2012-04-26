Gelatin.Binding = new Class({
	Implements: Options,

	options: {
		oneWay: false,

		fromContext: null,
		from: '',

		to: '',
		toContext: null
	},

	initialize: function (options) {
		this.setOptions(options);

		this.setupObservers();
	},

	setupObservers: function () {
		var o = this.options;

		var from = this.getPathToProperty(o.from, o.fromContext);
		var to = this.getPathToProperty(o.to, o.toContext);

		Gelatin.addObserver(from.obj, from.property, function (key, value) {
			set(to.obj, to.property, value);
		});

		if (!o.oneWay) {
			Gelatin.addObserver(to.obj, to.property, function (key, value) {
				set(from.obj, from.property, value);
			});
		}
	},

	getPathToProperty: function(target, context) {
		var ret = {obj: context, property: target};

		if (!context) {
			var parts = target.split('.');
			ret.property = parts.pop();
			ret.obj = getPath(parts.join('.'));
		}

		return ret;
	}
});
