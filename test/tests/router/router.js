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
			'/project/:id': function (id) {
				expect(id).to.exist;
				expect(id).to.eql('1');

				done();
			}
		});

		router.check('/project/1');
	});


	it('should find the first matching route', function (done) {
		var router = new Gelatin.Router({
			'/project/:id': function (id) {
				expect(id).to.exist;
				expect(id).to.eql('1');
				done();
			},

			'/projects/:id': function () {
				throw new Error('Should not have found this route');
			}
		});

		router.check('/project/111');
	});
});
