// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','starter.controllerjorge', 'starter.services','starter.directives',"ngStorage",'angularMoment','ngCordova','btford.socket-io','ngSanitize'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  try {
      angular.element(document).ready(function() {
        console.log('--------------started');
      });
    } catch(err) {
      alert("-------------Error : "+err.message);
    }
  $stateProvider
  // setup an abstract state for the tabs directive
    .state('tab_ini', {
      url: '/tab_ini',
      abstract: true,
      cache:false,
      templateUrl: 'templates/tabs_ini.html'
    })

  // Each tab has its own nav history stack:

    .state('tab_ini.mis-festis', {
      url: '/mis-festis',
      views: {
        'tab-mis-festis': {
          templateUrl: 'templates/tab-mis-festis.html',
          controller: 'mis-festisCtrl'
        }
      }
    })
    .state('tab_ini.mis-festis-anadir', {
          url: '/mis-festis/mis-festis-anadir',
          views: {
            'tab-mis-festis': {
              templateUrl: 'templates/tab-mis-festis-anadir.html',
              controller: 'mis-festis-anadirCtrl'
            }
          }
        })




    .state('tab_ini.configuracion', {
      url: '/configuracion',
      views: {
        'tab-configuracion': {
          templateUrl: 'templates/tab-configuracion.html',
          controller: 'configuracionCtrl'
        }
      }
    })

    .state('tab_festi', {
      url: '/tab_festi',
      cache: false,
      abstract: true,
      templateUrl: 'templates/tabs_festi.html'
    })

    .state('tab_festi.chat_festi_login', {
      url: '/chat_festi',
      views: {
        'tab-chat_festi': {
          templateUrl: 'templates/tab-chat_festi_login.html',
          controller: 'chat_festi_loginCtrl'
        }
      }
    })

    .state('tab_festi.chat_festi', {
      url: '/chat_festi/chat',
      views: {
        'tab-chat_festi': {
          templateUrl: 'templates/tab-chat_festi.html',
          controller: 'chat_festiCtrl'
        }
      }
    })


    .state('tab_festi.cerca', {
      url: '/cerca/:center',
      reloadOnSearch: false,    //CUIDADO CON ESTO , VA A EVITAR QUE SE RECARGUE EL CONTROLADOR
      views: {
        'tab-cerca': {
          templateUrl: 'templates/tab-cerca.html',
          controller: 'cercaCtrl'
        }
      }
    })

    .state('tab_festi.mercado', {
      url: '/mercado',
      views: {
        'tab-mercado': {
          templateUrl: 'templates/tab-mercado.html',
          controller: 'mercadoCtrl'
        }
      }
    })
    .state('tab_festi.mercado_anadir', {
          url: '/mercado/anadir',
          views: {
            'tab-mercado': {
              templateUrl: 'templates/tab-mercado-anadir.html',
              controller: 'mercadoAnadirCtrl'
            }
          }
        })
    .state('tab_festi.eventos', {
      url: '/eventos',
      views: {
        'tab-eventos': {
          templateUrl: 'templates/tab-eventos.html',
          controller: 'eventosCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab_ini/mis-festis');

})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
});

