describe('Observers', function (done) {
	it('should have observerable properties', function (done) {
		var obj = {
			fname: 'bar'
		};

		Gelatin.addObserver(obj, 'fname', function (key, newValue, oldValue) {
			expect(key).to.eql('fname');
			expect(newValue).to.eql('foo');
			expect(oldValue).to.eql('bar');
			done();
		});

		set(obj, 'fname', 'foo');
	});

	it('should be able to observer all properties', function (done) {
		var obj = {
			fname: 'bar'
		};

		Gelatin.addObserver(obj, '*', function (key, newValue, oldValue) {
			expect(key).to.eql('fname');
			expect(newValue).to.eql('foo');
			expect(oldValue).to.eql('bar');
			expect(obj.fname).to.eql('foo');
			done();
		});

		set(obj, 'fname', 'foo');
	});
});

