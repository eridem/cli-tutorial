'use strict'
/* global describe, before, it */

require('chai').should()

describe('modules/log.js', function () {
  describe('.debug', function () {
    // Mocks
    let _latestConsolePrint
    const colors = { yellow: (m) => m, blue: (m) => m, gray: (m) => m }
    const console = { log: function () { _latestConsolePrint = arguments } }

    // Target
    const _module = require('../../../lib/modules/log')
    let _target

    before(function () {
      _latestConsolePrint = null
      _target = _module({ colors, console })
    })
    it('should print without title and description', function () {
      _target.debug('')
      _latestConsolePrint[0].should.equal('[MyCli]')
    })
    it('should print title', function () {
      _target.debug('Title')
      _latestConsolePrint[0].should.equal('[MyCli] Title')
    })
    it('should print title and description', function () {
      _target.debug('Title', 'Description')
      _latestConsolePrint[0].should.equal('[MyCli] Title Description')
    })
  })
})
