Gelatin.View = new Class({
	Implements: [Options],

	options: {
		tagName: 'div',
		id: ''
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

		return this;
	},

	remove: function() {			
		this.el.dispose();

		return this;
	},

	inject: function(root) {		
		this.el.inject(root);

		return this;
	}
});

Gelatin.View.Button = new Class({
	Extends: Gelatin.View,

	options: {
		className: 'button',
		tagName: 'a',
		href: '#'
	},

	render: function(options) {
		this.setOptions(options);
		this.el = new Element(this.options.tagName, {
			id: this.options.id,
			'class': this.options.className,
			href: this.options.href
		});
		
		return this;
	}
});

