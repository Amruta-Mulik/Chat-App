var config = require('../config/config');
var redis = require('redis');
const moment = require('moment');
const {Users} = require('../model/users');

var sub = redis.createClient(config.REDIS_URL);
var pub = redis.createClient(config.REDIS_URL);
sub.subscribe('chat');

let users = new Users();

module.exports = function(io,mongoclient) {
    //listen to socket connection
    io.on('connection',(socket)=> {
        let chat = mongoclient.db('mongochat').collection('chats');

        /* 
        Storing and emitting connect notifications(to new user and to already connected users) 
        */
        socket.on('join',(params, callback)=> {
            if(!(typeof params.name === 'string' && params.name.trim().length > 0)){
                callback('Name is required');
            }
         
            users.addUser(socket.id, params.name);
    
            var join_notification = JSON.stringify([{
                from: 'Admin',
                text: `${params.name} joined the channel. `,
                createdAt: moment().valueOf()
            }]);
    
            
            chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
                if(err){
                    throw err;
                }
                socket.emit('chat', JSON.stringify(res)); //initial data loading for new connected user( emiting to only sender)

                 //redis publish
                pub.publish('chat', join_notification);
            });
            
           
            chat.insertMany(JSON.parse(join_notification),function(err,res){});
            
        })
    
        /*
        Storing and publishing incoming message
        */
        socket.on('createMessage', (message, callback)=> {
            let user = users.getUser(socket.id);
            if(user && (typeof message.text === 'string' && message.text.trim().length > 0)){
                var reply = JSON.stringify([{
                    from: user.name,
                    text: message.text,
                    createdAt: moment().valueOf()
                }]);

                callback();
    
                chat.insertMany(JSON.parse(reply),function(err,res){
                     //redis publish
                    pub.publish('chat', reply);
                });
            }
           
        });
    
        
        /*
        Storing and publishing disconnect notification
        */
        socket.on('disconnect',()=> {
            let user = users.removeUser(socket.id);
            if(user){
                var disconnect_notification = JSON.stringify([{
                    from: 'Admin',
                    text: `${user.name} has left chat.`,
                    createdAt: moment().valueOf()
                }]);
    
                 chat.insertMany(JSON.parse(disconnect_notification),function(err,res){
                    //redis publish
                    pub.publish('chat', disconnect_notification);
                 });
                 
            }
        });
    
    
        //redis subscirbe
        sub.on('message', function(channel, message) {
            socket.emit(channel, message);
        });
        
    })
}