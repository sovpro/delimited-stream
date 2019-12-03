const assert             = require ('assert')
const {DelimitedStream}  = require ('./delimited-stream')
const {Readable} = require ('stream')

const CHUNK_INTERVAL  = 175
const CHUNK_COUNT     = 6
const LIST_SIZE       = 3
const TEST_STR        = '[{"a":"A","b":"B","c":"C","d":[1,2,3,"thing"]},false]'
const DELIMITER       = "\r\n"
const ERR_NO_DELIM    = 'Bad data for result excluding delimiter'
const ERR_WITH_DELIM  = 'Bad data for result including delimiter'

let chunk_list        = makeChunkList (LIST_SIZE, CHUNK_COUNT, TEST_STR, DELIMITER)
let chunk_cursor      = 0
let chunk_queue       = []
let push_timeout      = null

const socket_stream = new Readable({
  read (_num_bytes_) {
    if (push_timeout === null) {
      push_timeout = setTimeout (function pushQueue () {
        let push = true
        while (chunk_queue.length && push) {
          const current_chunk = chunk_queue.shift ()
          console.debug ('Pushing chunk: [[%o]]', current_chunk)
          push = this.push (current_chunk)
        }
        if (push === false)
          push_timeout = null
        else
          setTimeout (pushQueue.bind (this), CHUNK_INTERVAL)
      }.bind (this), CHUNK_INTERVAL)
    }
  }
})

const delimited_stream_no_delim = new DelimitedStream (DELIMITER, false)
const delimited_stream_with_delim = new DelimitedStream (DELIMITER, true)

delimited_stream_no_delim.on ('data', (data) => {
  const data_str = data.toString ('utf8')
  assert (data_str === TEST_STR, ERR_NO_DELIM)
  console.log ('delimited stream no delim data: %o', data_str)
})

delimited_stream_with_delim.on ('data', (data) => {
  const data_str = data.toString ('utf8')
  assert (data_str === (TEST_STR + DELIMITER), ERR_WITH_DELIM)
  console.log ('delimited stream with delim data: %o', data_str)
})

socket_stream.pipe (delimited_stream_no_delim)
socket_stream.pipe (delimited_stream_with_delim)

queueChunk()

function chunkifyStr (chunk_count, str) {
  let list = [str]
  while (chunk_count > 0) {
    let i = list.reduce ((a, s, i) => s.length > a ? i : a, 0)
    let str = list[i]
    let pivot = Math.round (Math.random () * str.length)
    if (pivot === 0) pivot = 1
    else if (pivot === list.length) pivot = str.length - 1
    let left_part = str.substring (0, pivot)
    let right_part = str.substr (pivot)
    for (let j = list.length; j > i; j -= 1) {
      list[j] = list[j - 1]
    }
    list[i] = left_part
    list[i + 1] = right_part
    chunk_count -= 1
  }
  return list
}

function makeChunkList (list_size, chunk_count, test_str, delim) {
  return (
    new Array (list_size)
      .fill (null)
      .reduce ((list) => list.concat(
        chunkifyStr (chunk_count, test_str).concat (
          delim.toString ('utf8').split ('')
        )
      ), [])
  )
}

function queueChunk () {
  if (chunk_cursor >= chunk_list.length)
    return chunk_queue.push (null)
  const current_chunk = chunk_list[chunk_cursor++]
  chunk_queue.push (current_chunk)
  setTimeout (() => queueChunk (), CHUNK_INTERVAL)
}
