'use strict'

module.exports = function (dep) {
  let cmd = {}
  cmd.command = 'say <prefix>'
  cmd.desc = 'Prints: <prefix> name surname'
  cmd.builder = {
    name: {
      alias: 'n',
      describe: 'Pass the name',
      demand: true
    },
    surname: {
      alias: 's',
      describe: 'Pass the surname',
      demand: false
    }
  }
  cmd.handler = function (argv) {
    const { prefix, name, surname } = argv
    const { log } = dep
    const message = prefix + (name ? ' ' + name : '') + (surname ? ' ' + surname : '')
    log.debug(message)
  }
  return cmd
}
