describe('Mixins', function () {
	describe('getters and setters', function () {
		var Mixed = new Class({
			Implements: Gelatin.GetSet	
		});

		it('should add get and set methods', function (done) {
			var mixed = new Mixed();
			expect(mixed).to.have.property('get');
			expect(mixed).to.have.property('set');
			done();
		});
	});
});
