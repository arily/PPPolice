const fs = require('fs');

let data = fs.readFileSync('./latest.json')

data = JSON.parse(data);
// console.log(db);

const assert = require('assert');

// Connection URL
const config = require("../config/pppolice");
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = config.db.url;

// Database Name
const dbName = config.db.dbName;

// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true });

// Use connect method to connect to the Server
client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection('osu');
    for (let i in data) {
        let account = data[i]
        console.log(`save\t${account.id} \t${account.name} `);
        collection.insertOne(account, (err, db) => {
            console.log(`done \t ${account.id} \t ${account.name}`);
        })
    }
});





// const { default: nanoAsync } = require('nano-async')
// // Create a server context
// const serverScope = nanoAsync({ url: "http://localhost:5984" })
// // Create a document context i.e. a "database" reference
// const databaseAsync = serverScope.use("pppolice-osu");


// Object.keys(db).map(user => {
//     id = user;
//     user = db[user];
//     user._id = id;
//     console.log('save ', id);
//     databaseAsync.insertAsync(user);
// })