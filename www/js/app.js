// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    console.log("ok");
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    console.log("ok");

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    console.log("ok");

    ble.isEnabled(
        function() {
          console.log("Bluetooth is enabled");
          alert("Bluetooth is enabled");
        },
        function() {
          console.log("Bluetooth is *not* enabled");
          alert("Bluetooth is *not* enabled");
        }
    );
    console.log("ok");

  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.nouv-parcours', {
    url: '/nouv-parcours',
    views: {
      'menuContent': {
        templateUrl: 'templates/nouv-parcours.html',
          controller: 'InitializeNewParcoursCtrl'
      }
    }
  })

  .state('app.parcours', {
      url: '/parcours',
      views: {
          'menuContent': {
              templateUrl: 'templates/parcours.html',
              controller: 'ParcoursCtrl'
          }
      }
  })

  .state('app.mes-parcours', {
      url: '/mes-parcours',
      views: {
        'menuContent': {
          templateUrl: 'templates/mes-parcours.html',
          controller: 'MesParcoursCtrl'
        }
      }
    })

    .state('app.tableau', {
        url: '/tableau',
        views: {
          'menuContent': {
            templateUrl: 'templates/tableau.html'
          }
        }
    })

    .state('app.accueil', {
      url: '/accueil',
      views: {
        'menuContent': {
          templateUrl: 'templates/accueil.html'
        }
      }
    })

      .state('app.test', {
        url: '/test',
        views: {
          'menuContent': {
            templateUrl: 'templates/test.html',
            controller: 'TestCtrl'
          }
        }
      })
    //.state('app.start', {
    //  url: '/start',
    //  views:  'templates/start.html'
    //});

  //.state('app.single', {
  //  url: '/playlists/:playlistId',
  //  views: {
  //    'menuContent': {
  //      templateUrl: 'templates/playlist.html',
  //      controller: 'PlaylistCtrl'
  //    }
  //  }
  //});
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/accueil');
});
