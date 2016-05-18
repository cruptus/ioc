angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope,  $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  //$ionicModal.fromTemplateUrl('templates/login.html', {
  //  scope: $scope
  //}).then(function(modal) {
  //  $scope.modal = modal;
  //});

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('MesParcoursCtrl', function($scope) {
  $scope.parcours = [
    { title: 'Nice Antibes', id: 1, desc: '12km bla bla', iti: 'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d23103.36965102806!2d7.021271211090599!3d43.628998877129106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e2!4m5!1s0x12cc2958679849bd%3A0x4ad705bc325c2295!2sValbonne!3m2!1d43.64152!2d7.009186!4m5!1s0x12cc2b2e80bac34d%3A0x4c146f1105756459!2sInstitut+Universitaire+de+Technologie%2C+650+Route+des+Colles%2C+06560+Valbonne!3m2!1d43.616757!2d7.0711059!5e0!3m2!1sfr!2sfr!4v1462781932809' },
    { title: 'Antibes Nice', id: 2, desc: '11km bla bla', iti: 'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d23103.36965102806!2d7.021271211090599!3d43.628998877129106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e2!4m5!1s0x12cc2958679849bd%3A0x4ad705bc325c2295!2sValbonne!3m2!1d43.64152!2d7.009186!4m5!1s0x12cc2b2e80bac34d%3A0x4c146f1105756459!2sInstitut+Universitaire+de+Technologie%2C+650+Route+des+Colles%2C+06560+Valbonne!3m2!1d43.616757!2d7.0711059!5e0!3m2!1sfr!2sfr!4v1462781932809' },
    { title: 'Cannes Marseille', id: 3, desc: '10km bla bla', iti: 'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d23103.36965102806!2d7.021271211090599!3d43.628998877129106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e2!4m5!1s0x12cc2958679849bd%3A0x4ad705bc325c2295!2sValbonne!3m2!1d43.64152!2d7.009186!4m5!1s0x12cc2b2e80bac34d%3A0x4c146f1105756459!2sInstitut+Universitaire+de+Technologie%2C+650+Route+des+Colles%2C+06560+Valbonne!3m2!1d43.616757!2d7.0711059!5e0!3m2!1sfr!2sfr!4v1462781932809' }
  ];
})

.controller('TestCtrl', function($scope) {

})

.controller('ParcoursCtrl', function($scope, $rootScope, $state) {
  function initialize() {
    var myLatlng = new google.maps.LatLng(43.07493,-89.381388);

    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);

    //Marker + infowindow + angularjs compiled ng-click
    var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
    var compiled = $compile(contentString)($scope);

    var infowindow = new google.maps.InfoWindow({
      content: compiled[0]
    });

    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Uluru (Ayers Rock)'
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });

    $scope.map = map;
  }
  google.maps.event.addDomListener(window, 'load', initialize);

  $scope.centerOnMe = function() {
    if(!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function(error) {
      alert('Unable to get location: ' + error.message);
    });
  };

  $scope.clickTest = function() {
    alert('Example of infowindow with ng-click')
  };
})

.controller('InitializeNewParcoursCtrl', function($scope, $rootScope, $state) {

  $rootScope.map = {};

  $scope.doParcours = function (parcData) {

      $rootScope.map = parcData;
      $state.go("app.parcours", $rootScope.map);
  };
});
