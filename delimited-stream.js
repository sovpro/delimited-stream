const {Transform}      = require ('stream')

const INDEX_NOT_FOUND  = -1

// property symbols
const buffer_sym       = Symbol ()
const queue_sym        = Symbol ()
const delimiter_sym    = Symbol ()

// method symbols
const updateQueue_sym  = Symbol ()
const pushQueue_sym    = Symbol ()

class DelimitedStream extends Transform {

  constructor (delimiter) {
    super ()
    this[buffer_sym]     = Buffer.alloc (0)
    this[queue_sym]      = []
    this[delimiter_sym]  = Buffer.from (delimiter)
  }

  _transform (chunk, _encoding_, callback) {
    this[updateQueue_sym] (chunk)
    this[pushQueue_sym] ()
    callback ()
  }

  [updateQueue_sym] (chunk) {
    let temp_buffer = Buffer.concat ([this[buffer_sym], chunk])
    let delimiter_index = temp_buffer.indexOf (this[delimiter_sym])
    while (delimiter_index !== INDEX_NOT_FOUND) {
      const readable_buffer = temp_buffer.slice (0, delimiter_index)
      temp_buffer = temp_buffer.slice (delimiter_index + this[delimiter_sym].length)
      delimiter_index = temp_buffer.indexOf (this[delimiter_sym])
      if (readable_buffer.length) {
        this[queue_sym].push (readable_buffer)
      }
    }
    this [buffer_sym] = temp_buffer
  }

  [pushQueue_sym] () {
    while (true) {
      if (this[queue_sym].length === 0 ||
          this.push (this[queue_sym].shift ()) === false)
        break
    }
  }

}

exports.DelimitedStream = DelimitedStream
