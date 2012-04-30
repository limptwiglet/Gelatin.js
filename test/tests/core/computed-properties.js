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

