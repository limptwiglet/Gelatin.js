describe('Router', function () {
	it('should initialize a new router', function (done) {
		var router = new Gelatin.Router();

		expect(router).to.exist;
		done();
	});

	it('should match routes', function (done) {
		var router = new Gelatin.Router({
			'/projects': function () {
				done();
			}
		});

		router.check('/projects');
	});

	it('should pass along name parameters ie /projects/:id', function (done) {
		var router = new Gelatin.Router({
			'/project/:id': function (params) {
				expect(params.id).to.exist;
				expect(params.id).to.eql('1');

				done();
			}
		});

		router.check('/project/1');
	});


	it('should call all routing functions for a give route', function (done) {
		var c = 0;
		var fns = [
			function (params) {
				expect(params.id).to.exist;
				check();
			},
			function (params) {
				expect(params.id).to.exist;
				check();
			}
		];

		var check = function () {
			if (++c == fns.length) 
				done();
		};

		var router = new Gelatin.Router({
			'/project/:id': fns
		});

		router.check('/project/10');
	});


	it('should return all given parameters', function (done) {
		var i = '10';
		var p = 'test';
		var router = new Gelatin.Router({
			'/project/:id/:page': function (params) {
				expect(params.id).to.eql(i);	
				expect(params.page).to.eql(p);	
				done();
			}
		});
		router.check('/project/' + i + '/'+ p);
	});

	it('should return query string parameters as an object', function (done) {
		var router = new Gelatin.Router({
			'/project': function () {
				done();
			}
		});
		router.check('/project/?test=test');
	});
});
