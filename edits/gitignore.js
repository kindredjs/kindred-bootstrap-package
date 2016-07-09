var touch = require('touch')
var path = require('path')
var fs = require('fs')

module.exports = editGitignore

function editGitignore (directory, opts, done) {
  var file = path.resolve(directory, '.gitignore')
  var base = path.resolve(__dirname, '_gitignore')

  touch.sync(file)
  fs.readFile(file, 'utf8', function (err, content) {
    if (err) return done(err)
    if (content.trim()) return done()
    fs.writeFile(file, fs.readFileSync(base, 'utf8'), done)
  })
}
