module.exports = function (grunt) {
	var FILES = [
			'<%= dirs.src %>core/core.js',
			'<%= dirs.src %>core/get.js',
			'<%= dirs.src %>core/set.js',
			'<%= dirs.src %>core/object.js'
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
