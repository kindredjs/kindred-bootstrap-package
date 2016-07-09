#!/usr/bin/env node

var inquirer = require('inquirer')
var map = require('map-limit')
var path = require('path')

module.exports = runEdits

function runEdits (root, opts, done) {
  map([
    require('./edits/readme'),
    require('./edits/license'),
    require('./edits/package'),
    require('./edits/index'),
    require('./edits/test'),
    require('./edits/demo'),
    require('./edits/gitignore')
  ], 1, function (fn, next) {
    fn(root, opts, next)
  }, done)
}

if (!module.parent) {
  var pkg = {}

  try {
    pkg = require(process.cwd() + '/package.json')
  } catch (e) {}

  inquirer.prompt([{
    type: 'input',
    name: 'packageName',
    message: 'Package name:',
    default: pkg.name || path.basename(process.cwd())
  }, {
    type: 'input',
    name: 'packageDescription',
    message: 'Package description:',
    default: pkg.description || ''
  }, {
    type: 'confirm',
    name: 'hasDemo',
    message: 'Include web demo:',
    default: !!(pkg.scripts && pkg.scripts.start)
  }, {
    type: 'confirm',
    name: 'hasTest',
    message: 'Include tests:',
    default: !!(pkg.scripts && pkg.scripts.test)
  }]).then(function (responses) {
    module.exports(process.cwd(), responses, function (err) {
      if (err) throw err
    })
  }).catch(function (err) {
    console.error(err.message)
    console.error(err.stack)
  })
}
