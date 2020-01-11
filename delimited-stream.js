const {Transform}      = require ('stream')

const INDEX_NOT_FOUND  = -1

// property symbols
const buffer_sym       = Symbol ()
const queue_sym        = Symbol ()
const delimiter_sym    = Symbol ()
const incl_delim_sym   = Symbol ()

// method symbols
const updateQueue_sym  = Symbol ()
const pushQueue_sym    = Symbol ()

class DelimitedStream extends Transform {

  constructor (delimiter, incl_delim = false) {
    super ()
    this[buffer_sym]     = Buffer.alloc (0)
    this[queue_sym]      = []
    this[delimiter_sym]  = Buffer.from (delimiter)
    this[incl_delim_sym] = incl_delim
  }

  _transform (chunk, _encoding_, callback) {
    this[updateQueue_sym] (chunk)
    this[pushQueue_sym] ()
    callback ()
  }

  _final (callback) {
    if (this [buffer_sym].length !== 0) {
      this[updateQueue_sym] (this[delimiter_sym])
      this[pushQueue_sym] ()
    }
    callback ()
  }

  [updateQueue_sym] (chunk) {
    let temp_buffer = Buffer.concat ([this[buffer_sym], chunk])
    let delimiter_index
    let next_temp_buffer_index;
    do {
      delimiter_index = temp_buffer.indexOf (this[delimiter_sym])
      if (delimiter_index === INDEX_NOT_FOUND) break
      next_temp_buffer_index = delimiter_index + this[delimiter_sym].length
      this[queue_sym].push (
        temp_buffer.slice (0, (
          this[incl_delim_sym] ? next_temp_buffer_index : delimiter_index
        ))
      )
      temp_buffer = temp_buffer.slice (next_temp_buffer_index)
    }
    while (delimiter_index !== INDEX_NOT_FOUND)
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
