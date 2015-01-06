'use strict';

angular.module('leapmin').factory('audioContext', function ($window) {
  var ctx = new $window.AudioContext();
  var getter = function () {
    return ctx;
  };

  getter.init = function () {
    ctx = new AudioContext();
  };

  return getter;
});
