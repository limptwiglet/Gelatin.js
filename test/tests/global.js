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


	describe('Object', function () {
		it('should have get and set methods', function (done) {
			var obj = new Gelatin.Object({
				fname: 'Mark',
				lname: 'Gerrard'
			});

			expect(obj.get).to.exist;	
			expect(obj.set).to.exist;	
			expect(obj.get('fname')).to.eql(obj.fname);
			obj.set('fname', 'Bill');
			expect(obj.get('fname')).to.eql('Bill');
			done();	
		});


		it('should have observerable properties', function (done) {
			var obj = new Gelatin.Object({
				fname: 'Mark',
				lname: 'Gerrard'
			});

			obj.addObserver('fname', function (type, key, value) {
				expect(type).to.eql('change');
				expect(key).to.eql('fname');
				expect(value).to.eql('John');

				done();
			});

			obj.set('fname', 'John');
		});

		it('should be able to remove observers', function (done) {
			var obj = new Gelatin.Object({
				fname: 'Mark',
				lname: 'Gerrard'
			});

			var observer1 = function () {};
			var observer2 = function () {};

			obj.addObserver('fname', observer1);
			obj.addObserver('fname', observer2);

			expect(obj._observers['fname']).to.have.length(2);

			obj.removeObserver('fname', observer1);

			expect(obj._observers['fname']).to.have.length(1);

			var o = obj._observers['fname']
			for (var i = 0, l = o.length; i < l; i++) {
				if (o[i] === observer1) {
					throw new Error('Observer not removed correctly');
				}
			}

			obj.removeObserver('fname', observer2);

			expect(obj._observers['fname']).to.have.length(0);

			done();
		});

		it('should not trigger observers if properties done change value', function () {
			var obj = new Gelatin.Object({
				fname: 'Mark',
				lname: 'Gerrard'
			});
		});
	});
});
