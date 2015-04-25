var _ = require('lodash');
var qs = require('qs');

// Throw an error when a URL is needed, and none is supplied.
var urlError = function () {
    throw new Error('A "url" property or function must be specified');
};

module.exports = function (method, model, options) {
  if(!fetch) {
    throw new Error('Native #Fetch not found');
  }
  var type = methodMap[method];
  var url;
  var headers = {};
  headers['Content-Type'] = 'application/json';

  // Default options, unless specified.
  _.defaults(options || (options = {}), {
    emulateHTTP: false,
    emulateJSON: false
  });

  // Default request options.
  var params = {type: type};

  // Ensure that we have a URL.
  if (options.url) {
    url = options.url;
  } else{
    url = _.result(model, 'url') || urlError();
  }

  // Ensure that we have the appropriate request data.
  if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.json = options.attrs || model.toJSON(options);
  }

  // If passed a data param, we add it to the URL or body depending on request type
  if (options.data && type === 'GET') {
    // make sure we've got a '?'
    url += _.contains(url, '?') ? '&' : '?';
    url += qs.stringify(options.data);
  }

  // For older servers, emulate JSON by encoding the request into an HTML-form.
  if (options.emulateJSON) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    params.body = params.json ? {model: params.json} : {};
    delete params.json;
  }

  // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
  // And an `X-HTTP-Method-Override` header.
  if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
    params.type = 'POST';
    if (options.emulateJSON) params.body._method = type;
    headers['X-HTTP-Method-Override'] = type;
  }

  // When emulating JSON, we turn the body into a querystring.
  // We do this later to let the emulateHTTP run its course.
  if (options.emulateJSON) {
    params.body = qs.stringify(params.body);
  }

  // Start setting ajaxConfig options (headers, xhrFields).
  var ajaxConfig = (_.result(model, 'ajaxConfig') || {});

  // Combine generated headers with user's headers.
  if (ajaxConfig.headers) {
    _.extend(headers, ajaxConfig.headers);
  }
  params.headers = headers;

  //Set XDR for cross domain in IE8/9
  if (ajaxConfig.useXDR) {
    params.useXDR = true;
  }

  // Turn a jQuery.ajax formatted request into xhr compatible
  params.method = params.type;

  var ajaxSettings = _.extend(params, options, {url: url});

  function status(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    throw new Error(response.statusText);
  }

  function json(response) {
    return response.json();
  }

  var promise = fetch(url, ajaxSettings)
    .then(status)
    .then(json)
    .then(function(json) {
      if(options.success && _.isFunction(options.success)){
        options.success(json);
      }
      return json;
    }).catch(function(error) {
      if(options.error && _.isFunction(options.error)) {
        options.fail(error);
      }
      return error;
    });

  model.trigger('request', model, promise, options, ajaxSettings);

  return promise;
};

// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
};
