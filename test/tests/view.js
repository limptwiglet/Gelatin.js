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

	it('should inject into target and be removed from DOM', function (done) {
		var view = new Gelatin.View({
			id: 'test2'
		});

		view.el.inject(document.body);
		view.el.dispose();
		
		expect($('test2')).to.not.exist;
		done();		
		
	});

	it('should inject into target and be removed from DOM with the instance still existing', function (done) {
		var view = new Gelatin.View({
			id: 'test3'
		});

		view.el.inject(document.body);
		view.el.dispose();
		
		expect(view).to.exist;
		done();		
		
	});

	it('should chain injecting and removing the element using helper methods', function (done) {
		var view = new Gelatin.View({
			id: 'test4'
		});

		view.inject(document.body).remove();
		
		expect($('test4')).to.not.exist;
		done();		
		
	});

	it('create an instance of button and inject it', function (done) {
		var button = new Gelatin.View.Button({});

		button.inject(document.body);

		expect($$('a.button')[0]).to.exist;
		done();
	});
});
