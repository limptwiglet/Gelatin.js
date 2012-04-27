module.exports = function (grunt) {
	var FILES = [
			// HELPERS AND EXTENSIONS
			'<%= dirs.src %>core/mutators.js',

			// CORE
			'<%= dirs.src %>core/core.js',
			'<%= dirs.src %>core/object.js',
			'<%= dirs.src %>core/binding.js',

			// DATA
			'<%= dirs.src %>data/store.js',
			'<%= dirs.src %>data/model.js',
			'<%= dirs.src %>data/model-array.js',

			// VIEW
			'<%= dirs.src %>views/view.js'
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
		},

		watch: {
			files: FILES,
			tasks: 'concat:dist'
		}
	});


	grunt.registerTask('default', 'lint');

	grunt.registerTask('build', 'concat:dist');
};
