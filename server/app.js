'use strict'

const fs = require('fs')
const http = require('http')
const https = require('https')

const path = require('path');
const express = require('express');

const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')
//logging
var morgan = require('morgan')

const helmet = require('helmet')

app.use(helmet())

app.use(cors())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Console logging
app.use(morgan('dev'));

app.use(express.urlencoded({
    extended: true,
}));

const scrape = require('./scrape');
// const { resolve } = require('path');

// const test = async function() {
//     return new Promise((resolve, reject) => {
//         setTimeout(resolve, 5000)
//     });
// }

app.get('/', async (req, res) => {
    // scrape.getData("18535", 10)
    // .then(data => {
    //     console.log(data)
    //     res.json(data)
    // })

    const a = await scrape.getData("18535", 10)
    res.send(a)
    
    // await test()
    // res.send("Hej")

    // .then(data => {
    //     console.log("result: " + data)
    //     res.send(data)
    // })
    // .then(result => {
    //     console.log("PROMISE")
    //     console.log(result)
    // })
})

// app.use(express.static(path.join(__dirname, '../client/build')))

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
// })

const httpServer = http.createServer(app)
//const httpsServer = https.createServer({
//     key: fs.readFileSync('../../axelelmarsson_certs/privkey.pem', 'utf8'),
//     cert: fs.readFileSync('../../axelelmarsson_certs/cert.pem', 'utf8'),
//     ca: fs.readFileSync('../../axelelmarsson_certs/chain.pem', 'utf8')
//}, app)
httpServer.listen(8001, () => console.log("Listening on 8001"))
//httpsServer.listen(8443)
