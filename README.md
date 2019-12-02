# Delimited Stream

A Node.js Transform stream emitting buffered data at each delimiter instance.

Buffered data, delimiter excluded, is emitted each time the delimiter is encountered.

## Constructor

The constructor requires a Buffer instance or string value representing the delimiter.

```js
const stream = new DelimitedStream (delimiter)
```

## Example

Instantiate a stream with a [newline](https://en.wikipedia.org/wiki/Newline) sequence as the delimiter.


```js
const delimiter = Buffer.from ("\r\n")
const stream = new DelimitedStream (delimiter)
stream.on ('data', (data) => {
  const line = data.toString ('utf8')
  // do stuff
})
```

