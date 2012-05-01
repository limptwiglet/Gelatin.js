var escapeMatch = /\//g;
var paramMatch = /\:(\w+)/;

/**
 * Gelatin.Router class is used for application routing
 *
 * new Gelatin.Router({
 *     '/projects': {
 *			on: function () {
 *				// Run this when the route matches
 *			},
 *
 *			after: function () {
 *				// Run this when this route leaves
 *			},
 *
 *			'/:id': {
 *				on: function() {},
 *				after: function () {}
 *			}
 *     }
 * });
 */

Gelatin.Router = new Class({
	Implements: [Options, Events],

	options: {},

	initialize: function (routes, options) {
		this.currentRoute = null;
		this.routes = routes;
	},

	check: function (url) {
		var match = this.match(url);
	},

	match: function (url) {
		var urlParts = url.replace('/', '').split('/');

		for (var r in this.routes) {
			var route = r.replace(/:\w+/g, '([^\/]+)');

			var match = url.match(new RegExp(route));

			if (!match) {
				continue;
			}

			if (match[0] === url) {
				this.callRoute(this.routes[r], match.slice(1));
			}
		}
	},

	callRoute: function(route, params) {
		var fns = [];

		if (typeOf(route) === 'function') {
			fns.push(route);
		} else if (typeOf(route) === 'array') {
			fns = fns.concat(route);	
		} else if (route.on !== undefined) {
			fns.push(route.on);
		}

		for (var i = 0, l = fns.length; i < l; i++) {
			this.currentRoute = route;
			fns[i].apply(this, params);
		}
	}
});
