/**
 * A data store class for handling updating models via an adapter
 */
Gelatin.Store = new Class({
	Implements: [Options],

	options: {
		transport: null
	},

	initialize: function (options) {
		this.setOptions(options);

		this.records = {};
		this.modelMap = {};
		this.newRecords = {};
		this.modelArrays = {};
		this.dirtyRecords = {};
		this.destroyRecords = {};
	},

	getModelMap: function (Model) {
		var modelId = get(Model, '_modelId');

		if (!modelId) {
			modelId = String.uniqueID();
			set(Model, '_modelId', modelId);
		}

		var modelMap = this.modelMap[modelId];

		if (modelMap) {
			return modelMap;
		} else {
			return this.modelMap[modelId] = {
				id2Cid: {},
				cIds: [],
				modelArrays: []
			};
		}
	},

	save: function () {
		var transport = this.options.transport;

		if (transport && transport.create) {
			Object.each(this.newRecords, function (m, cId) {
				transport.create(this, m);
			}.bind(this));
		}

		if (transport && transport.update) {
			Object.each(this.dirtyRecords, function (m, cId) {
				transport.update(this, m);
			}.bind(this));
		}

		// Destroy records marked for destruction
		var destroy = this.destroyRecords;
		
		Object.each(this.destroyRecords, function (m, cId) {
			if (transport && transport.destroy) {
				transport.destroy(this, m.$constructor, m);
			} else {
				this.didDestroy(m);
			}
		}.bind(this));
	},

	create: function (Model, data) {
		data = data || {};

		var id = data[Model.prototype.primaryKey];

		var modelMap = this.getModelMap(Model);

		var m = this.generateModel(Model, id, data);

		var cId = m.get('cId'); 

		if (id) {
			modelMap.id2Cid[id] = cId;
			modelMap.cIds.push(cId);
		} else {
			set(this.newRecords, cId, m);
		}

		this.updateModelArrays(Model, cId);

		return this.records[cId] = m;
	},


	didCreate: function (model, data) {
		var cId = get(model, 'cId');
		var pk = get(model, 'primaryKey');
		var id = get(data, pk);

		model.setProperties(data, true);

		if (id) {
			model.set('isNew', false);
		}

		delete this.newRecords[cId];
	},

	destroy: function (Model, cId) {
		var modelMap = this.getModelMap(Model);
		var model = get(this.records, cId);
		
		set(this.destroyRecords, cId, model);
	},

	didDestroy: function (m) {
		var Model = m.$constructor;
		var modelMap = this.getModelMap(m.$constructor);
		var cId = get(m, 'cId');
		var id = get(m, get(m, 'primaryKey'));

		modelMap.cIds.splice(modelMap.cIds.indexOf(cId), 1);

		if (id) {
			delete modelMap.id2Cid[id];
		}

		set(m, 'store', null); // Detach the model from the store
		m.set('isDestroyed', true); // Mark the model as being destroyed
		this.updateModelArrays(Model, cId);
		this.records[cId] = undefined;
		delete this.records[cId];
	},

	didUpdate: function (model, data) {
		var cId = get(model, 'cId');
		delete this.dirtyRecords[cId];

		if (data) {
			model.setProperties(data);
		}

		model.set('isDirty', false);
	},

	find: function (Model, id) {
		var modelMap = this.getModelMap(Model);

		var cId = modelMap.id2Cid[id];

		if (cId) {
			return get(this.records, cId);
		} else {
			var m = this.generateModel(Model, id);
			set(m, 'isLoaded', false);

			if (this.options.transport)
				this.options.transport.find(this, Model, id);

			return m;
		}
	},

	generateModel: function (Model, id, data) {
		var modelMap = this.getModelMap(Model);

		var m = new Model(data);
		cId = set(m, 'cId', String.uniqueID());

		modelMap.id2Cid[id] = cId;
		modelMap.cIds.push(cId);

		set(m, 'isLoaded', true);
		set(m, 'store', this);

		var isNew = true;

		if (id && modelMap.id2Cid[id]) {
			isNew = false;
		}

		set(m, 'isNew', isNew);

		set(this.records, cId, m);

		Gelatin.addObserver(m, '*', this.modelAttributeChange.bind(this, m));

		return m;
	},

	query: function(Model, query) {
		var modelMap = this.getModelMap(Model);	
		var transport = this.options.transport;

		if (transport && transport.query) {
			var array = new Gelatin.ModelArray();
			transport.query(this, Model, query, array);
			return array;
		}
		return false;
	},

	filter: function (Model, filter) {
		var array = new Gelatin.ModelArray();
		set(array, 'filter', filter);
		this.addModelArray(Model, array);
		return array;
	},

	findAll: function (Model) {
		var modelMap = this.getModelMap(Model);

		if (modelMap.all) return modelMap.all;

		var array = new Gelatin.ModelArray();

		this.addModelArray(Model, array);

		modelMap.all = array;

		var transport = this.options.transport;

		if (transport && transport.findAll) {
			transport.findAll(this, Model);
		}

		return array;
	},

	load: function (Model, id, data) {
		var modelMap = this.getModelMap(Model);
		var m = null;

		if (data === undefined) data = id;

		var pk = Model.prototype.primaryKey;
		var id = data[pk];

		var cId = modelMap.id2Cid[id];

		// If no client ID exists we need to create a new model instance
		if (!cId) {
			m = this.generateModel(Model, id, data);
			cId = get(m, 'cId');
		} else {
			m = get(this.records, cId);
		}

		m.set('isLoaded', true);
		this.updateModelArrays(Model, cId);
		return m;
	},

	loadMany: function (Model, ids, datas) {
		var models = [];
		ids.each(function (id, i) {
			var m = this.load(Model, id, datas ? datas[i] : undefined);
			models.push(m);
		}.bind(this));
		return models;
	},

	updateModelArrays: function (Model, cId) {
		var modelMap = this.getModelMap(Model);
		var m = get(this.records, cId);

		if (m === undefined) return;

		modelMap.modelArrays.each(function (array) {
			var filter = get(array, 'filter');

			var inArray = array.indexOf(m) !== -1;
			var add = false;

			if (!filter || filter(m)) {
				add = true;
			}

			if (m.get('isDestroyed')) {
				add = false;
			}

			if (add && !inArray) {
				array.push(m);
			} else if (!add && inArray) {
				array.remove(m);	
			}
		}.bind(this));
	},

	addModelArray: function(Model, array) {
		var modelMap = this.getModelMap(Model);
		modelMap.modelArrays.push(array);

		modelMap.modelArrays.each(function (array) {
			var filter = get(array, 'filter');

			for (var i = 0; i < modelMap.cIds.length; i++) {
				var m = get(this.records, modelMap.cIds[i])
				var inArray = array.indexOf(m) !== -1;
				var add = false;

				if (!filter || filter(m)) {
					add = true;
				}

				if (add && !inArray) {
					array.push(m);
				} else if (!add && inArray) {
					array.remove(m);	
				}
			}
		}.bind(this));
	},

	modelAttributeChange: function (model, key, value, old) {
		if (key in model.attributes) {
			var cId = get(model, 'cId');
			model.set('isDirty', true);
			set(this.dirtyRecords, cId, model);

			this.updateModelArrays(model.$constructor, cId);
		}
	}
});
new Type('Store', Gelatin.Store);

