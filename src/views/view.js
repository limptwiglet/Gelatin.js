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
