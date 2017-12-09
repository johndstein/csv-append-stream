# csv-append-stream

Appends an array of streams into a single stream.

Assumes streams of CSV data where the first row is a header or any other type of
data where you want to keep the first row of the first stream, but remove it
from all subsequent streams.

Order is maintained.

**Install**

```sh
npm i csv-append-stream
```

**Enjoy**

```js
const appendStreams = require('csv-append-stream');
const fs = require('fs');
const streams = [];
streams.push(fs.createReadStream('./some.csv'));
streams.push(fs.createReadStream('./another.csv'));
appendStreams(streams).pipe(process.stdout);
```