var get = Gelatin.get;
var set = Gelatin.set;

describe('Store', function () {
	it('should be able to create a store', function (done) {
		var store = new Gelatin.Store();
		expect(store).to.be.ok;
		done();
	});


	it('should create records from the model type', function (done) {
		var store = new Gelatin.Store();
		var Model = new Class({Extends: Gelatin.Model});

		var model = store.createRecord(Model);
		expect(model).to.be.ok;

		expect(get(model, 'isNew')).to.be.true;

		done();
	});

	it('should set inital data on model if passed a hash', function (done) {
		var store = new Gelatin.Store();
		var Model = new Class({
			Extends: Gelatin.Model,

			attributes: {
				name: {type: 'string'}
			}
		});

		var model = store.createRecord(Model, {name: 'Mark'});
		expect(get(model, 'isNew')).to.be.true;
		expect(model.get('name')).to.eql('Mark');

		done();
	});

	it('should put record into dirty state when attribute changes', function (done) {
		var store = new Gelatin.Store();
		var Model = new Class({
			Extends: Gelatin.Model,

			attributes: {
				name: {type: 'string'}
			}
		});

		var model = store.createRecord(Model, {name: 'Mark'});
		model.set('name', 'Bill');

		expect(get(model, 'isNew')).to.be.true;
		expect(get(model, 'isDirty')).to.be.true;
		expect(get(model, 'name')).to.be.eql('Bill');

		done();
	});


	it('should be able find a record if an id is provided using store.find(Model, 1)', function (done) {
		var store = new Gelatin.Store();
		var Model = new Class({
			Extends: Gelatin.Model,

			attributes: {
				name: {type: 'string'}
			}
		});

		var m = store.createRecord(Model, {id: 1, name: 'Mark'});
		var m2 = store.find(Model, 1);	

		expect(m).to.eql(m2);
		done();
	});

	it('should return a model with no data if the id was not found in the store and call the adapters find method', function (done) {

		var store = new Gelatin.Store({
			adapter: {
				find: function (store, type, id) {
					store.load(type, 1, {name: 'Mark'});	
				}
			}
		});
		var Model = new Class({
			Extends: Gelatin.Model,

			attributes: {
				name: {type: 'string'}
			}
		});

		var m = store.find(Model, 1);

		expect(m).to.exist;
		done();
	});

	it('should call the adapters find method when calling store.find', function (done) {
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
