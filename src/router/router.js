var escapeMatch = /\//g;
var paramMatch = /\:(\w+)/;

/**
 * Gelatin.Router class is used for application routing
 *
 */

Gelatin.Router = new Class({
	Implements: [Options, Events],

	options: {},

	initialize: function (routes, options) {
		this.currentRoute = null; // Marks which route is currently active
		this.routes = routes;
	},

	check: function (url) {
		var match = this.match(url);
	},

	/**
	 * Checks the passed in url against the routing object
	 */
	match: function (url) {
		for (var r in this.routes) {
			var routeParams = r.match(/:(\w+)/g);
			var route = r.replace(/:\w+/g, '([^\/]+)');

			var match = url.match(new RegExp(route));

			if (!match) {
				continue;
			}

			if (match[0] === url) {
				this.callRoute(this.routes[r], match.slice(1), routeParams);
			}
		}
	},

	callRoute: function(route, paramValues, paramNames) {
		var fns = [];
		var paramObj = {};

		if (paramValues) {
			for (var i = 0, l = paramValues.length; i < l; i++) {
				if (paramNames[i]) {
					paramObj[paramNames[i].replace(':', '')] = paramValues[i];
				}
			}
		}

		if (typeOf(route) === 'function') {
			fns.push(route);
		} else if (typeOf(route) === 'array') {
			fns = fns.concat(route);	
		} else if (route.on !== undefined) {
			fns.push(route.on);
		}

		for (var i = 0, l = fns.length; i < l; i++) {
			this.currentRoute = route;
			fns[i].call(this, paramObj);
		}
	}
});
