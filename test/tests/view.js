describe('View', function () {
	it('should inject into target', function (done) {
		var view = new Gelatin.View({
			html: '<a href="" id="test"></a>'	
		});

		view.inject(document.body);

		expect($('test')).to.exist;
		done();
	});
});
