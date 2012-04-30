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
		m.addObserver('isLoaded', function () {
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
		expect(ma.content).to.have.length(2);
		done();
	});

	it('should return a model array that gets updated when new models load', function (done) {
		var store = new Gelatin.Store({
		});	
		var Model = new Class({
			Extends: Gelatin.Model
		});


		var ma = store.findAll(Model);
		expect(ma.content).to.have.length(0);

		var models = store.loadMany(Model, [
			{
				id: 1,
				name: 'Mark'
			}
		]);

		expect(models).to.have.length(1);
		expect(ma.content).to.have.length(1);

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

					expect(ma.content).to.have.length(2);
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
	});


	it('should be able to add filters to loaded records', function (done) {
		var store = new Gelatin.Store({
		});	

		var Model = new Class({
			Extends: Gelatin.Model,
			attributes: {
				name: 'string'
			}
		});

		store.loadMany(Model, [
			{ id: 1, name: 'mark' },
			{ id: 2, name: 'bill' }
		]);

		var fma = store.filter(Model, function (model) {
			var name = model.get('name');

			return /[m]/ig.test(name);
		});

		var fma2 = store.filter(Model, function (model) {
			var name = model.get('name');

			return /[p]/ig.test(name);
		});

		expect(fma2.content).to.have.length(0);
		expect(fma.content).to.have.length(1);

		store.loadMany(Model, [
			{ id: 3, name: 'matt' },
			{ id: 4, name: 'flanger' }
		]);

		expect(fma.content).to.have.length(2);

		var m = store.find(Model, 3);
		m.set('name', 'poop');

		done();
	});


	it('should be able to destroy records using their destroy method', function (done) {
		var store = new Gelatin.Store({
			transport: {
				destroy: function (store, Model, model) {
					store.didDestroy(model);
				}
			}
		});	

		var Model = new Class({
			Extends: Gelatin.Model
		});

		store.loadMany(Model, [
			{ id: 1, name: 'mark' },
			{ id: 2, name: 'bill' }
		]);

		var m = store.find(Model, 1);
		var fma = store.findAll(Model);
		var cId = m.get('cId');

		expect(fma.content).to.have.length(2);
		expect(m).to.exist;

		m.destroy();

		expect(store.destroyRecords).to.have.property(cId);

		store.save();

		expect(fma.content).to.have.length(1);

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


	it('should move record into dirty state when attribute changes', function (done) {
		var store = new Gelatin.Store({
		});

		var Model = new Class({
			Extends: Gelatin.Model,

			attributes: {
				fname: {}
			}
		});

		var m = store.create(Model, {
		});

		var cId = get(m, 'cId');

		expect(store.dirtyRecords).to.not.have.property(cId);

		m.set('bur', 'test');

		expect(store.dirtyRecords).to.not.have.property(cId);

		m.set('fname', 'fook');

		expect(store.dirtyRecords).to.have.property(cId);

		done();
	});

	it('should move record out of dirty state when store saves', function (done) {
		var cId;
		var store = new Gelatin.Store({
			transport: {
				update: function (store, model) {
					store.didUpdate(model, { fname: 'fook' });
					expect(store.dirtyRecords).to.not.have.property(cId);
					expect(model.isDirty).to.be.false;
					done();
				}
			}
		});

		var Model = new Class({
			Extends: Gelatin.Model,

			attributes: {
				fname: {}
			}
		});

		var m = store.create(Model, {
		});

		cId = get(m, 'cId');
		m.set('fname', 'fook');
		expect(store.dirtyRecords).to.have.property(cId);

		store.save();
	});
});
