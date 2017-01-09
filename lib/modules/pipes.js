'use strict'

module.exports = function (dep) {
  let result = {}

  result.default = (v) => {
    // If we got provided the default
    if (dep.yargs.argv[v]) {
      return dep.yargs.argv[v]
    }

    // Get the default from stdin

    dep.process.stdin.resume()

    const BUFFER_LENGTH = 32
    const buffer = Buffer.alloc(BUFFER_LENGTH)
    let data, bytesReaded
    do {
      bytesReaded = dep.fs.readSync(process.stdin.fd, buffer, 0, BUFFER_LENGTH)
      data = (data || '') + buffer.toString(null, 0, bytesReaded)
    } while (bytesReaded !== 0 && bytesReaded >= BUFFER_LENGTH)

    process.stdin.pause()

    return data.replace(/\n$/, '')
  }

  return result
}
