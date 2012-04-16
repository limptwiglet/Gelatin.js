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


	it('should return all loaded records when calling findAll', function (done) {
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

		var ma = store.findAll(Model);
		expect(ma.models).to.have.length(2);
		done();
	});

	it('should return a model array that gets updated when new models load', function (done) {
		var store = new Gelatin.Store({
		});	
		var Model = new Class({
			Extends: Gelatin.Model
		});


		var ma = store.findAll(Model);
		expect(ma.models).to.have.length(0);

		var models = store.loadMany(Model, [
			{
				id: 1,
				name: 'Mark'
			}
		]);

		expect(models).to.have.length(1);
		expect(ma.models).to.have.length(1);

		done();
	});

	it('should call the transports findAll method', function (done) {
		var store = new Gelatin.Store({
			transport: {
				findAll: function (store, Model) {
					store.loadMany(Model, [
						{
							id: 1,
							name: 'Marl'
						},
						{
							id: 2,
							name: 'Bill'
						}
					]);
					var ma = store.findAll(Model);

					expect(ma.models).to.have.length(2);
					expect(store).to.exist;
					expect(Model).to.exist;

					done();
				}
			}
		});	
		var Model = new Class({
			Extends: Gelatin.Model
		});

		var ma = store.findAll(Model);
		expect(ma.models).to.have.length(0);
	});


	it('should call the transports query method when querying the store', function (done) {
		var store = new Gelatin.Store({
			transport: {
				query: function (store, Model, query, array) {
					expect(store).to.exist;
					expect(Model).to.exist;
					expect(query).to.exist;
					expect(array).to.exist;

					var models = store.loadMany(Model, [
						{
							id: 1,
							name: 'Mark'
						}
					]);

					array.set('models', models);

					done();
				}
			}
		});	
		var Model = new Class({
			Extends: Gelatin.Model
		});

		var ma = store.query(Model, {
			name: 'Mark'
		});
		done();
	});


	it('should be able to add filters to loaded records', function (done) {
		var store = new Gelatin.Store({
		});	

		var Model = new Class({
			Extends: Gelatin.Model
		});

		store.loadMany(Model, [
			{ id: 1, name: 'mark' },
			{ id: 2, name: 'bill' }
		]);

		var fma = store.filter(Model, function (model) {
			console.log(model);
			var name = model.get('name');

			return /[m]/ig.test(name);
		});

		expect(fma.models).to.have.length(1);
		store.loadMany(Model, [
			{ id: 3, name: 'matt' },
			{ id: 4, name: 'flanger' }
		]);
		expect(fma.models).to.have.length(2);

		done();
	});


	it('should be able to destroy records using their deleteRecord method', function (done) {
		var store = new Gelatin.Store({
		});	

		var Model = new Class({
			Extends: Gelatin.Model
		});

		store.loadMany(Model, [
			{ id: 1, name: 'mark' },
			{ id: 2, name: 'bill' }
		]);

		done();
	});


	it('should call the transports create method when calling the store save method', function (done) {
		var store = new Gelatin.Store({
			transport: {
				create: function (store, model) {
					expect(model.isNew).to.be.true;
					expect(store.newRecords).to.have.property(model.cId);

					store.didCreate(model, { id: 1 });

					expect(store.newRecords).to.not.have.property(model.cId);
					expect(model.isNew).to.be.false;

					done();
				}
			}
		});

		var Model = new Class({
			Extends: Gelatin.Model
		});

		store.create(Model, {
			name: 'Mark'
		});

		store.save();
	});
});
