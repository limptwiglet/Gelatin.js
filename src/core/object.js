/**
 * Base class that allows observing of properties but only if properties 
 * are accessed via the provided get and set methods
 */
var Obj = Gelatin.Object = new Class({
	// TODO: Remove meta properties this shouldnt be needed especially
	// for hasChanged
	meta: {
		hasChanged: false
	},

	/**
	 * Constructor function accepts properties that you want to set
	 * when creating the object
	 */
	initialize: function (props) {
		Object.append(this, props);
		this._prevAttrs = {};

		return this;
	},

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
	 * @param {Boolean} - Slient flag
	 */
	setProperties: function (obj, silent) {
		var keys = Object.keys(obj);

		keys.each(function (key) {
			this.set(key, obj[key], true);	
		}.bind(this));
	},


	addObserver: function (key, fn) {
		Gelatin.addObserver(this, key, fn);
	},

	/**
	 * Triggers event handlers for the passed in keys
	 *
	 * @params {String} - Keys to trigger events for
	 */
	triggerChange: function () {
		var keys = Array.from(arguments);

		keys.each(function (key) {
			var name = 'change:'+key;

			if (name in this.$events) {
				// TODO: This is stupid, need to change this to native moo 
				// event triggering
				this.$events[name].each(function (e) {
					e(key, this.get(key), get(this, '_prevAttrs.'+key));
				}.bind(this));
			}
		}.bind(this));
	}
});

