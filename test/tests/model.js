describe('Model', function () {


	it('should observe all passed in properties', function (done) {
		var model = new Gelatin.Model({
			fname: 'Mark',
			lname: 'Gerrard'
		});

		expect(model._observers).to.have.property('fname');
		expect(model._observers.fname).to.have.length(1);
		expect(model._observers).to.have.property('lname');
		expect(model._observers.lname).to.have.length(1);
		done();
	});


	it('should be set as dirty when creating new model', function (done) {
		var model = new Gelatin.Model({
		});

		expect(model.isDirty).to.be.ok;
		expect(model.isClean).to.be.not.ok;
		done();
	});

	it('should change isDirty & isClean when data changes', function (done) {
		var model = new Gelatin.Model({
			fname: 'Test'
		});

		model.isDirty = false;
		model.isClean = true;

		model.set('fname', 'test');
		expect(model.isDirty).to.be.ok;
		expect(model.isClean).to.be.not.ok;

		done();
	});
});
