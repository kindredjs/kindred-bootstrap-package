# kindred-bootstrap-package

[![](https://img.shields.io/badge/stability-experimental-ffa100.svg?style=flat-square)](https://nodejs.org/api/documentation.html#documentation_stability_index)
[![](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)
[![](https://img.shields.io/npm/v/kindred-bootstrap-package.svg?style=flat-square)](https://npmjs.com/package/kindred-bootstrap-package)

Bootstraps an npm package to follow kindred's recommendations for testing, demos, etc. to keep everything consistent, while still easy to set up.

These updates are (mostly) non-destructive, so you can run a bootstrap multiple times to add tests/demos or change the name/description of your package.

## CLI Usage

Firstly, install `kindred-bootstrap-package` using [npm](https://npmjs.com/package/):

```bash
npm install -g kindred-bootstrap-package
```

Once installed, you can run this in your package's root directory to start the process:

```bash
kindred-bootstrap-package
```

## API Usage

You can use this package programatically too!

```javascript
var bootstrap = require('kindred-bootstrap-package')

bootstrap(process.cwd(), {
  packageName: 'hello-world',
  packageDescription: 'Just a test...',
  hasTest: false,
  hasDemo: false
}, function (err) {
  if (err) throw err
  console.log('all done!')
})
```

### `bootstrap(directory, params, done)`

Bootstraps the package at `directory`. The following parameters are all **required**:

-   `params.packageName`: the name of your package.
-   `params.packageDescription`: your package's description.
-   `params.hasTest`: set to `true` to setup tape and CircleCI config.
-   `params.hasDemo`: set to `true` to setup your package for a simple `gh-pages` demo.

The `done(err)` callback is called when complete.

## License

MIT. See [LICENSE.md](LICENSE.md) for details.
