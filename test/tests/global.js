var expect = chai.expect;
var get = Gelatin.get;
var set = Gelatin.set;

describe('global gelatin helpers and classes', function () {
	describe('get', function () {
		var obj = {
			fname: 'Mark',
			lname: 'Gerrard'
		};

		it('should return property', function (done) {
			expect(Gelatin.get(obj, 'fname')).to.eql(obj.fname);
			expect(Gelatin.get(obj, 'burr')).to.not.exist;
			done();	
		});


		it('should call getUnknown for undefined keys', function (done) {
			var obj = {
				getUnknown: function () {
					return 'unknown';
				}
			};

			var value = Gelatin.get(obj, 'foo');
			expect(value).to.eql('unknown');
			done();
		});

		it('should call setUnknown for undefined keys', function (done) {
			var obj = {
				setUnknown: function (key, value) {
					return key+value;
				}
			};

			var value = Gelatin.set(obj, 'foo', 'bar');
			expect(value).to.eql('foobar');
			done();
		});
	});

	describe('set', function () {
		var obj = {
		};

		it('should set a property', function (done) {
			Gelatin.set(obj, 'fname', 'Mark');
			expect(obj.fname).to.eql('Mark');
			done();
		});

		it('should set a undefined property', function (done) {
			Gelatin.set(obj, 'test', 'test');
			expect(Gelatin.get(obj, 'test')).to.eql('test');
			done();
		});
	});

	describe('ComputedProperty', function () {
		it('should bind the computed property to its parent objects scope', function (done) {
			var obj = {
				fname: 'Mark',
				sname: 'Gerrard',
				fullName: function () {
					expect(this.fname).to.exist;
					done();
				}.computed()
			};

			get(obj, 'fullName');
		});

		it('should call the computed property to get a value', function (done) {
			var obj = {
				fname: 'Mark',
				sname: 'Gerrard',
				fullName: function () {
					return get(this, 'fname') + ' ' + get(this, 'sname');
				}.computed()
			};

			var fullName = get(obj, 'fullName');
			expect(fullName).to.eql(obj.fname + ' ' + obj.sname);
			done();
		});

		it('should call the computed property to set a value', function (done) {
			var obj = {
				fname: 'Mark',
				sname: 'Gerrard',
				fullName: function (key, value) {
					if (arguments.length > 1) {
						var parts = value.split(' ');
						set(this, 'fname', parts[0]);
						set(this, 'sname', parts[1]);
					}

					return get(this, 'fname') + ' ' + get(this, 'sname');
				}.computed()
			};

			set(obj, 'fullName', 'Bill Hicks');

			var fullName = get(obj, 'fullName');
			expect(fullName).to.eql('Bill Hicks');
			
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

		it('should merge passed in properties', function (done) {
			var obj = {
				fname: 'test',
				lname: 'test',
				age: 20
			};

			var object = new Gelatin.Object(obj);
			expect(object.get('fname')).to.have.eql(obj.fname);
			expect(object.get('lname')).to.have.eql(obj.lname);
			expect(object.get('age')).to.have.eql(obj.age);

			done();
		});

		it('should have observerable properties', function (done) {
			var obj = new Gelatin.Object({
				fname: 'Mark',
				lname: 'Gerrard'
			});

			obj.addEvent('change:fname', function (key, value, oldValue) {
				expect(key).to.eql('fname');
				expect(oldValue).to.eql('Mark');
				expect(value).to.eql('John');

				done();
			});

			obj.set('fname', 'John');
		});


		it('should be able to trigger observers for given keys', function (done) {
			var obj = new Gelatin.Object({
				fname: 'Mark'
			});

			var c = 0;
			var handler = function (key, value, oldValue) {
				if (++c >= 1) {
					expect(key).to.eql('fname');
					expect(value).to.eql('Bill');
					expect(oldValue).to.eql('Mark');
					done();
				}
			};

			obj.set('fname', 'Bill', true);
			obj.addEvent('change:hasChanged', function () {
				console.log('here');
			});
			obj.addEvent('change:fname', handler);

			obj.triggerChange('fname');

		});

		it('should be able to remove observers', function (done) {
			var obj = new Gelatin.Object({
				fname: 'Mark',
				lname: 'Gerrard'
			});

			var observer1 = function () {};
			var observer2 = function () {};

			obj.removeEvent('fname', observer1);
			obj.removeEvent('fname', observer2);

			done();
		});

		it('should be able to change properties silently', function (done) {
			var obj = new Gelatin.Object({
			
			});

			obj.addEvent('change:fname', function () {
				throw new Error('Observer should not be triggered');
			});

			obj.set('fname', 'silent night', true);
			done();
		});

		it('should not trigger observers if properties hasnt changed value', function (done) {
			var obj = new Gelatin.Object({
				fname: 'Mark',
				lname: 'Gerrard'
			});

			obj.addEvent('change:fname', function () {
				throw new Error('Observer triggered, fail!');
			});

			obj.set('fname', obj.get('fname'));
			done();
		});
	});

	describe('Object', function () {
		it('should have a equal method that checks for object equality', function (done) {
			var objA = { name: 'Mark', age: 28, deep: { deepA: 1, deepB: 'Test' } };
			var objB = { name: 'Mark', age: 28, deep: { deepA: 1, deepB: 'Test' } };
			var objC = { name: 'Flanger', age: 28, deep: { deepA: 1, deepB: 'Test' } };

			console.log(Object.equal(objA, objC));
			expect(Object.equal(objA, objB)).to.be.true;
			expect(Object.equal(objA, objC)).to.be.false;
			done();
		});
	});
});
