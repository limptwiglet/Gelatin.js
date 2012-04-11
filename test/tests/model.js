describe('Store', function () {
	var store = new Gelatin.Store({
		adapter: {
			createRecord: function (model, store) {
				var data = {
					id: Math.floor(Math.random() * 100)
				};

				Object.each(model.attributes, function (value, key) {
					data[key] = model.get(key);
				});

				store.didCreateRecord(model, data);
			},
			updateRecord: function (model, store) {
				var data = {};

				Object.each(model.attributes, function (value, key) {
					data[key] = model.get(key);
				});

				store.didUpdateRecord(model);
			}
		}
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


	it('should commit records and save the data', function (done) {
		var m = store.createRecord(Model, {fname: 'WOW', sname: 'Trousers'});
		store.commit();

		var cId = m.get('cId');

		expect(m.get('id')).to.exist;
		expect(store.dirtyRecords).to.not.have.property(cId);

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
