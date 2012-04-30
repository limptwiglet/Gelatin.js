describe('Model', function () {
	var MyModel = new Class({
		Extends: Gelatin.Model,

		attributes: {
			name: 'Bill',
			age: { value: 2 }
		}
	});

	it('should be able to create a model instance', function (done) {
		var m = new Gelatin.Model();

		expect(m).to.exist;
		done();
	});

	it('should populate a model with default attributes', function (done) {
		var m = new MyModel({
			age: 4
		});

		console.log(m);

		expect(m.name).to.eql('Bill');
		expect(m.age).to.eql(4);

		done();
	});

	it('should mark new models isNew property true', function (done) {
		var m = new MyModel();

		expect(get(m, 'isNew')).to.be.true;

		done();
	});

	it('should return a clean data object when calling data computed property', function (done) {
		var m = new MyModel({
			name: 'Foo',
			age: 2
		});

		var data = get(m, 'data');

		expect(data.name).to.eql(m.name);
		expect(data.age).to.eql(m.age);
		expect(data.data).to.not.exist;

		done();
	});
});
