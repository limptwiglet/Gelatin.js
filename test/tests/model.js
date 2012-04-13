var get = Gelatin.get;
var set = Gelatin.set;

describe('Store', function () {
	it('should be able to create a store', function (done) {
		var store = new Gelatin.Store();
		expect(store).to.be.ok;
		done();
	});

	it('should create a model instance', function (done) {
		var store = new Gelatin.Store();
		var Model = new Class({
			Extends: Gelatin.Model
		});

		var m = store.create(Model);
		expect(m).to.be.ok;

		expect(get(m, 'isLoaded')).to.be.true;
		expect(get(m, 'isNew')).to.be.true;

		done();
	});

	it('should create a model instance with data', function (done) {
		var store = new Gelatin.Store();
		var Model = new Class({
			Extends: Gelatin.Model
		});

		var m = store.create(Model, {name: 'Mark'});
		expect(m).to.be.ok;
		expect(get(m, 'name')).to.be.eql('Mark');
		expect(get(m, 'isLoaded')).to.be.true;
		expect(get(m, 'isNew')).to.be.true;

		done();
	});

	it('should mark models with id\'s as not new', function (done) {
		var store = new Gelatin.Store();
		var Model = new Class({
			Extends: Gelatin.Model
		});

		var m = store.create(Model, {id: 1, name: 'Mark'});
		expect(m).to.be.ok;
		expect(get(m, 'isLoaded')).to.be.true;
		expect(get(m, 'isNew')).to.be.false;

		done();
	});

	it('should return a model by id if it exists', function (done) {
		var store = new Gelatin.Store();
		var Model = new Class({
			Extends: Gelatin.Model
		});

		var m = store.create(Model, {id: 1, name: 'Mark'});
		var m2 = store.find(Model, 1);

		expect(m2).to.eql(m);

		done();
	});

	it('should return a empty model with isLoaded = false if the id is not in the store', function (done) {
		var store = new Gelatin.Store({
		});
		var Model = new Class({
			Extends: Gelatin.Model
		});

		var m = store.find(Model, 1);

		expect(m).to.be.ok;
		expect(get(m, 'isLoaded')).to.be.false;

		done();
	});

	it('should load records by calling the stores load method and passing a data hash', function (done) {
		var store = new Gelatin.Store({
		});
		var Model = new Class({
			Extends: Gelatin.Model
		});

		store.load(Model, {id: 1, name: 'Mark'});
		store.load(Model, {id: 2, name: 'Bill'});
		store.load(Model, {id: 3, name: 'Frank'});

		var m = store.find(Model, 1);
		var m2 = store.find(Model, 2);
		var m3 = store.find(Model, 3);

		expect(get(m, 'isLoaded')).to.be.true;
		expect(get(m2, 'isLoaded')).to.be.true;
		expect(get(m3, 'isLoaded')).to.be.true;

		expect(get(m, 'name')).to.be.eql('Mark');
		expect(get(m2, 'name')).to.be.eql('Bill');
		expect(get(m3, 'name')).to.be.eql('Frank');

		expect(m).to.be.ok;

		done();
	});

	it('should be able to load multiple records via the stores loadMany method', function (done) {

		var store = new Gelatin.Store({
		});
		var Model = new Class({
			Extends: Gelatin.Model
		});

		store.loadMany(Model, [
			{
				id: 1,
				name: 'Mark'
			},
			{
				id: 2,
				name: 'Bill'
			}
		]);

		var m = store.find(Model, 1);
		var m2 = store.find(Model, 2);

		expect(get(m, 'isLoaded')).to.be.true;
		expect(get(m2, 'isLoaded')).to.be.true;
		expect(get(m, 'name')).to.be.eql('Mark');
		expect(get(m2, 'name')).to.be.eql('Bill');

		done();
	});

	it('should call the transports find method if the id dosnt exist and trigger the isLoaded observer', function (done) {
		var store = new Gelatin.Store({
			transport: {
				find: function (store, Model, id) {
					setTimeout(function () {
						store.load(Model, {id: 1})
					}, 200);
				}
			}
		});

		var Model = new Class({
			Extends: Gelatin.Model
		});

		var m = store.find(Model, 1);
		m.addEvent('change:isLoaded', function () {
			expect(m).to.be.ok;
			expect(get(m, 'isLoaded')).to.be.true;
			done();
		});
	});


	it('should return all records when calling findAll', function (done) {
		var store = new Gelatin.Store();	
		var Model = new Class({
			Extends: Gelatin.Model
		});

		store.loadMany(Model, [
			{
				id: 1,
				name: 'Mark'
			},
			{
				id: 2,
				name: 'Mark'
			}
		]);

		var ma = store.findAll(Model);

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
