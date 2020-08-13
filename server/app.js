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

app.get('/api/get', async (req, res) => {
    const {amount, postnummer} = req.query

    const a = await scrape.getData(postnummer ? postnummer : "18591", amount ? amount : 10)
    res.send(a)

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
httpServer.listen(8001, () => console.log("Listening on 8100"))
//httpsServer.listen(8443)
