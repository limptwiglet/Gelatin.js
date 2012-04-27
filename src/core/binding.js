Gelatin.binding = function (o) {
	var from = Gelatin.binding.getPathToProperty(o.from, o.fromContext);
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

Gelatin.binding.getPathToProperty = function (target, context) {
	var ret = {obj: context, property: target};

	if (!context) {
		var parts = target.split('.');
		ret.property = parts.pop();
		ret.obj = getPath(parts.join('.'));
	}

	return ret;
};
