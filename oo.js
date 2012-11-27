define(function(){
	var __hasProp = {}.hasOwnProperty;
	var __extends = function(child, parent) {
		for ( var key in parent) {
			if (__hasProp.call(parent, key)) child[key] = parent[key];
		}
		
		function ctor() {
			this.constructor = child;
		}
		
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		child.__super__ = parent.prototype;
		
		return child;
	};
	
	var currentConstructor = null;
	
	var throwException = function(message,modifier){
		throw new Error((currentConstructor.name? currentConstructor.name:'(anonymous)') +' '+ message +' '+ modifier);
	};
	
	var assignMethod = function(method){
		if ( !method.name ) throwException('anyonymous functions are not assignable');
		
		currentConstructor.prototype[method.name] = method;
	};
	
	var assignProperty = function(propertyName,propertyDefault){
		if ( currentConstructor.prototype[propertyName] ) throwException('property already defined',propertyName);
		
		currentConstructor.prototype[propertyName] = propertyDefault;
	};
	
	var oo = {
		'class' : function(constructor,callback){
			if ( callback ) {
				try {
					currentConstructor = constructor;
					callback();
					currentConstructor = null;
				} catch ( e ) {
					currentConstructor = null;
					throw e;
				}
			}
			
			return constructor;
		},
		
		'subclass' : function(parent,constructor,callback){
			if ( !callback ) {
				callback = constructor;
				constructor = function(){
					parent.prototype.constructor.apply(this,arguments);
				};
			}
			
			__extends(constructor,parent);
			
			try {
				currentConstructor = constructor;
			
				callback(parent.prototype);
			
				currentConstructor = null;
			} catch ( e ) {
				currentConstructor = null;
				throw e;
			}
			
			return constructor;
		},
		'overwrite' : function(method){
			if ( !currentConstructor.prototype[method.name] ) {
				var idx = 0;
				var caller = arguments.callee;
				while ( caller && idx++ < 20 ) {
					console.log('caller',caller,caller.name,caller.length);
					caller = caller.caller;
				}
				
				throwException('can not be overwritten as it does not exist',method.name);
			}
			
			assignMethod(method);
		},
		
		'method' : function(method){
			if ( currentConstructor.prototype[method.name] ) {
				throwException('already defined. use overwrite',method.name);
			}
			
			assignMethod(method);
		},
		
		'staticMethod' : function(method){
			currentConstructor[method.name] = method;
		},
		
		'staticProperty' : function(propertyName,property){
			currentConstructor[propertyName] = property;
		}
	};
	
	oo.property = assignProperty;
	oo.public = oo.method;
	oo.protected = oo.method;
	oo.private = oo.method;
	oo.static = oo.staticMethod;
	
	return oo;
});