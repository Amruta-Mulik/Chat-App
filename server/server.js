var config = require('./config/config');
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const mongo = require('mongodb').MongoClient;

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || config.PORT;

let app = express();
app.use(express.static(publicPath));

let server = http.createServer(app);
let io = socketIO(server);

var handleEvents = require('./events/index');


// Connect to mongo
mongo.connect(config.MONGO_URL, config.MONGO_OPTIONS, function(err, client){
    if(err){
        throw err;
    }
    console.log('MongoDB connected...');
    handleEvents(io,client);
  
});


server.listen(port, ()=> {
    console.log(`Server listening on port ${port}`);
})

