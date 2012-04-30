describe('Getters and setters', function () {
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

		it('should call setUnknown for undefined keys', function (done) {
			var obj = {
				setUnknown: function (key, value) {
					expect(key).to.eql('foo');
					expect(value).to.eql('bar');
					done();
				}
			};

			var value = Gelatin.set(obj, 'foo', 'bar');
		});
	});
});
