# Delimited Stream

A Node.js Transform stream emitting buffered data at each delimiter instance.

By default buffered data is emitted without the delimiter each time the delimiter is encountered. Optionally, the delimiter can be included by passing a value that evaluates to true as the second parameter to the constructor.

## Constructor

The constructor requires a Buffer instance or string value representing the delimiter.

```js
const stream = new DelimitedStream (delimiter)
```

Optionally a second parameter may be specified, representing whether to include the delimiter in the data. By default, the delimiter is excluded.

```js
// include delimiter in data
const stream = new DelimitedStream (delimiter, true)
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

