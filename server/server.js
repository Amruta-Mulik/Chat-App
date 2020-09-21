const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, validInputs} = require('./utils/message');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));

io.on('connection',(socket)=> {
    
    socket.on('join',(params, callback)=> {
        if(!validInputs(params.name) || !validInputs(params.room)){
            callback('Name and room are required');
        }
        
        //join to specific room
        socket.join(params.room);

        //remove user from any other room
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        //broadcast to room users
        io.to(params.room).emit('updateUsersList', users.getUserList(params.room));

        //welcome message to new user
        socket.emit('newMessage', generateMessage("Admin",`Welcome to ${params.room}!`));

        //brodcast to everyone in room except the new user
        socket.broadcast.to(params.room).emit('newMessage', generateMessage("Admin","New user Joined!"));

        callback();
    })

    //broadcasting to everyone
    socket.on('createMessage', (message, callback)=> {
        
        let user = users.getUser(socket.id);

        if(user && validInputs(message.text)){
            io.to(user.room).emit('newMessage', generateMessage(user.name,message.text));
        }
        
        callback('This is the server');
    });

    

    socket.on('disconnect',()=> {
        let user = users.removeUser(socket.id);

        if(user){
            io.to(user.room).emit('updateUsersList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left ${user.room} chat room`));
        }
    });
    
})


server.listen(port, ()=> {
    console.log(`Listening on port ${port}`);
})