'use strict';

angular.module('leapmin').factory('leapTheremin', function (leapManager, thereminNode) {
  var leftHandId, rightHandId;

  var params = {};

  var getPitch = function (hand) {
    var vec = hand.palmPosition;
    var f = vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2];
    var d = Math.sqrt(vec[0] * vec[0] + vec[2] * vec[2]);

    params.distance = d;

    console.log(d);
    f = 50000.0 / (5.0 * Math.sqrt(f) + 80.0) + 100.0;
    f = f * (~~hand.pinchStrength + 1.0);
    return f;
  };

  leapManager.on('handFound', function (hand) {
    if(hand.type === 'right'){
      rightHandId = hand.id;
      thereminNode.start();
    }
  });
  leapManager.on('handLost', function (hand) {
    if(hand.type === 'right'){
      rightHandId = null;
      thereminNode.off();

    }
  });
  leapManager.on('frame', function (frame) {
    if(!rightHandId){
      return;
    }
    frame.hands.forEach(function (hand) {
      var freq;
      if(hand.id !== rightHandId) return;
      freq = getPitch(hand);
      //console.log(freq);
      thereminNode.pitch(freq);
    });
  });
  return {
    init: function () {},
    params: params
  };
});
