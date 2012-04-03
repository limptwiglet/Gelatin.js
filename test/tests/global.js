var expect = chai.expect;

describe('global gelatin helpers and classes', function () {
	describe('get', function () {
		var obj = {
			fname: 'Mark',
			lname: 'Gerrard',
			fullName: Gelatin.computed(function () {
				return Gelatin.get(this, 'fname') + ' ' + Gelatin.get(this, 'lname');
			}).property('fname', 'lname')
		};

		it('should return property', function (done) {
			expect(Gelatin.get(obj, 'fname')).to.eql(obj.fname);
			expect(Gelatin.get(obj, 'burr')).to.not.exist;
			done();	
		});

		it('should return value from a computed property', function (done) {
			expect(Gelatin.get(obj, 'fullName')).to.eql(obj.fname + ' ' + obj.lname);
			done();
		});
	});

	describe('set', function () {
		var obj = {
			fullName: Gelatin.computed(function (key, value) {
				if (arguments.length > 1) {
					var parts = value.split(' ');
					Gelatin.set(this, 'fname', parts[0]);
					Gelatin.set(this, 'lname', parts[1]);
				}

				return Gelatin.get(this, 'fname') + ' ' + Gelatin.get(this, 'lname');
			}).property('fname', 'lname')
		};

		it('should set a property', function (done) {
			Gelatin.set(obj, 'fname', 'Mark');
			expect(obj.fname).to.eql('Mark');
			done();
		});

		it('computed property should set properties', function (done) {
			Gelatin.set(obj, 'fullName', 'Mark Gerrard');
			expect(obj.fname).to.eql('Mark');
			expect(obj.lname).to.eql('Gerrard');
			done();
		});
	});
});
