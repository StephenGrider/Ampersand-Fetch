var redtape = require('redtape');
var fetch = require('../ampersand-fetch');
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
  t.plan(2);

  model.on('request', function (model, xhr, options, ajaxSettings) {
    t.equal(ajaxSettings.type, 'GET');
    t.equal(ajaxSettings.useXDR, true);
    t.end();
  });
  fetch('read', model);
});

test('read', function (t) {

  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'GET');
    t.ok(!ajaxSettings.json);
    t.ok(!ajaxSettings.data);
    t.end();
  });
  model.fetch('read', model);
});

test('passing data', function (t) {
  // on reads it should be part of the URL

  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi?a=a&one=1', 'data passed to reads should be made into a query string');
    t.end();
  });
  fetch('read', model, {data: {a: 'a', one: 1}});
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

  fetch('create', model);
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

  fetch('update', model);
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

  fetch('update', model, options);

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

  fetch('update', model, options);
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

  fetch('update', model, options);

});

test('delete', function (t) {
  model.on('request', function(model, xhr, options, ajaxSettings){
    t.equal(ajaxSettings.url, '/hi');
    t.equal(ajaxSettings.type, 'DELETE');
    t.notOk(ajaxSettings.data);
    t.end();
  });

  fetch('delete', model);
});

test('urlError', function (t) {
  t.throws(function () {
    var xhr = fetch('read', {});
  }, Error);
  t.end();
});

test('Sync returns a promise', function(t) {
  t.plan(2);

  var promise = fetch('read', model);

  t.ok(promise.then);
  t.ok(promise.catch);
  t.end();
});
