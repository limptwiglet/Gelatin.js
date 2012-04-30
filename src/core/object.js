/**
 * Base class that allows observing of properties but only if properties 
 * are accessed via the provided get and set methods
 */
var Obj = Gelatin.Object = new Class({
	Implements: Options,

	options: {
		bindings: {}
	},

	/**
	 * Constructor function accepts properties that you want to set
	 * when creating the object
	 */
	initialize: function (props, options) {
		this.setOptions(options);
		Object.append(this, props);

		this.initBindings(this.options.bindings);

		this.init();

		return this;
	},

	/**
	 * Sets up any bindings defined in the options object
	 */
	initBindings: function (bindings) {
		Object.each(bindings, function (path, key) {
			Gelatin.binding({ from: path, to: key, toContext: this});
		}.bind(this));
	},


	/**
	 * init function is an overridable method that is called once object 
	 * initialization is done
	 */
	init: function () {},

	/**
	 * Returns a property set on this class
	 *
	 * @param {String} - The property to get
	 * @return {Mixed} - The value of the property
	 */
	get: function (key) {
		return get(this, key);
	},

	
	/**
	 * This should be a no-op function in most cases
	 */
	getUnknown: function (key) {
		return undefined;
	},

	/**
	 * Set the property and triggers event listeners
	 *
	 * @param {String} - Property name to set
	 * @param {Mixed} - The value you wish to set the property to
	 * @param {Boolean} - Silent makes the change not trigger listeners
	 */
	set: function (key, value, silent) {
		return set(this, key, value);
	},

	/**
	 * Convinence method for setting multiple properties defined in a object 
	 * by iterating over the object keys callong set
	 *
	 * @param {Object} - A hash of properties and values to set
	 */
	setProperties: function (obj) {
		var keys = Object.keys(obj);

		keys.each(function (key) {
			this.set(key, obj[key]);	
		}.bind(this));
	},

	/**
	 * Convenience method for adding an observer to this object
	 *
	 * @key {String} - The key to observer
	 * @fn {Function} - The observer function
	 */
	addObserver: function (key, fn) {
		Gelatin.addObserver(this, key, fn);
	},

	destroy: function () {
		Gelatin.removeObservers(this);
	}
});

