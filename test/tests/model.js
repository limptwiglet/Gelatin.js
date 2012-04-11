describe('Store', function () {
	var store = new Gelatin.Store({
		adapter: Gelatin.fixtureAdapter
	});

	var Model = new Class({
		Extends: Gelatin.Model,

		type: 'model',

		attributes: {
			fname: {type: 'string'},
			sname: {type: 'string'},
			age: {type: 'number'}
		}
	});

	it('should create records', function (done) {
		var m = store.createRecord(Model, {fname: 'Mark', sname: 'Gerrard', age: 2});
		var m2 = store.createRecord(Model, {fname: 'Mark', sname: 'Gerrard', age: 2});

		expect(store.records).to.have.property('0');
		expect(store.records).to.have.property('1');
		expect(store.newRecords).to.have.property('0');
		expect(store.newRecords).to.have.property('1');
		expect(m.store).to.exist;

		done();
	});

	it('should put a record into dirty records if an attribute changes', function (done) {
		var m = store.createRecord(Model, {fname: 'Mark'});

		var cId = m.get('cId');
		m.set('fname', 'Bill');

		expect(store.dirtyRecords).to.have.property(cId);

		done();
	});
});


describe('Model', function () {
	var Model = new Class({
		Extends: Gelatin.Model,

		type: 'model',

		attributes: {
			fname: {type: 'string'},
			sname: {type: 'string'},
			age: {type: 'number'}
		}
	});

	it('should throw an error when setting attribute that isnt defined', function (done) {
		var m = new Model();
		try {
			m.set('foo', 'bar');
		} catch (e) {
			expect(e).to.exist;
			done();
		}
	});
});
