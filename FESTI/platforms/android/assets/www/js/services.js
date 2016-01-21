/* global Camera */

angular.module('starter.services', ['ngResource'])
    
    .factory('Estilos_musicales',function(){

      var estilos = [
      { nombre : "rock" , on: true},
      { nombre : "indie" , on: true},
      { nombre : "metal" , on: true},
      { nombre : "ska" , on: true},
      { nombre : "punk" , on: true},
      { nombre : "electro" , on: true},
      { nombre : "dubstep" , on: true},
      { nombre : "dnb" , on: true},
      { nombre : "jazz" , on: true},
      { nombre : "blues" , on: true}
      ];
      return estilos;

    })
    .factory('WorkWithoutInternet',function($localStorage,socketFactory){ //Poner el nombre , punto todos los demas en las cabeceras de los controllers
        var messages = [
                        {   userNick:"jorge", text:"Memoria1" , time:new Date(1,1,1)},
                        {   userNick:"jorge", text:"Memoria2" , time:new Date(1,1,2)},
                        {   userNick:"pedro", text:"Memoria3" , time:new Date(1,1,3)},
                        {   userNick:"pedro", text:"Memoria4" , time:new Date(1,1,4)},
                        {   userNick:"jorge", text:"Memoria5" , time:new Date(1,1,5)},
                        {   userNick:"pedro", text:"Memoria6" , time:new Date(1,1,6)},
                        {   userNick:"jorge", text:"Memoria7" , time:new Date(1,1,7)}
                    ];
        var annonces = [
            
        ];
        var Festis = [
            {
                festi:"viñarock",
                link_icono:"./img/Bebida.jpg",
                lugar:"villarobledo",
                fecha:new Date(2,3,4),
                link_cartel:"./img/cartelsinConexion.jpg",
                estilos:[
                    "rock","metal","ska"
                ],
                year:"2015"

            },
            {
                festi:"dreambeach",
                link_icono:"./img/Bebida.jpg",
                lugar:"villariocos",
                fecha:new Date(2,3,5),
                link_cartel:"./img/cartelsinConexion.jpg",
                estilos:[
                    "electro"
                ],
                year:"2015"
            }
        ];
        
        var myIoSocket = io.connect('http://localhost:8100/');
        mySocket = socketFactory({
          ioSocket: myIoSocket
        });
        $localStorage.user = {
            nick:"",
            id: ""
        };
        return{
            Festivales:{
                all: function(){
                    
                    return Festis;
                },
                find: function(nombre){
                    angular.forEach(Festis,function(f){
                        if(f.festi == nombre)return f;
                    });
                }
            },
            chatFestiDB:{
                
                enviar: function(msg,festi,year){
                    messages.push(msg);
                    return 0;
                },
                all: function(selectdate,festi,year){  
                    return messages;
                }
            },
            market: {
                all: function(festi,year){
                    return annonces;
                },
                new_one: function(anuncio,festi,year){
                    annonces.push(anuncio);
                }
            },
            socket: mySocket
            ,
            procediments: {
                setUsername: function(name){
                    $localStorage.user.nick = $sanitize(name);
                    return;
                }
            }
        }
    })
    .factory('chatFestiDB',function($http,$resource){
      return{
        enviar: function(msg,festi,year){
          return $http.post('https://api.mongolab.com/api/1/databases/vacadb/collections/chat'+festi+year+'?apiKey=k_Np4N_hIzq6W9bPDFyRHpvcpyq275Td',msg);
        },
        all: function(selectdate,festi,year){
          return $resource('https://api.mongolab.com/api/1/databases' +
                           '/vacadb/collections/chat'+festi+year+'?l=100',
                           { apiKey: 'k_Np4N_hIzq6W9bPDFyRHpvcpyq275Td' }
                          ).query(
                            { q: { time: { $gt: selectdate } } }
                            );
        }
      }
    })
    .factory('Festivales', function($resource,$http) {
      return {
        all: function() {
          return $resource('https://api.mongolab.com/api/1/databases' +
                                             '/vacadb/collections/Festivales',
                                             { apiKey: 'k_Np4N_hIzq6W9bPDFyRHpvcpyq275Td' }, {
                                               update: { method: 'PUT' }
                                             }
                                         ).query();
        },
        find: function(festi){
          return $http.get('https://api.mongolab.com/api/1/databases/vacadb/collections/Festivales?q={"festi":"'+festi+'"}&fo=true&apiKey=k_Np4N_hIzq6W9bPDFyRHpvcpyq275Td');
        }
      };
    })
    .factory('Camera',function($cordovaCamera){
        return{
           uploadfromcamera: function(images){
                 var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 1024,
                targetHeight: 1024,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation:true
              };
              navigator.camera.getPicture(function(imageData) {
                //var image = document.getElementById('myImage');
                //image.src = "data:image/jpeg;base64," + imageData;
                if(imageData != "Unable to create bitmap!" && imageData != "Selection cancelled."){
                    images.push(imageData);
                }
              }, function(err) {
                  images.push(err);
              // error
              },options);
          },
          uploadfromlibrary: function(images){
                 var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 1024,
                targetHeight: 1024,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation:true
              };
              navigator.camera.getPicture(function(imageData) {
                //var image = document.getElementById('myImage');
                //image.src = "data:image/jpeg;base64," + imageData;
                if(imageData != "Unable to create bitmap!" && imageData != "Selection cancelled."){
                    images.push(imageData);
                }          }, function(err) {
                  images.push(err);
              // error
              },options);
          }
      }
    })
    .factory('socket',function(socketFactory){
        //Create socket and connect to my server // other http://festiserver-jalemangonzalez.rhcloud.com:8000

         var myIoSocket = io.connect('http://188.166.119.111:8080/');

          mySocket = socketFactory({
            ioSocket: myIoSocket
          });

        return mySocket;
    })
    .factory('procediments',function($localStorage,socket,$sanitize){
        return{
            setUsername: function(name){
                $localStorage.user = {
                    nick:""
                };
                $localStorage.user.nick = $sanitize(name);
                socket.emit('set username',$sanitize(name));
            }
        }
    })
;
