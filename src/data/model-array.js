Gelatin.ModelArray = new Class({
	Extends: Gelatin.Object,
	Implements: Enumerable,

	initialize: function () {
		this.parent();
		this.content = Array.from(arguments);
		this.length = this.content.length;
	}
});
