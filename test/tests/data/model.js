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
		});

		console.log(m);

		expect(m.name).to.eql('Bill');
		expect(m.age).to.eql(2);

		done();
	});
});
