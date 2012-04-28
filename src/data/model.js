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

		this.parent();
	}
});
new Type('Model', Gelatin.Model);

