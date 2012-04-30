# Gelatin.js

Gelatin.js is a framework built ontop of mootools to help you create web apps.

Gelatin is heavily inspired by other frameworks such as Backbone.js, SprouteCore and Ember.js

Some of the features in Gelatin:

* getters and setters
* Observerable properties
* Bindings
* Computed properties
* Models
* Data store
* Data transport methods ie REST

## Getters and setters

Gelatin has two functions that you should always use when interacting with 
properties, Gelatin.get & Gelatin.set. They do what you would expect and return 
and set properties on objects:

```javascript
// Return the person objects name
Gelatin.get(person, 'name');

// Set the person objects name
Gelatin.set(person, 'name', 'Mark');
```

The reason for this is that Gelatin uses observers and bindings to keep your 
application in sync. So using set allows Gelatin to know which property you are
setting and if it needs to alert any observers of the change. The get method 
enabled Gelatin to call computed properties correctly.


## Observerable properties

You can observer any property for changes in its value by using observers:

```javascript
var person = {
	name: 'Mark'
};

Gelatin.addObserver(person, 'name', function (key, newValue, oldValue) {
	// Your observer code...
});
```

Observers will only trigger when the new value differs from the previous.

You can also observer the entire object for any property changes by using the * 
property name:

```javascript
Gelatin.addObserver(person, '*', function () {});
```


## Models

Gelatin.js includes a model class for defining your data structures.


## Building Gealtin

Gelatin uses node with the amazing grunt.js (https://github.com/cowboy/grunt) to 
build the project.

So just install grunt.js from NPM:

```bash
npm install grunt -g
```

And then from the root of the project directory:

```bash
grunt build
```

This will create a versioned file in the dist folder as well as a minified 
version.
