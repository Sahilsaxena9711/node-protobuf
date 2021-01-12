let path = require('path')
let express = require('express')
let ProtoBuf = require('protobufjs')

let app = express()
let builder = ProtoBuf.loadProtoFile(
    path.join(__dirname,
        './',
        'message.proto')
)
let Message = builder.build('Message')
let messages = [
    { text: 'hey', lang: 'english' },
    { text: 'isänme', lang: 'tatar' },
    { text: 'hej', lang: 'swedish' }
]

// app.use(express.static())

app.use(function (req, res, next) {
    if (!req.is('application/octet-stream')) return next()
    var data = [] // List of Buffer objects
    req.on('data', function (chunk) {
        data.push(chunk) // Append Buffer object
    })
    req.on('end', function () {
        if (data.length <= 0) return next()
        data = Buffer.concat(data) // Make one large Buffer of it
        console.log('Received buffer', data)
        req.raw = data
        next()
    })
})

app.get('/api/messages', (req, res, next) => {
    let msg = new Message(messages[Math.round(Math.random() * 2)])
    console.log('Encode and decode: ',
        Message.decode(msg.encode().toBuffer()))
    console.log('Buffer we are sending: ', msg.encode().toBuffer())
    // res.end(msg.encode().toBuffer(), 'binary') // alternative
    res.send(msg.encode().toBuffer())
    // res.end(Buffer.from(msg.toArrayBuffer()), 'binary') // alternative
})

app.listen(3000)