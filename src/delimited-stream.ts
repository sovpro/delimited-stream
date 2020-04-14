import {Transform, TransformCallback} from 'stream'

const INDEX_NOT_FOUND = -1

export class DelimitedStream extends Transform {

  private buffer = Buffer.alloc (0)
  private delimiter: Buffer 
  private queue: Buffer[] = []
  private incl_delim: boolean

  constructor (
      delimiter: Buffer | string
    , incl_delim = false
  ) {
    super ()
    this.delimiter  = Buffer.from (delimiter.toString ('utf8'))
    this.incl_delim = incl_delim
  }

  _transform (
      chunk: Buffer
    , _encoding_: string
    , callback: TransformCallback
  ) {
    this.updateQueue (chunk)
    this.pushQueue ()
    callback ()
  }

  _final (callback: (error?: Error | null) => void) {
    if (this.buffer.length !== 0) {
      this.updateQueue (this.delimiter)
      this.pushQueue ()
    }
    callback ()
  }

  updateQueue (chunk: Buffer) {
    let temp_buffer = Buffer.concat ([this.buffer, chunk])
    let delimiter_index
    let next_temp_buffer_index;
    do {
      delimiter_index = temp_buffer.indexOf (this.delimiter)
      if (delimiter_index === INDEX_NOT_FOUND) break
      next_temp_buffer_index = delimiter_index + this.delimiter.length
      this.queue.push (
        temp_buffer.slice (0, (
          this.incl_delim ? next_temp_buffer_index : delimiter_index
        ))
      )
      temp_buffer = temp_buffer.slice (next_temp_buffer_index)
    }
    while (delimiter_index !== INDEX_NOT_FOUND)
    this.buffer = temp_buffer
  }

  pushQueue () {
    while (true) {
      if (this.queue.length === 0 ||
          this.push (this.queue.shift ()) === false)
        break
    }
  }

}
