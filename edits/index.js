var cheerio = require('cheerio')
var touch = require('touch')
var path = require('path')
var fs = require('fs')

module.exports = editIndexHTML

function editIndexHTML (directory, opts, done) {
  if (!opts.hasDemo) return done()

  var file = path.resolve(directory, 'index.html')
  var template = path.resolve(__dirname, 'index.html')

  touch.sync(file)
  fs.readFile(file, 'utf8', function (err, content) {
    if (err) return done(err)

    content = content.trim()
      ? content
      : fs.readFileSync(template, 'utf8')

    var $ = cheerio.load(content)
    var $corner = $('.github-corner')
    var $description = $('meta[name="description"]')
    var $title = $('title')

    $corner.attr('href', 'https://github.com/kindredjs/' + opts.packageName)
    $description.attr('content', opts.packageDescription)
    $title.html(opts.packageName)

    fs.writeFile(file, $.html(), done)
  })
}
