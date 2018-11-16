const port = 3000;
var express = require('express');
var app     = express();
var server = require('http').Server(app);
var io   = require('socket.io')(server);
io.listen(server)

// when User is created. a single instance of a database
// connection is created. we can update our database via our
// models we defined in the db folder.

var User = require('./db/models/User')
var Chat = require('./db/models/Chat')
var Comment = require('./db/models/Comment')
var ChatUserAuthentication = require('./db/models/ChatUserAuthentication')
var IdeaBox  = require('./db/models/IdeaBox')
var Plan     = require('./db/models/Plan')
var IdeaBox_Plan = require('./db/models/IdeaBox_Plan')
var Responsible = require('./db/models/Responsible')

var user_table               = new User()
var chat_table               = new Chat()
var comment_table            = new Comment()
var chat_user_authentication = new ChatUserAuthentication()
var idea_box                 = new IdeaBox()
var plan                     = new Plan()
var idea_box_plan            = new IdeaBox_Plan()
var responsible              = new Responsible()

user_table.create_table()
chat_table.create_table()
comment_table.create_table()
chat_user_authentication.create_table()
idea_box.create_table()
plan.create_table()
idea_box_plan.create_table()
responsible.create_table()

//while(1){}
// here we set up a server for the intention of facilitating
// real time chat communication

// We are trying to keep a list of clients so we can update
// users online on the client, using the socket id as a key

var clients = new Map()

//var chatRooms = chat_table.retrieveChatRooms()

io.on('connection', function(socket){

  console.log(`${socket.handshake.query.name}: has connected`)

  io.emit('user_connected', {user: socket.handshake.query.name})
  clients.set(socket.id, socket.handshake.query.name )

  socket.on('disconnect', ()=>{
    console.log(`${socket.handshake.query.name}: has disconnected`)
    io.emit('user_disconnected', {user: socket.handshake.query.name})
    clients.delete(socket.id)
  })

  socket.on('chat_message', (data)=>{
    console.log('chat message was received')
    console.log(data)
    socket.broadcast.emit('chat_message', data)
  })

  socket.on('recieved_update',(data)=>{
    console.log('clients know that other clients exist')
    var data_to_send = {}
    clients.forEach((key, value, map)=>{
      data_to_send[key] = value
    })

    console.log(data_to_send)
    io.emit('update_users',data_to_send)
  })
});

server.listen(port, ()=>{
  console.log(`listening on port ${port}`)
});

app.set('socketio', io);
var path    = require('path')

/* required for parsing the body of any requests made at some route */
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var multer  = require('multer')
var upload = multer();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(bodyParser.json());
app.use(cookieParser());

var passport = require('passport')
const session = require('express-session')
var LocalStrategy = require('passport-local').Strategy

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(async function(username, done) {

  try{
    var user = await user_table.get_user_by_username(username)
    if(!user){
      console.log('user not found')
      return done(new Error('user not found'))
    }
    done(null, username)
  }
  catch(e){
    done(e)
  }

});

passport.use(new LocalStrategy(
  async function(username, password, done) {
    var user = (await user_table.get_user_by_username( username )).rows[0]
    if(user){
      var exists = (await user_table.check_username_password(username,password)).rows[0]['exists']
      if(exists){
        return done(null,user)
      }
      else{
        return done(null,false)
      }
    }
    else if(!user){
      return done(null,false)
    }
  }
)
)

app.use(session({
  secret: '&9977&7^%4%&8*()[PP{{{{}}}]',
  resave: false,
  saveUninitialized: true,
  cookie: {
      secure: false,
      maxAge: 3600000
  }
}))

app.use(passport.initialize());
app.use(passport.session());

/*Allows express to return promises from middleware*/
var Router = require('express-promise-router')
var router = Router();
const fs = require('fs')

/*
   When a user requests a webpage, the folder distributed
   with the .html file will contain our react and css code
*/

app.use('/static', express.static(path.join(__dirname, '/dist')))
app.engine('html', require('ejs').renderFile);

/*
   these are the routes which need to be mounted for our Application to work
   the controller folder will take care of any server side computations,
   the model folder will contain any code interfacing with the database
   all operations will take place within react middleware
*/

var routes = {
  controllers : './controllers',
}

app.use(require(routes.controllers))

/* The app will listen to requests on port 3000 of the server */
