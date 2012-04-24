module.exports = function (grunt) {
	var FILES = [
			// CORE
			'<%= dirs.src %>core/core.js',
			'<%= dirs.src %>core/object.js',

			// DATA
			'<%= dirs.src %>data/store.js',
			'<%= dirs.src %>data/model.js',
			'<%= dirs.src %>data/model-array.js'
		];

	grunt.initConfig({
		pkg: '<json:package.json>',

		dirs: {
			src: 'src/',
			dest: 'dist/'
		},

		lint: {
			all: FILES
		},

		concat: {
			dist: {
				src: FILES,
				dest: '<%= dirs.dest %>gelatin-<%= pkg.version %>.js'
			}
		}
	});


	grunt.registerTask('default', 'lint');

	grunt.registerTask('build', 'concat:dist');
};
