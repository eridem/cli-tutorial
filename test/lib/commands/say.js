'use strict'
/* global describe, before, it */

require('chai').should()

describe('command/say.js', function () {
  describe('.handler', function () {
    // Mocks
    let _latestLogMessage
    const log = { debug: function (msg) { _latestLogMessage = msg } }

    // Target
    const _module = require('../../../lib/commands/say')
    let _target

    before(function () {
      _latestLogMessage = null
      _target = _module({ log })
    })
    it('should print prefix and name', function () {
      _target.handler({ prefix: 'Hello', name: 'CLI' })
      _latestLogMessage.should.equal('Hello CLI')
    })
    it('should print prefix, name and surname', function () {
      _target.handler({ prefix: 'Hello', name: 'CLI', surname: 'ILC' })
      _latestLogMessage.should.equal('Hello CLI ILC')
    })
  })
})
