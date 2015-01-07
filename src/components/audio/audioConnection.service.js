'use strict';

angular.module('leapmin').factory('audioConnection', function (audioContext, thereminNode) {
  var audio = audioContext();
  return {
    setup: function () {
      thereminNode.connect(audio.destination);
    }
  };
});
