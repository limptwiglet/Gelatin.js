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
