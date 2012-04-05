describe('Model', function () {
	var MyModel = new Class({
		Extends: Gelatin.Model,

		defaults: {
			name: 'Mark',
			age: 20
		}
	});

	it('should mark a new record as being dirty', function (done) {
		var model = new MyModel();

		expect(model.get('isDirty')).to.be.ok;

		done();
	});


	it('should create data with defaults', function (done) {
		var model = new MyModel({name: 'Bill'});

		expect(model.get('name')).to.eql('Bill');
		expect(model.get('age')).to.eql(20);

		done();
	});

	it('should get a unique client id', function (done) {
		var model1 = new MyModel();
		var model2 = new MyModel();

		expect(model1.get('cId')).to.not.eql(model2.get('cId'));

		done();
	});

	it('should return a clean data object', function (done) {
		var model = new MyModel({});

		expect(model.get('data')).to.eql(MyModel.defaults);
		done();
	});
});
