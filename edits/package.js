var spawn = require('child_process').spawn
var stats = require('npm-stats')()
var semver = require('semver')
var map = require('map-limit')
var touch = require('touch')
var path = require('path')
var fs = require('fs')

module.exports = editPackageJSON

function editPackageJSON (directory, opts, done) {
  var file = path.resolve(directory, 'package.json')
  var shouldInstall = false

  touch.sync(file)
  fs.readFile(file, 'utf8', function (err, content) {
    if (err) return done(err)

    var pkg = content.trim() ? JSON.parse(content) : {}
    var tasks = []

    pkg.name = opts.packageName
    pkg.description = opts.packageDescription
    pkg.version = pkg.version || '1.0.0'
    pkg.license = pkg.license || 'MIT'
    pkg.scripts = pkg.scripts || {}
    pkg.dependencies = pkg.dependencies || {}
    pkg.devDependencies = pkg.devDependencies || {}
    pkg.tags = pkg.tags || []
    pkg.repository = pkg.repository || {
      type: 'git'
    }

    pkg.repository.url = 'https://github.com/kindredjs/' + opts.packageName
    pkg.scripts.posttest = pkg.scripts.posttest || 'standard'

    if (pkg.tags.indexOf('ecosystem:kindred') === -1) {
      pkg.tags.unshift('ecosystem:kindred')
    }

    tasks.push(addLatest('standard', 'devDependencies'))

    if (opts.hasDemo) {
      pkg.scripts.start = pkg.scripts.start || 'budo demo.js:bundle.js'
      pkg.scripts.bundle = pkg.scripts.bundle || 'browserify demo.js -o bundle.js'
      pkg.scripts.preversion = pkg.scripts.preversion || 'npm t'
      tasks.push(addLatest('browserify', 'devDependencies'))
      tasks.push(addLatest('budo', 'devDependencies'))
    }

    if (opts.hasTest) {
      pkg.scripts.test = pkg.scripts.test || 'node test | tspec'
      tasks.push(addLatest('tape', 'devDependencies'))
      tasks.push(addLatest('tap-spec', 'devDependencies'))
    }

    map(tasks, 1, function (task, next) {
      task(pkg, next)
    }, function (err) {
      if (err) return done(err)

      writeUpdatedPackage(pkg, function (err) {
        if (err) return done(err)
        if (!shouldInstall) return done()

        spawn('npm', ['install'], {
          env: process.env,
          stdio: 'inherit'
        }).once('exit', function () {
          done()
        })
      })
    })
  })

  function writeUpdatedPackage (pkg, done) {
    fs.writeFile(file, JSON.stringify(pkg, null, 2) + '\n', done)
  }

  function addLatest (packageName, group) {
    group = group || 'dependencies'

    return function (pkg, next) {
      var ignore = !!pkg[group][packageName]
      if (ignore) return next()
      shouldInstall = true

      stats.module(packageName).info(function (err, info) {
        if (err) return next(err)

        var versions = Object.keys(info.versions)
        var latest = semver.maxSatisfying(versions, '*')
        var range = '^' + latest

        pkg[group][packageName] = range
        next()
      })
    }
  }
}
