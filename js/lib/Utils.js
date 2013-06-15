define([
    "jquery"
],function($){
    /**
     * Utility functions and variables.
     */
    var EMPTY_FUNCTION = function(){};
    function applyParameters(context,parameters,args,appName) {
        $(parameters.required).each(function(){
            if (typeof(args[this])==="undefined" && typeof(context[this])==="undefined") {
                throw new ParameterError("\<\<Parameter Error\>\> You didn't pass the required parameter \<\<"+this+"\>\> into your \<\<"+appName+"\>\>  application.");
            } else {
                context[this] = args[this];
            }
        });
        $(parameters.optional).each(function(){
            context[this[0]] = (typeof(args[this[0]])==="undefined")?this[1]:args[this[0]];
        });
        args.callbacks = args.callbacks || {};
        context.callbacks = context.callbacks || {};
        $(parameters.callbacks).each(function(){
            context.callbacks[this] = args.callbacks[this] || EMPTY_FUNCTION;
        });
    }
    function runMixin(ctx,mixin,args) {
        $(mixin).each(function(){(this || EMPTY_FUNCTION).apply(ctx,args);});
    }
    function clone(obj) {
        return $.extend(true,{},obj);
    }
    var loadCss = (function(){
        var loaded_css_files = {};
        var $head = $("head");
        return function(appName) {
            if (loaded_css_files[appName]) return false;
            var link = $("<link />",{
                type : "text/css"
                ,rel : "stylesheet"
                ,href : "css/"+appName+".css"
            })
            $head.append(link);
            loaded_css_files[appName] = true;
        }
    }())

    function extend(appName,args) {
        var method, F,parent_hash={},app,mixin_hash,tmp,prop,superConstructor=this;
        F = function(args) {
            if (!args) {return this;}
            applyParameters(this,this.initialParameters,args,appName);
            this.ext.constructor.apply(this,[args,superConstructor]);
            this.callbacks.onCreate(this);
        };
        parent_hash.parent = this.appName;
        F.prototype = new this();
        if (args.initialParameters) {
            for (prop in args.initialParameters) {
                F.prototype.initialParameters[prop] = F.prototype.initialParameters[prop].concat(args.initialParameters[prop]);
            }
        }

        tmp = F.prototype.ext.mixins;
        mixin_hash = clone(tmp);
        for (app in args.mixins) { if (args.mixins.hasOwnProperty(app)) {
            for (method in args.mixins[app]) { if (args.mixins[app].hasOwnProperty(method)) {
                mixin_hash[app][method] = (mixin_hash[app][method] || []).concat([args.mixins[app][method]]);
            }}
        }}
        F.prototype.ext = {
            mixins : mixin_hash
            ,constructor : args.constructor || EMPTY_FUNCTION
        };
        F.parentName = parent_hash.parent;
        F.appName = appName;
        F.extend = extend; //adding this method as a "static" method to the new application so it can be extended itself
        for (method in args.methods) {  if (args.methods.hasOwnProperty(method)) {
            F.prototype[method] = args.methods[method];
        }}
        for (var property in args.properties) {  if (args.properties.hasOwnProperty(property)) {
            F.prototype[property] = args.properties[property];
        }}
        loadCss(F.appName);
        return F;
    }

    /*
        Taken from the Hoodie project:
        https://github.com/hoodiehq/hoodie.js
     */
    function uuid(len) {
        var chars, i, radix,nums,letters;
        if (len == null) {
            len = 7;
        }
        nums = '0123456789'.split('');
        letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        chars = nums.concat(letters);
        radix = chars.length;
        return ((function() {
            var _i, _results;
            _results = [letters[0 | Math.random() * letters.length]];
            for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
                _results.push(chars[0 | Math.random() * radix]);
            }
            return _results;
        })()).join('');
    };
    function centroid(coords) {
        var sum = function(a,b){return a+b};
        var x_array = coords.map(function(xy){ return xy[0]; });
        var y_array = coords.map(function(xy){ return xy[1]; });
        var x_coord = (x_array.reduce(sum)/x_array.length);
        var y_coord = (y_array.reduce(sum)/y_array.length);

        return [x_coord,y_coord];
    }

    function camelize(str) {
        var cc = (str.split(" ")).map(function(word){
            return word[0].toUpperCase() + word.slice(1);
        }).join("")
        cc = cc[0].toLowerCase() + cc.slice(1);
        return cc;
    }


    var ParameterError = Error;
    return {
         applyParameters : applyParameters
        ,runMixin : runMixin
        ,clone : clone
        ,loadCss : loadCss
        ,extend : extend
        ,uuid : uuid
        ,centroid : centroid
        ,camelize : camelize
    }
})