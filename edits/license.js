var touch = require('touch')
var path = require('path')
var fs = require('fs')

module.exports = editLicenseMD

function editLicenseMD (directory, opts, done) {
  var file = path.resolve(directory, 'LICENSE.md')

  touch.sync(file)
  fs.readFile(file, 'utf8', function (err, content) {
    if (err) return done(err)
    if (content.trim()) return done()

    fs.writeFile(file,
      fs.readFileSync(path.resolve(__dirname, 'LICENSE.md'), 'utf8'),
      done
    )
  })
}
