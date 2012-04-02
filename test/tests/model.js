describe('Model', function () {
	it('should create model instances', function (done) {
		var model = new Gelatin.Model({});

		expect(model).to.exist;

		done();
	});
});
