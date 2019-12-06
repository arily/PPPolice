[![Coverage Status](https://coveralls.io/repos/github/vanioinformatika/node-nano-async/badge.svg?branch=master)](https://coveralls.io/github/vanioinformatika/node-nano-async?branch=master)
[![Build Status](https://travis-ci.org/vanioinformatika/node-nano-async.svg?branch=master)](https://travis-ci.org/vanioinformatika/node-nano-async)

# node-nano-async
A promisified wrapper around the [nano](http://npmjs.com/package/nano) npm module,
to make it easily usable with ES2017 async-await.

The wrapper introduces new functions with 'Async' suffix to make using the original nano functions possible. It can be handy when you read/write attachments in streaming mode.

## Usage

### Javascript

```js
const nanoAsync = require('nano-async') (
  // Create a server context
const serverAsync = nanoAsync({ url: "http://localhost:5984" })
// Create a document context i.e. a "database" reference
const databaseAsync = serverScope.use("mydb")

// Read a document from the database
const [doc, headers] = await databaseAsync.getAsync(id, { attachments: true })

...

```

### TypeScript

```ts
// Import nano and nano-async types
import { default as nanoAsync, ServerScopeAsync, DocumentGetResponse, ... } from "nano-async"
// Import custom document class
import { MyDocument } from "./MyDocument"
// Create a server context
const serverAsync = nanoAsync({ url: "http://localhost:5984" }) as ServerScopeAsync
// Create a document context i.e. a "database" reference
const databaseAsync: DocumentScopeAsync<MyDocument> = serverAsync.use<MyDocument>("mydb")

// Read a document from the database
const [doc, headers] = await databaseAsync.getAsync(id, { attachments: true })
// doc is of type: DocumentGetResponse & MyDocument

...

```
