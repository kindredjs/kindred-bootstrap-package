var touch = require('touch')
var path = require('path')
var fs = require('fs')

module.exports = editDemo

function editDemo (directory, opts, done) {
  if (!opts.hasDemo) return done()

  var file = path.resolve(directory, 'demo.js')
  var base = path.resolve(__dirname, 'demo.base.js')

  touch.sync(file)
  fs.readFile(file, 'utf8', function (err, content) {
    if (err) return done(err)
    if (content.trim()) return done()
    fs.writeFile(file, fs.readFileSync(base, 'utf8'), done)
  })
}
