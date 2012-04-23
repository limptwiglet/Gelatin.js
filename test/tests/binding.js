var get = Gelatin.get;
var set = Gelatin.set;

describe('Gelatin.Binding', function () {
	it('should update either side of binding when they are set', function (done) {
		var obj1 = new Gelatin.Object();
		var obj2 = new Gelatin.Object({
			name: new Gelatin.Binding(obj1, 'name')
		});

		obj1.set('name', 'flanger');
		expect(get(obj2, 'name')).to.be.eql('flanger');

		done();
	});
});
