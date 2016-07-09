var remark = require('remark')
var touch = require('touch')
var path = require('path')
var url = require('url')
var fs = require('fs')

module.exports = editReadme

function editReadme (directory, opts, done) {
  var file = path.resolve(directory, 'README.md')
  touch.sync(file)
  var content = fs.readFileSync(file, 'utf8')

  content = remark()
    .use(addHeader, opts)
    .use(addBadges, opts)
    .use(addDescription, opts)
    .use(addUsage, opts)
    .use(addLicense, opts)
    .process(content)
    .contents

  fs.writeFileSync(file, content)

  done()
}

function addHeader (_, opts) {
  opts = opts || {}

  return function (root, file) {
    for (var i = 0; i < root.children.length; i++) {
      var node = root.children[i]
      if (node.type === 'heading') return
      if (node.type === 'paragraph') break
    }

    root.children.unshift({
      type: 'heading',
      depth: 1,
      children: [{
        type: 'text',
        value: opts.packageName
      }]
    })
  }
}

function addDescription (_, opts) {
  return function (root, file) {
    for (var i = 0; i < root.children.length; i++) {
      var node = root.children[i]
      if (node._badges) break
    }

    var desc = root.children[i + 1]
    if (desc && desc.type === 'paragraph') return

    root.children.splice(i + 1, 0, {
      type: 'paragraph',
      children: [{
        type: 'text',
        value: opts.packageDescription
      }]
    })
  }
}

function addBadges (_, opts) {
  opts = opts || {}

  return function (root, file) {
    for (var i = 0; i < root.children.length; i++) {
      var node = root.children[i]
      if (node.type === 'heading') break
    }

    var row = root.children[++i]
    var hasBadges = false

    if (row) {
      for (var r = 0; r < row.children.length; r++) {
        var link = row.children[r]
        if (link.type !== 'link') continue
        if (link.children[0] && link.children[0].type === 'image') {
          hasBadges = true
          break
        }
      }
    }

    if (!hasBadges) {
      root.children.splice(i, 0, row = {
        type: 'paragraph',
        children: []
      })
    }

    row._badges = true

    var badgesNeeded = {
      stability: true,
      standard: true,
      npm: true,
      circle: opts.hasTest
    }

    // Check badges manually based on their link destinations
    for (var b = 0; b < row.children.length; b++) {
      var badge = row.children[b]
      if (badge.type !== 'link') continue

      var uri = url.parse(badge.url)
      if (uri.hash === '#documentation_stability_index') {
        badgesNeeded.stability = false
      } else
      if (uri.host === 'standardjs.com') {
        badgesNeeded.standard = false
      } else
      if (uri.host === 'npmjs.com') {
        badgesNeeded.npm = false
      } else
      if (uri.host === 'circleci.com') {
        badgesNeeded.circle = false
      }
    }

    if (badgesNeeded.stability) {
      addBadge(
        'https://nodejs.org/api/documentation.html#documentation_stability_index',
        'https://img.shields.io/badge/stability-experimental-ffa100.svg?style=flat-square'
      )
    }
    if (badgesNeeded.standard) {
      addBadge(
        'http://standardjs.com/',
        'https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square'
      )
    }
    if (badgesNeeded.npm) {
      addBadge(
        'https://npmjs.com/package/' + opts.packageName,
        'https://img.shields.io/npm/v/' + opts.packageName + '.svg?style=flat-square'
      )
    }
    if (badgesNeeded.circle) {
      addBadge(
        'https://circleci.com/gh/kindredjs/' + opts.packageName,
        'https://img.shields.io/circleci/project/kindredjs/' + opts.packageName + '/master.svg?style=flat-square'
      )
    }

    // Ensure there's a newline between each badge
    for (var s = 1; s < row.children.length; s++) {
      var curr = row.children[s - 1]
      var next = row.children[s]
      if (curr.type === 'link' && next.type === 'link') {
        row.children.splice(s, 0, {
          type: 'text',
          value: '\n'
        })
      }
    }

    function addBadge (link, image) {
      row.children.push({
        type: 'link',
        url: link,
        children: [{
          type: 'image',
          url: image
        }]
      })
    }
  }
}

function addUsage (_, opts) {
  opts = opts || {}

  return function (root, file) {
    for (var i = 0; i < root.children.length; i++) {
      var node = root.children[i]
      if (node.type !== 'heading') continue
      var name = node.children[0].value || ''
      if (name.toLowerCase().indexOf('usage') !== -1) return
    }

    root.children.push({
      type: 'heading',
      depth: 2,
      children: [{
        type: 'text',
        value: 'Usage'
      }]
    })
  }
}

function addLicense (_, opts) {
  opts = opts || {}

  return function (root, file) {
    for (var i = 0; i < root.children.length; i++) {
      var node = root.children[i]
      if (node.type !== 'heading') continue
      var name = node.children[0].value || ''
      if (name.toLowerCase() === 'license') return
    }

    root.children.push({
      type: 'heading',
      depth: 2,
      children: [{
        type: 'text',
        value: 'License'
      }]
    }, {
      type: 'paragraph',
      children: [{
        type: 'text',
        value: 'MIT. See '
      }, {
        type: 'link',
        title: null,
        url: 'LICENSE.md',
        children: [{
          type: 'text',
          value: 'LICENSE.md'
        }]
      }, {
        type: 'text',
        value: ' for details.'
      }]
    })
  }
}
