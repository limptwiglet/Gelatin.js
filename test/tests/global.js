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

		//it('should return value from a computed property', function (done) {
			//expect(Gelatin.get(obj, 'fullName')).to.eql(obj.fname + ' ' + obj.lname);
			//done();
		//});

		//it('should get a property at a path "name.first"', function (done) {
			//var obj = {
				//name: {
					//first: 'Mark'
				//},
				//foo: {
					//bar: {
						//baz: {
							//bar: 'test'
						//},

						//foo: Gelatin.computed(function () {
							//return 'test';
						//})
					//}
				//}
			//};

			//expect(Gelatin.get(obj, 'name.first')).to.eql(obj.name.first);
			//expect(Gelatin.get(obj, 'foo.bar.baz.bar')).to.eql(obj.foo.bar.baz.bar);
			//expect(Gelatin.get(obj, 'foo.bar.foo')).to.eql('test');
			//expect(Gelatin.get(obj, 'foo.bar2')).to.not.exist;
			//done();
		//});

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

		it('should set a undefined property', function (done) {
			Gelatin.set(obj, 'test', 'test');
			expect(Gelatin.get(obj, 'test')).to.eql('test');
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
});
