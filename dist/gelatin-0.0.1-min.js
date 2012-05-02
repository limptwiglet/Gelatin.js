(function(){var a=this.Gelatin={},b=a.getPath=function(a,b){b=b||window,a=a.split(".");var d=b;while(a.length)d=c(d,a.shift()),d===undefined&&(a=[]);return d},c=a.get=function(a,b){var c;return b in a?(c=a[b],typeOf(c)==="computedproperty"&&(c=c.get(a,b))):typeOf(a.getUnknown)==="function"&&(c=a.getUnknown(b)),c},d=a.set=function(b,d,e){var f=c(b,d);f===undefined?typeOf(b.setUnknown)==="function"?b.setUnknown(d,e):b[d]=e:typeOf(b[d])==="computedproperty"?b[d].set(b,d,e):b[d]=e;var g=c(b,d);return a.checkObservers(b,d,g,f),g};a.observers={},a.checkObservers=function(b,d,e,f){if(e===f)return;var g=c(b,"_observerId"),h=c(a.observers,g);if(!h)return;h[d]&&a.notifyObservers(b,h[d],d,e,f),h["*"]&&a.notifyObservers(b,h["*"],d,e,f)},a.notifyObservers=function(a,b,c,d,e){var f=0,g=b.length,h;for(;f<g;f++){var h=b[f];h.call(a,c,d,e)}},a.addObserver=function(b,e,f){var g=c(b,"_observerId");g?observers=c(a.observers,g):(g=d(b,"_observerId",String.uniqueID()),observers=d(a.observers,g,{"*":[]})),observers[e]||(observers[e]=[]),observers[e].push(f)},a.removeObservers=function(b,d,e){var f=c(b,"_observerId");d||delete a.observers[f]};var e=a.ComputedProperty=new Class({initialize:function(a){this.func=a},get:function(a,b){return this.func.call(a,b)},set:function(a,b,c){return this.func.call(a,b,c)}});new Type("ComputedProperty",e),Function.implement("computed",function(){var a=Array.from(arguments),b=new e(this);return b});var f=a.Enumerable=new Class({each:function(a){var b=c(this,"content");b.each(a.bind(this))},getEach:function(a){var b=c(this,"content");return b.map(function(b){return c(b,a)})},setEach:function(){},push:function(a){var b=c(this,"content");b=b.slice(),b.push(a),d(this,"content",b)},indexOf:function(a){return this.content.indexOf(a)},remove:function(a){var b=this.indexOf(a),e=c(this,"content");e.splice(b,1),e=e.slice(),d(this,"content",e)}}),g=a.Object=new Class({Implements:Options,options:{bindings:{}},initialize:function(a,b){return this.setOptions(b),Object.append(this,a),this.initBindings(this.options.bindings),this.init(),this},initBindings:function(b){Object.each(b,function(b,c){a.binding({from:b,to:c,toContext:this})}.bind(this))},init:function(){},get:function(a){return c(this,a)},getUnknown:function(a){return undefined},set:function(a,b,c){return d(this,a,b)},setProperties:function(a){var b=Object.keys(a);b.each(function(b){this.set(b,a[b])}.bind(this))},addObserver:function(b,c){a.addObserver(this,b,c)},destroy:function(){a.removeObservers(this)}}),h=a.binding=function(b){var e=h.getPathToProperty(b.from,b.fromContext),f=a.binding.getPathToProperty(b.to,b.toContext);d(f.obj,f.property,c(e.obj,e.property)),a.addObserver(e.obj,e.property,function(a,b){d(f.obj,f.property,b)}),b.oneWay||a.addObserver(f.obj,f.property,function(a,b){d(e.obj,e.property,b)})};h.getPathToProperty=function(a,c){var d={obj:c,property:a};if(!c){var e=a.split(".");d.property=e.pop(),d.obj=b(e.join("."))}return d},a.Store=new Class({Implements:[Options],options:{transport:null},initialize:function(a){this.setOptions(a),this.records={},this.modelMap={},this.newRecords={},this.modelArrays={},this.dirtyRecords={},this.destroyRecords={}},getModelMap:function(a){var b=c(a,"_modelId");b||(b=String.uniqueID(),d(a,"_modelId",b));var e=this.modelMap[b];return e?e:this.modelMap[b]={id2Cid:{},cIds:[],modelArrays:[]}},save:function(){var a=this.options.transport;a&&a.create&&Object.each(this.newRecords,function(b,c){a.create(this,b)}.bind(this)),a&&a.update&&Object.each(this.dirtyRecords,function(b,c){a.update(this,b)}.bind(this));var b=this.destroyRecords;Object.each(this.destroyRecords,function(b,c){a&&a.destroy?a.destroy(this,b.$constructor,b):this.didDestroy(b)}.bind(this))},create:function(a,b){b=b||{};var c=b[a.prototype.primaryKey],e=this.getModelMap(a),f=this.generateModel(a,c,b),g=f.get("cId");return c?(e.id2Cid[c]=g,e.cIds.push(g)):d(this.newRecords,g,f),this.updateModelArrays(a,g),this.records[g]=f},didCreate:function(a,b){var d=c(a,"cId"),e=c(a,"primaryKey"),f=c(b,e);a.setProperties(b,!0),f&&a.set("isNew",!1),delete this.newRecords[d]},destroy:function(a,b){var e=this.getModelMap(a),f=c(this.records,b);d(this.destroyRecords,b,f)},didDestroy:function(a){var b=a.$constructor,e=this.getModelMap(a.$constructor),f=c(a,"cId"),g=c(a,c(a,"primaryKey"));e.cIds.splice(e.cIds.indexOf(f),1),g&&delete e.id2Cid[g],d(a,"store",null),a.set("isDestroyed",!0),this.updateModelArrays(b,f),this.records[f]=undefined,delete this.records[f]},didUpdate:function(a,b){var d=c(a,"cId");delete this.dirtyRecords[d],b&&a.setProperties(b),a.set("isDirty",!1)},find:function(a,b){var e=this.getModelMap(a),f=e.id2Cid[b];if(f)return c(this.records,f);var g=this.generateModel(a,b);return d(g,"isLoaded",!1),this.options.transport&&this.options.transport.find(this,a,b),g},generateModel:function(b,c,e){var f=this.getModelMap(b),g=new b(e);cId=d(g,"cId",String.uniqueID()),f.id2Cid[c]=cId,f.cIds.push(cId),d(g,"isLoaded",!0),d(g,"store",this);var h=!0;return c&&f.id2Cid[c]&&(h=!1),d(g,"isNew",h),d(this.records,cId,g),a.addObserver(g,"*",this.modelAttributeChange.bind(this,g)),g},query:function(b,c){var d=this.getModelMap(b),e=this.options.transport;if(e&&e.query){var f=new a.ModelArray;return e.query(this,b,c,f),f}return!1},filter:function(b,c){var e=new a.ModelArray;return d(e,"filter",c),this.addModelArray(b,e),e},findAll:function(b){var c=this.getModelMap(b);if(c.all)return c.all;var d=new a.ModelArray;this.addModelArray(b,d),c.all=d;var e=this.options.transport;return e&&e.findAll&&e.findAll(this,b),d},load:function(a,b,d){var e=this.getModelMap(a),f=null;d===undefined&&(d=b);var g=a.prototype.primaryKey,b=d[g],h=e.id2Cid[b];return h?f=c(this.records,h):(f=this.generateModel(a,b,d),h=c(f,"cId")),f.set("isLoaded",!0),this.updateModelArrays(a,h),f},loadMany:function(a,b,c){var d=[];return b.each(function(b,e){var f=this.load(a,b,c?c[e]:undefined);d.push(f)}.bind(this)),d},updateModelArrays:function(a,b){var d=this.getModelMap(a),e=c(this.records,b);if(e===undefined)return;d.modelArrays.each(function(a){var b=c(a,"filter"),d=a.indexOf(e)!==-1,f=!1;if(!b||b(e))f=!0;e.get("isDestroyed")&&(f=!1),f&&!d?a.push(e):!f&&d&&a.remove(e)}.bind(this))},addModelArray:function(a,b){var d=this.getModelMap(a);d.modelArrays.push(b),d.modelArrays.each(function(a){var b=c(a,"filter");for(var e=0;e<d.cIds.length;e++){var f=c(this.records,d.cIds[e]),g=a.indexOf(f)!==-1,h=!1;if(!b||b(f))h=!0;h&&!g?a.push(f):!h&&g&&a.remove(f)}}.bind(this))},modelAttributeChange:function(a,b,e,f){if(b in a.attributes){var g=c(a,"cId");a.set("isDirty",!0),d(this.dirtyRecords,g,a),this.updateModelArrays(a.$constructor,g)}}}),new Type("Store",a.Store),a.Model=new Class({Extends:a.Object,primaryKey:"id",cId:null,id:null,isLoaded:!1,isNew:!0,isDirty:!1,store:null,attributes:{},initialize:function(a,b){a=this.initData(a||{}),this.parent(a,b)},initData:function(a){var b;for(var c in this.attributes)b=this.attributes[c],typeOf(b)==="object"&&b.value!==undefined&&(b=b.value),c in a||(a[c]=b);return a},data:function(){var a={};for(var b in this.attributes)a[b]=c(this,b);return a}.computed(),destroy:function(){var a=c(this,"store"),b=c(this,"cId");a&&a.destroy(this.$constructor,b),this.parent()}}),new Type("Model",a.Model),a.ModelArray=new Class({Extends:a.Object,Implements:f,initialize:function(){this.parent(),this.content=Array.from(arguments),this.length=this.content.length}});var i=a.View=new Class({Extends:a.Object,options:{tag:"div",attributes:{},events:{}},hasRendered:!1,inject:function(){this.render(),this.el.inject.apply(this.el,Array.from(arguments))},_render:function(){if(c(this,"hasRendered"))return;this.el=new Element(this.options.tag,this.options.attributes),Object.each(this.options.events,function(a,b){this.el.addEvent(b,this[a].bind(this))}.bind(this)),d(this,"hasRendered",!0)},render:function(){this._render()},destroy:function(){this.el.destroy(),this.parent()}}),j=a.CollectionView=new Class({Extends:i,childViews:[],initialize:function(a,b){this.parent(a,b),this.addObserver("content",this._contentChange.bind(this))},_contentChange:function(a,b,c){var d=this.childViews;while(d.length)d.pop().destroy();this._renderItems()},_renderItems:function(){var a=c(this,"content");a.each(function(a){this.childViews.push(this._renderItem(a))}.bind(this))},_renderItem:function(a){var b=new this.options.itemView({content:a});return b.inject(this.el),b},_render:function(){this.parent(),this._renderItems()}});a.history=function(){}();var k=/\:(\w+)/g,l=/\?([^\/]+)/g,m=/([^\?=&]+)(=([^&]*))/;a.Router=new Class({Implements:[Options,Events],options:{},initialize:function(a,b){this.currentRoute=null,this.routes=a},check:function(a){var b=this.match(a)},extractQueryString:function(a){var b={};return a.replace(m,function(a,c,d,e){b[c]=e}),b},match:function(a){var b=a.match(l);for(var c in this.routes){var d=c.match(k),e=c.replace(k,"([^/]+)"),f=a.match(new RegExp(e));if(!f)continue;if(f[0]===a)this.callRoute(this.routes[c],f.slice(1),d);else if(b){var b=this.extractQueryString(b[0]);this.callRoute(this.routes[c],f.slice(1),d,b)}}},callRoute:function(a,b,c,d){var e=[],f={};if(b)for(var g=0,h=b.length;g<h;g++)c[g]&&(f[c[g].replace(":","")]=b[g]);typeOf(a)==="function"?e.push(a):typeOf(a)==="array"?e=e.concat(a):a.on!==undefined&&e.push(a.on);for(var g=0,h=e.length;g<h;g++)this.currentRoute=a,e[g].call(this,f,d)}})})();