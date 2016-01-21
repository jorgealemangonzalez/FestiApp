//Para las actualizaciones del servidor , habrá que hacer un metodo que compruebe si el socket ya esta en la sesion ) al reiniciar se borraran todos )
var express = require('express');
var app = express();
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
var server = require('http').createServer(app);

var port = 8080;
var io = require('socket.io')(server);

//Connexion to the database
var mongoose = require('mongoose');
mongoose.connect('mongodb://App:arnauFeo@127.0.0.1:27017/festiDB');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
db.on('error',console.error.bind(console, 'connection error:'));
db.once('open',function(){
    console.log("Connected to mongoDB");
});
//Schemas of the database
var msSchema = new Schema({
    userNick: String,
    text: String,
    time: Date
});
var noticeSchema = new Schema({
    creator_id:Schema.Types.ObjectId,
    location:{lat:Number , lng:Number },
    images: [String],
    title: String,
    description:String,
    type: String
});
var FestiSchema = new Schema({
    festi : String,
    fecha : String,
    year : Number,
    duracion : Number,
    web : String,
    lugar : String,
    asistentes : Number,
    link_icono : String,
    link_cartel : String,
    icono : String,
    cartel : String,
    horarios : String,
    estilos : [String],
    position : {
        lat : Number,
        lng : Number
    }
});
//var Festi = mongoose.model('Festi',FestiSchema);
var UserSchema = new Schema({
    //El id vendra dado por la base de datos
    //Podriamos a�adir publicaciones y mensajes
    _id: Schema.Types.ObjectId,
    nick: String,
    photo: String,
    phone: { type: Number, min: 599999999, max: 699999999 }
});
//Calls to database
//las funciones de call back deben ser function(error,records){...
var FestiDB = {
    getAllFestis : function(callback){ // El callback como parametro recive la lista de festivales
        
        mongoose.model('Festi',FestiSchema,'Festivales').find().exec(function(err,docs){
            console.log(err);
            callback(docs);
        });
    }
};
var chatDB = {
    getAll : function(festiyear,callback){ //festiyear: String festival y a�o
        mongoose.model('Chat',msSchema,'chat'+festiyear).find().exec(function(err,docs){
            callback(docs);
        });
    },
    send : function(data,festiyear,callback){
        var mss = mongoose.model('mss',msSchema,'chat'+festiyear);
        var ms = new mss(data);
        ms.save(function(err){
            if(err)console.log(err);
            else{
                callback();
            }
        });
    }
};
//probando chatDB
/*
chatDB.send({userNick: "jorge",text: "hola que tal",time: new Date(1,1,1)},"vinarock2015",
    function(){
        console.log("Enviado a la base de datos sin errores");
    }
);
*/
var marketDB = {
    getAll : function(festiyear,callback){
        mongoose.model('Annonce',noticeSchema,'market'+festiyear).find({}).select({'images': 0}).limit(100).exec(function(err,docs){
            if(err)console.log(err);
            else{
                callback(docs);
            }
        });
    },
    send : function(data,festiyear,callback){ //callback sin parametros
        var an =  mongoose.model('an',noticeSchema,'market'+festiyear);
        var annon = new an(data);
        annon.save(function(err){
            if(err)console.log(err);
            else {
                console.log("You have send things to the database");
                callback();
            }
        });
    },
    getImages : function(id,festiyear,callback){
        mongoose.model('Annonce',noticeSchema,'market'+festiyear).find({_id:id}).select({'images':1}).limit(100).exec(function(err,docs){
            if(err)console.log(err);
            else{
                callback(docs[0].images);
            }
        });
    }
};
var userDB = {
    new : function(callback){
        var uDB = mongoose.model('uDB',UserSchema,'Users');
        var user = {
            _id : new ObjectId ,
            nick: "",
            photo: "",
            phone: 599999999
        };
        var u = new uDB(user);
        u.save(function(err){
            if(err)console.log(err);
            else callback(user._id);
        });
    }
};
/*
FestiDB.getAllFestis(function(d){
    console.log(d);
});
*/
server.listen(port, function () {
  console.log('Now Server listening at port %d', port);
});

//comprobar si ha cogido el puerto de openshift
console.log("Usando puerto"+port);

var numUsers = 0;// number of users that has login in the chat

io.on('connection', function (socket) {
  var addedUser = false;
  //------------------ Chat ------------------
  socket.on('new message', function (message) {
    chatDB.send(message,socket.room,function(){
        console.log("New mensaje in the database");
        io.to(socket.room).emit('new message', message);
    });
  });
  socket.on('join chat',function(){
      console.log("Shocket enter to the chat");
      socket.emit('user joined',socket.username);
  });
  socket.on('get messages',function(){
      chatDB.getAll(socket.room,function(chats){
          console.log('User want all messages');
          socket.emit('get messages',chats);
      });
  });
  //------------------ Market ------------------
  socket.on('new annonce',function(annonce){
      console.log("annonce.id",annonce.creator_id);
    annonce.creator_id = socket.id;
    marketDB.send(annonce,socket.room,function(){
        console.log("New annonce in the database");
        io.to(socket.room).emit('new annonce', annonce);
      });
  });
  socket.on('get annonces',function(){
      marketDB.getAll(socket.room,function(annonces){
          socket.emit('get annonces',annonces);
      });
  });
  socket.on('get market images',function(id){//id del anuncio
      console.log("getting images of",id);
      marketDB.getImages(id,socket.room,function(images){
          socket.emit('get market images',images);
      });
  });
  //------------------ User ------------------
  
  socket.on('join room',function(room){
      socket.room = room;
      console.log("Socket joining the room: "+room);
      socket.join(room); 
  });
  socket.on('leave room',function(){
      socket.leave(socket.room);
      console.log("Socket leaving the room: "+socket.room);
      //socket.room = null;
  });
  socket.on('set username',function(username){
      socket.username = username;
  });
  
  //------------------ Server ------------------
  socket.on('add user', function () {
    //guardar id nada mas registrarse
    if (addedUser) return;
    userDB.new(function(id){
        socket.id = id ;
        numUsers++; 
        addedUser = true;
        socket.emit('add user',id);
        console.log("id socket ", socket.id);
        console.log("New user register in the app , the number of users now is : ",numUsers);
    });
  });
  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
      //supuestamente nunca llegara esto ya que en la app no hay disconnect
    if (addedUser) {
      --numUsers;
      console.log("User disconected from all rooms");
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

app.get('/', function (req, res) {
    console.log(req.path);
  res.send('Aplicacion servidor');
});