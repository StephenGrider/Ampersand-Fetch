if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis ? this: oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

var redtape = require('redtape');
var sync = require('../ampersand-sync-promise');
var Model = require('ampersand-model');

var Me = Model.extend({
  url: '/hi',
  props: {
    title: 'string',
    author: 'string',
    length: 'number'
  },
  ajaxConfig: {
    useXDR: true,
    xhrFields: {
      withCredentials: true
    }
  }
});

var model;

var test = redtape({
  beforeEach: function(cb){
    model = new Me({
      title: 'Midsummer Nights Dream',
      author: 'Shakespeare',
      length: 123
    });
    cb();
  },
  afterEach: function(cb) {

    cb();
  }
});

test('should allow models to overwrite ajax configs at the model level', function (t) {
  t.plan(3);

  model.on('request', function (model, xhr, options, ajaxSettings) {
    t.equal(ajaxSettings.type, 'GET');
    t.equal(ajaxSettings.xhrFields.withCredentials, true);
    t.equal(ajaxSettings.useXDR, true);
    t.end();
  });
  sync('read', model);
});

test('read', function (t) {

  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'GET');
    t.ok(!ajaxSettings.json);
    t.ok(!ajaxSettings.data);
    t.end();
  });
  model.sync('read', model);
});

test('passing data', function (t) {
  // on reads it should be part of the URL

  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi?a=a&one=1', 'data passed to reads should be made into a query string');
    t.end();
  });
  sync('read', model, {data: {a: 'a', one: 1}});
});

test('create', function (t) {
  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'POST');
    t.equal(ajaxSettings.headers['Content-Type'], 'application/json');
    var data = ajaxSettings.json;
    t.equal(data.title, 'Midsummer Nights Dream');
    t.equal(data.author, 'Shakespeare');
    t.equal(data.length, 123);
    t.end();
  });
  
  sync('create', model);
});

test('update', function (t) {

  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'PUT');
    t.equal(ajaxSettings.headers['Content-Type'], 'application/json');
    var data = ajaxSettings.json;
    t.equal(data.title, 'Midsummer Nights Dream');
    t.equal(data.author, 'Shakespeare');
    t.end();
  });
  
  sync('update', model);
});

test('update with emulateHTTP and emulateJSON', function (t) {
  
  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'POST');
    t.equal(ajaxSettings.body, 'model%5Btitle%5D=Midsummer%20Nights%20Dream&model%5Bauthor%5D=Shakespeare&model%5Blength%5D=123&_method=PUT');
    t.equal(ajaxSettings.headers['Content-Type'], 'application/x-www-form-urlencoded');
    t.end();
  });

  var options = {
    emulateHTTP: true,
    emulateJSON: true
  };

  sync('update', model, options);

});

test('update with just emulateHTTP', function (t) {

  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'POST');
    t.equal(ajaxSettings.headers['Content-Type'], 'application/json');
    var data = ajaxSettings.json;
    t.equal(data.title, 'Midsummer Nights Dream');
    t.equal(data.author, 'Shakespeare');
    t.equal(data.length, 123);
    t.end();
  });
  
  var options = {
    emulateHTTP: true
  };

  sync('update', model, options);
});

test("update with just emulateJSON", function (t) {
  

  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'PUT');
    t.equal(ajaxSettings.headers['Content-Type'], 'application/x-www-form-urlencoded');
    t.equal(ajaxSettings.body, 'model%5Btitle%5D=Midsummer%20Nights%20Dream&model%5Bauthor%5D=Shakespeare&model%5Blength%5D=123');
    t.end();
  });
  
  var options = {
    emulateJSON: true
  };
  
  sync('update', model, options);
  
});

test('delete', function (t) {
  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'DELETE');
    t.notOk(ajaxSettings.data);
    t.end();
  });
  
  sync('delete', model);
});

test('destroy with emulateHTTP', function (t) {
  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(xhr.ajaxSettings.url, '/hi');
    t.equal(xhr.ajaxSettings.type, 'POST');
    t.equal(xhr.ajaxSettings.body, '_method=DELETE');
    t.end();
  });

  var options = {
    emulateHTTP: true,
    emulateJSON: true
  };
  sync('delete', model, options);
});

test('urlError', function (t) {
  t.throws(function () {
    var xhr = sync('read', {});
  }, Error);
  t.end();
});

test('Call user provided beforeSend function.', function (t) {
  t.plan(1);

  var options = {
    beforeSend: function (_xhr) {
      t.pass();
    },
    emulateHTTP: true
  };
  sync('delete', model, options);
  t.end();
});

test('Sync returns a promise', function(t) {
  t.plan(2);
  
  var promise = sync('read', model);
  
  t.ok(promise.done);
  t.ok(promise.finally);
  t.end();
});