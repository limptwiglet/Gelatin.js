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


});

