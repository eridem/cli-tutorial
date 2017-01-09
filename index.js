'use strict'

const { join, resolve } = require('path')
const camelCase = require('camelcase')
const requireDir = require('require-dir')
const colors = require('chalk')
const shell = require('shelljs')
const fs = require('fs')
const yargs = require('yargs')

// External dependencies to pass to the commands
let dep = { join, resolve, fs, console, colors, shell, process, yargs }

// Internal dependencies
const inDepFns = requireDir(join(__dirname, 'lib', 'modules'))
Object.keys(inDepFns).forEach(name => {
  dep[camelCase(name)] = inDepFns[name](dep)
})

// Load commands from folder and pass dependencies
const commandsFn = requireDir(join(__dirname, 'lib', 'commands'))
const commands = Object.keys(commandsFn).map((i) => commandsFn[i](dep))

// Export commands and modules separatelly
module.exports = { commands, modules: dep }
