const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
var redis = require('redis');
const moment = require('moment');
const {Users} = require('./model/users');

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || 3000;

let app = express();
app.use(express.static(publicPath));

let server = http.createServer(app);
let io = socketIO(server);

var sub = redis.createClient();
var pub = redis.createClient();
sub.subscribe('chat');

let users = new Users();


io.on('connection',(socket)=> {

    //join chat 
    socket.on('join',(params, callback)=> {
        if(!(typeof params.name === 'string' && params.name.trim().length > 0)){
            callback('Name and room are required');
        }
     
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name);

        var reply = JSON.stringify({
            from: 'Admin',
            text: `${params.name} joined the channel. `,
            createdAt: moment().valueOf()
        });

        //redis publish
        pub.publish('chat', reply);
        callback();
    })

    //broadcasting message to everyone
    socket.on('createMessage', (message, callback)=> {
        let user = users.getUser(socket.id);
        if(user && (typeof message.text === 'string' && message.text.trim().length > 0)){
            var reply = JSON.stringify({
                from: user.name,
                text: message.text,
                createdAt: moment().valueOf()
            });
            
            //redis publish
            pub.publish('chat', reply);
        }
        callback('This is the server');
    });

    
    //on disconnect event
    socket.on('disconnect',()=> {
        let user = users.removeUser(socket.id);
        if(user){
            var reply = JSON.stringify({
                from: 'Admin',
                text: `${user.name} has left chat.`,
                createdAt: moment().valueOf()
            });
            pub.publish('chat', reply);
      
        }
    });


    //redis subscirbe
    sub.on('message', function(channel, message) {
        socket.emit(channel, message);
    });
    
})


server.listen(port, ()=> {
    console.log(`Server listening on port ${port}`);
})

