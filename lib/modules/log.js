'use strict'

module.exports = function (dep) {
  let result = {}

  result.debug = function (title, message) {
    const { console } = dep
    const { yellow, blue, gray } = dep.colors

    console.log(yellow('[MyCli]') + (title ? blue(' ' + title) : '') + (message ? gray(' ' + message) : ''))
  }

  return result
}
