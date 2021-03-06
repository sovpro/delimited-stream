/// <reference path="../../typings/vendor.d.ts" />
import assert       from 'assert'
import {DelimitedStream} from '../delimited-stream'
import {Readable}        from 'stream'
import splitRandomly    from '@sovpro/split-randomly'

const CHUNK_COUNT     = 6
const TEST_STR        = '[{"a":"A","b":"B","c":"C","d":[1,2,3,"thing"]},false]'
const DELIMITER       = "\r\n"
const ERR_NO_DELIM    = 'Bad data for result excluding delimiter'
const ERR_WITH_DELIM  = 'Bad data for result including delimiter'

let keeping_delim_count  = 0
let omitting_delim_count = 0
let test_count = 0

testBasics ({last_delimiter: true})
  .then (() => testBasics ({last_delimiter: false}))

process.on ('exit', () => {
  let expected_data_events = test_count
  assert (
      omitting_delim_count === expected_data_events
    , `There should be ${expected_data_events} data events emitted on the stream instance omitting delimiters`
  )
  assert (
      keeping_delim_count === expected_data_events
    , `There should be ${expected_data_events} data events emitted on the stream instance keeping delimiters`
  )
})

function testBasics ({last_delimiter}: {last_delimiter: boolean}): Promise<unknown> {
  test_count += 1

  const promise = new Promise ((fulfill, reject) => {
    const delimited_stream_no_delim = new DelimitedStream (DELIMITER, false)
    const delimited_stream_with_delim = new DelimitedStream (DELIMITER, true)

    delimited_stream_no_delim.on ('data', (data) => {
      const data_str = data.toString ('utf8')
      assert (data_str === TEST_STR, ERR_NO_DELIM)
      console.log ('delimited stream data omitting delimiter: %o', data_str)
      omitting_delim_count += 1
    })

    delimited_stream_with_delim.on ('data', (data) => {
      const data_str = data.toString ('utf8')
      assert (data_str === (TEST_STR + DELIMITER), ERR_WITH_DELIM)
      console.log ('delimited stream data keeping delimiter: %o', data_str)
      keeping_delim_count += 1
    })

    const chunk_list = splitRandomly (TEST_STR, CHUNK_COUNT)
      .concat (last_delimiter ? DELIMITER.split ("") : [])
    const socket_stream = getReadable (chunk_list.slice ())
    socket_stream.on ('end', fulfill)
    socket_stream.pipe (delimited_stream_no_delim)
    socket_stream.pipe (delimited_stream_with_delim)
  })

  return promise
}

function getReadable (chunk_list: string[]) {
  return new Readable({
    read (_num_bytes_) {
      if (chunk_list.length === 0)
        return this.push (null)
      let push = false;
      do {
        if (chunk_list.length === 0) break
        const current_chunk = chunk_list.shift ()
        console.log ('Pushing chunk: [[%o]]', current_chunk)
        push = this.push (current_chunk)
      }
      while (push)
    }
  })
}
