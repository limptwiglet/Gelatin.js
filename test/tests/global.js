var expect = chai.expect;

describe('global gelatin helpers and classes', function () {
	describe('BaseClass', function () {
		it('should have get and set methods', function (done) {
			var base = new Gelatin.Base({});

			expect(base).to.have.property('get');
			expect(base).to.have.property('set');
			done();
		});
	});
});
