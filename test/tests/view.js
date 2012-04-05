describe('View', function () {
	it('should create an instance of view', function (done) {
		var view = new Gelatin.View({});		

		expect(view).to.exist;
		done();
	});

	it('should render an element', function (done) {
		var view = new Gelatin.View({});		

		expect(view.el).to.exist;
		done();
	});

	it('should inject into target', function (done) {
		var view = new Gelatin.View({
			id: 'test'
		});

		view.el.inject(document.body);

		expect($('test')).to.exist;
		done();
	});
});
