# ampersand-sync-promise

Standalone, modern-browser-only version of Backbone.Sync as Common JS module.

Use this instead of ampersand's standard sync to return a promise instead of an XHR object.

Uses the popular [Q library](https://www.npmjs.org/package/q) for promise implementation

All credit to the original Ampersand JS team.

## install

```
npm install ampersand-sync-promise
```

## running the tests

```
npm test
```

Tests are written in [tape](https://github.com/substack/tape) and since they require a browser environment it gets run in a headless browser using phantomjs via [tape-run](https://github.com/juliangruber/tape-run). Make sure you have phantomjs installed for this to work. 

You can also run `npm start` then open a browser.

<!-- starthide -->

## license

MIT

<!-- endhide -->
