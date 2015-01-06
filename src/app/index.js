'use strict';

angular.module('leapmin', ['ui.router', 'ui.bootstrap'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('play', {
        url: '/play/guide',
        templateUrl: 'app/play/play.html',
        controller: 'PlayCtrl as play'
      })
      .state('play.setteings', {
      });

    $urlRouterProvider.otherwise('/play/guide');
  })
;
