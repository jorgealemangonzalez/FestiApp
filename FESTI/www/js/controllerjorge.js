angular.module('starter.controllerjorge', ['ngMap'])
//HAY QUE CAMBIAR QUE NO CARGUE DESDE EL MAPA Y DESDE EL MARKET TODOS LOS PLACES DEL MARKET
.controller('cercaCtrl', function($scope,$localStorage,$ionicLoading,$cordovaGeolocation,$state,$window,$rootScope,$location) {
    $scope.festi = $localStorage.currentfesti;

    

    $scope.loading = $ionicLoading.show({
      content: 'Obteniendo datos',
      showBackdrop: false
    });
    var posOptions = {timeout: 5000, enableHighAccuracy: true};
    var mymarker ;
    function init(){


      $ionicLoading.hide();
      console.log($localStorage.id);
      //sitios array de objetos , en el interior el tipo de sitio y demas datos
      $scope.sitios = $rootScope.notices;
      $scope.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: $scope.festi.position,
        disableDefaultUI: false,//Si lo ponemos a true desactivamos la interfaz grafica del mapa para poder poner los trozos uno a uno
        streetViewControl: true // TRIUE : ponemos el personajito del street view
      });
      var infowindow = new google.maps.InfoWindow;

      var marker, i;

      //MY LOCATION
      $scope.setMarkers = function(){$cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          $scope.mypos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          mymarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.mypos.lat,$scope.mypos.lng),
            map: $scope.map,
            icon: "./img/point_me.png"
          });
        }, function(err) {
          console.log("GeolocationErr: "+err);
        });
        
        for (i = 0; i < $scope.sitios.length; i++) {
          marker = new google.maps.Marker({
               position: new google.maps.LatLng($scope.sitios[i].location.lat, $scope.sitios[i].location.lng),
               map: $scope.map,
               icon: "./img/point_"+$scope.sitios[i].type+".png"
          });

          google.maps.event.addListener(marker, 'mousedown', (function(marker, i) {
               return function() {
                   var content = '<h1 class="title">'+
                                  $scope.sitios[i].title+
                                  '</h1><h5>'+ $scope.sitios[i].description+'</h5>' ;
                   infowindow.setContent(content);
                   infowindow.open($scope.map, marker);
               };
          })(marker, i));
        }
      };
      $scope.setMarkers();
    }
    $scope.posMe = function (){
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          $scope.mypos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          mymarker.setPosition( new google.maps.LatLng( $scope.mypos.lat, $scope.mypos.lng ) );
          $scope.map.setZoom(18);
          $scope.map.setCenter( new google.maps.LatLng($scope.mypos.lat,$scope.mypos.lng));

        }, function(err) {
          console.log("GeolocationErr: "+err);
        });
    }


    init();
    //watch when the ocation path change
    $rootScope.$on( "$locationChangeStart", function(event, next, current) {
        if($rootScope.changemap == true)
        {
            $rootScope.changemap = false;
            $scope.map.setZoom(20);
            $scope.map.setCenter( new google.maps.LatLng($location.search().center.lat,$location.search().center.lng));
        }   
    });
    
})

.controller('mercadoCtrl', function($scope,$localStorage,$location,$ionicModal,$rootScope,$state,socket) {
    $scope.festi = $localStorage.currentfesti;
    $scope.notices = $rootScope.notices;
    console.log($scope.notices);
    $scope.changeOpen = function(index){
        $scope.notice = $scope.notices[index];
        if($scope.notice.images == null){
            console.log("n");
            
            console.log($scope.notice);
            socket.emit('get market images',$scope.notice._id);
            socket.on('get market images',function(images){
                $scope.notice.images = images; 
                $scope.notice.open = !$scope.notice.open; 
            });
        }else $scope.notice.open = !$scope.notice.open; 
        
    };
    
    //OPEN IMAGE
    $scope.showImages = function(index) { 
        $scope.notice = $scope.notices[index];
        $scope.allImages = $scope.notice.images;
        $scope.activeSlide = index;
        $scope.showModal('templates/image-popover.html');
    };

    $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: $scope,
            animation: 'slide-in-up',
            hardwareBackButtonClose: true
            }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    // Close the modal
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove()
    };
    //END OPEN IMAGE
    $scope.goMap = function(pos){
        $rootScope.changemap = true;
        $location.path("/tab_festi/cerca/").search({center:pos});
    };
    $scope.open_options = function(){
        $scope.showModal('templates/mercado_options.html');
        
    };
    $scope.filtrado = false;
    $localStorage.filtrado_notice = false;
    $scope.changefiltrado = function(){ $scope.filtrado = !$scope.filtrado ;};
    $scope.changefiltrado_notice = function(){ $localStorage.filtrado_notice = !$localStorage.filtrado_notice ;};
    
    $scope.anadir = function(){
        $state.go('tab_festi.mercado_anadir');
    };
    $scope.mynotice = function(){
        $state.go('tab_festi.mercado');
    };
    
})
.filter('ownnotice', function($localStorage){
  return function (arr) {
      return arr.filter(function(notice,index){
          console.log(notice.creator_id);
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
});
;