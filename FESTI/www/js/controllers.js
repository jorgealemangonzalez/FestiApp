// Enviar notificaciones a los usuarios https://www.youtube.com/watch?v=Z1owDaNQEtk
//sockets con : https://www.youtube.com/watch?v=qmvxytWVBJ4
//              https://www.airpair.com/ionic-framework/posts/ionic-socketio-chat-application-tutorial
//              https://github.com/socketio/socket.io/tree/master/examples/chat
//openshift:    https://www.youtube.com/watch?v=wnRtA7a0ST0

angular.module('starter.controllers', [])//DESCARGAR LOS FICHEROS QUE COGE DE INTERNET VER EN NETBEANS REMOTE FILES
.controller('tabsfestiCtrl', function($scope,$state,socket,$rootScope){
    $scope.exit = function(){
        console.log("Lets leave the festi");
        socket.emit('leave room');
        $state.go("tab_ini.mis-festis");
    } ;
    socket.on('new annonce',function(annonce){
        $rootScope.notices.unshift(annonce);
    });
})

.controller('mis-festisCtrl', function($scope,$localStorage,$state,Festivales,socket,$rootScope) { 
    
  //Entramos en la room en cuanto entramos en un festival
  $scope.clear = function(){
      $localStorage.f.pop();
      $localStorage.user = null;
      console.log($localStorage.f);
  }
  if($localStorage.f == null){
    $localStorage.user = {};
    console.log("Adding new user");
    socket.emit('add user');
    $localStorage.f = [];
    $scope.misfestis = [];
  }else{
      angular.forEach($localStorage.f,function(festi,i){ // HAY QUE HACER ESTA PARTE DE UNA MANERA QUE NO RECARGE TODO EL RATO LOS DATOS , SOLO I SON DISTINTOS A LOS QUE YA HAY
        Festivales.find(festi.festi).success(function(response){
          $localStorage.f[i] = response;
          $scope.misfestis[i] = $localStorage.f[i];
        });
      });


  }
  $scope.misfestis = $localStorage.f;
  $scope.enter_festi = function(festi){
        var i = $localStorage.f.indexOf(festi);
        var room = festi.festi + festi.year;
        console.log($localStorage.f[i]);
        $localStorage.currentfesti = $localStorage.f[i];
        $localStorage.id = i ;
        socket.emit('join room',room);
        socket.emit('get annonces');
        socket.on('get annonces',function(annonces){
            $rootScope.notices = annonces;
            console.log(annonces+"from enter_festi");
            $state.go("tab_festi.cerca");
        });
  };
  socket.on('add user',function(id){
    console.log(id);
    $localStorage.user.id = id;

  });
})

//UNA VEZ AÑADIDO EL FESTIVAL se guardan los datos en localStorage y habrá que ir recargandolos
//LOS PLUGINS SE AÑADEN CON CORDOVA --> "CORDOVA PLUGIN ADD .. "
.controller('mis-festis-anadirCtrl', function($scope,Festivales,Estilos_musicales,$state,$ionicLoading,$localStorage,$window) {
  $scope.festi = $localStorage.currentfesti;
  $scope.recien = true;
  /*
  $scope.loading = $ionicLoading.show({
    content: 'Obteniendo datos',
    showBackdrop: false
  });*/

  $scope.estilos = Estilos_musicales ;
  //hacer que se abra el menu de filtro avanzado
  $scope.filtrado = false;
  $scope.changefiltrado = function(){ $scope.filtrado = !$scope.filtrado ;};
  var esta = function(peq,gran){
    for(i in gran){
      if(peq._id.$oid == gran[i]._id.$oid)
      {
        return true;
      }
    }
    return false;
  }
  $scope.tengoestilo = function(festi){
    for(e in $scope.estilos){
      var es = $scope.estilos[e];
      if(es.on && festi.estilos.indexOf(es.nombre) > -1 && !esta(festi,$localStorage.f)){
          if($scope.recien == true)
          {
            $scope.recien = false;
            //$scope.loading.hide();
          }
          return true;
      }
    }
    if($scope.recien == true)
    {
      $scope.recien = false;
      //$scope.loading.hide();
    }

  };
  $scope.anadir = function(festi){
    
    $localStorage.f.unshift(festi);
    //$window.location.reload();
    $state.go('tab_ini.mis-festis');
  }

  $scope.festivales = Festivales.all();
})
.filter('tengoestilo', function($localStorage){
  return function (arr) {
      return arr.filter(function(notice,index){
          if( !$localStorage.filtrado_notice){
              return true;
          }else {
            if(notice.creator_id == $localStorage.user.id){
                return true;
            }else{
                return false;
            }
        }
          
      })
  };
})
.controller('configuracionCtrl', function($scope,$localStorage) {
    $scope.festi = $localStorage.currentfesti;
    if($localStorage.user != null){
      $scope.yo = $localStorage.user;
    }else{
      $scope.yo.nick = "No nick";
    }
})

.controller('chat_festi_loginCtrl', function($scope,$localStorage,$state,$sanitize,$window,procediments) {  
  $scope.festi = $localStorage.currentfesti;
  $scope.isLogged = function(){
    if(!angular.isUndefined($localStorage.user.nick)){
        $state.go('tab_festi.chat_festi');
    }
  }
  $scope.yo = {nick:""};

  $scope.joinchat = function(room){
      if($scope.yo.nick == ''){
         $window.alert("Introoduzca un nombre de usuario valido");
         return;
      }
      console.log("Se uira a room: "+room);
      console.log("Con nick: "+$sanitize($scope.yo.nick));
      
      $state.go('tab_festi.chat_festi');
      procediments.setUsername($scope.yo.nick);
  }
})
.controller('chat_festiCtrl', function($scope,$localStorage, $ionicScrollDelegate, socket,chatFestiDB,amMoment ) { // PARA HACER EN LOGIN PODRIAMOS USAR HIDE PARA QUE SALGA SOLO CUANDO NO TIENES NICK
    amMoment.changeLocale('es');
    $scope.festi = $localStorage.currentfesti;
    if(!angular.isUndefined($localStorage.user)){
      $scope.myNick = $localStorage.user.nick;
    }
    //$scope.hideTime = true;
    $scope.mensajes = [];
      $scope.scroll = function(){
            $ionicScrollDelegate.scrollBottom(true);
         }
    var selectdate = new Date(1,1,1);
    var getchat = function(){
      $scope.DBmss = chatFestiDB.all(selectdate,$localStorage.currentfesti.festi,$localStorage.currentfesti.year);
      $scope.DBmss.$promise.then(function (result) {
                                  angular.forEach(result, function(item) {
                                   if($scope.mensajes.length == 0 || selectdate < item.time){  //$scope.mensajes[$scope.mensajes.length-1].time < item.time //$scope.mensajes.length == 0
                                   $scope.mensajes.push(item);
                                   $scope.scroll();
                                   selectdate = item.time;
                                   }
                                    });
                                }, function (result) {
                                    console.log("Error: "+result);
                                });
    };
    getchat();

    $scope.ms = {
      userNick: $scope.myNick,
      text: "",
      time: new Date()
    }

    $scope.enviar = function(){
      if($scope.ms.text != "")
      {
        $scope.ms.time = new Date();
        chatFestiDB.enviar($scope.ms,$localStorage.currentfesti.festi,$localStorage.currentfesti.year).then(function(){
        socket.emit('new message',$scope.ms);
        $scope.ms.text = "";
        });
      }
    }

    //la primera vez que se carga el controlador añadimos a la persona a la room
    socket.emit('join chat');

    socket.on('new message',function(message){
        $scope.mensajes.push(message);
        $scope.scroll();
    });
    socket.on('user joined',function(username){
        console.log("Joined "+username);
    });
})

.controller('mercadoAnadirCtrl',function($scope,$localStorage,$state,$cordovaGeolocation,Camera,socket){ // he quitado $cordovaCamera ( parece qu eno se usa
    $scope.festi = $localStorage.currentfesti;
    $scope.id = $localStorage.user.id;
    $scope.notice_send = {
      creator_id: "" ,
      location:{ },
      images: [ ],
      title:"",
      description:"",
      type:""
    };
    $scope.uploadfromcamera = function(){
        Camera.uploadfromcamera($scope.notice_send.images);
    };
    $scope.uploadfromlibrary = function(){
      Camera.uploadfromlibrary($scope.notice_send.images);
    };
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            $scope.mypos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            mymarker = new google.maps.Marker({
              position: new google.maps.LatLng($scope.mypos.lat,$scope.mypos.lng),
              map: $scope.map,
              icon: "./img/point_me.png"
            });
          }, function(err) {
            console.log("GeolocationErr: "+err);
          });
    $scope.posMe = function (){
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            $scope.notice_send.location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
          }, function(err) {
            console.log("GeolocationErr: "+err);
          });
      };
    $scope.posMe();

    $scope.enviar = function(){
      socket.emit('new annonce',$scope.notice_send);
      $state.go("tab_festi.mercado");
    };
})
.controller('eventosCtrl', function($scope,$localStorage) {
  $scope.festi = $localStorage.currentfesti;

})

;
