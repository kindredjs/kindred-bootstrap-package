var touch = require('touch')
var path = require('path')
var fs = require('fs')

module.exports = editTestFile

function editTestFile (directory, opts, done) {
  if (!opts.hasTest) return done()

  var file = path.resolve(directory, 'test.js')
  var base = path.resolve(__dirname, 'test.base.js')
  var circleFile = path.resolve(directory, 'circle.yml')
  var circleBase = path.resolve(__dirname, 'circle.yml')

  touch.sync(file)
  touch.sync(circleFile)
  fs.readFile(file, 'utf8', function (err, content) {
    if (err) return doCircle(err)
    if (content.trim()) return doCircle()
    fs.writeFile(file, fs.readFileSync(base, 'utf8'), doCircle)
  })

  function doCircle (err) {
    if (err) return done(err)

    fs.readFile(circleFile, 'utf8', function (err, content) {
      if (err) return done(err)
      if (content.trim()) return done()
      fs.writeFile(circleFile, fs.readFileSync(circleBase, 'utf8'), done)
    })
  }
}
