'use strict';

angular.module('leapmin').factory('leapManager', function ($window) {
  var leapController = new $window.Leap.Controller();
  leapController.use('handEntry');


  leapController.on('handFound', function (hand){
    console.log('found', hand.id, hand);
  });

  leapController.on('handLost', function(hand){
    console.log('lost', hand.id);
  });

  return {
    init: function () {
      leapController.connect();
    },
    on: function (eventName, listener) {
      return leapController.on(eventName, listener);
    },
    leapController: leapController
  };

});
