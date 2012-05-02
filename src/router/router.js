var paramReg = /\:(\w+)/g;
var qsReg = /\?([^\/]+)/g;
var qsPartsReg = /([^\?=&]+)(=([^&]*))/;

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


	extractQueryString: function(qs) {
		var queryString = {};

		qs.replace(qsPartsReg, function ($1, $2, $3, $4) {
			queryString[$2] = $4; 
		});

		return queryString;
	},

	/**
	 * Checks the passed in url against the routing object
	 */
	match: function (url) {
		var qs = url.match(qsReg);

		for (var r in this.routes) {
			var routeParams = r.match(paramReg);
			var route = r.replace(paramReg, '([^\/]+)');

			var match = url.match(new RegExp(route));

			if (!match) {
				continue;
			}

			if (match[0] === url) {
				this.callRoute(this.routes[r], match.slice(1), routeParams);
			} else if (qs) {
				var qs = this.extractQueryString(qs[0]);
				this.callRoute(this.routes[r], match.slice(1), routeParams, qs);
			}
		}
	},

	callRoute: function(route, paramValues, paramNames, qs) {
		var fns = [];
		var paramObj = {
		};

		// Check if we have any param values so we can build the param object
		// to pass to the router function
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
			fns[i].call(this, paramObj, qs);
		}
	}
});
