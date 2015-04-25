# ampersand-fetch

Drop in replacement for ampersand-sync that uses React Native's #fetch method.

You'll need to override Ampersand Model's default sync method:

```
var Model = require('ampersand-model');
var Fetch = require('ampersand-fetch');

var AmznModel = Model.extend({
  sync() {
    return Fetch.apply(this, arguments);
  }
});

module.exports = AmznModel;
```

## install

```
npm install ampersand-fetch
```

## running specs

```
npm test
```

<!-- starthide -->

## license

MIT

<!-- endhide -->
