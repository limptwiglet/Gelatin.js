var fs = require('fs');

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

		min: {
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: '<%= dirs.dest %>gelatin-<%= pkg.version %>-min.js'
			}
		},

		watch: {
			files: FILES,
			tasks: ['concat:dist', 'wrap', 'min:dist']
		},

		wrap: {
			src: '<%= concat.dist.dest %>'
		}
	});


	grunt.registerMultiTask('wrap', 'Wraps the gelatin source in a closure', function () {
		var data = fs.readFileSync(this.file.src, 'utf8')
		fs.writeFileSync(this.file.src, '(function() {' + data + '})();', 'utf8');
	});


	grunt.registerTask('default', 'lint');

	grunt.registerTask('build', ['concat:dist', 'wrap', 'min:dist']);
};
