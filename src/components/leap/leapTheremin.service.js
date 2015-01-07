'use strict';

angular.module('leapmin').factory('leapTheremin', function (leapManager, thereminNode) {
  var leftHandId, rightHandId;

  var params = {};

  var getPitch = function (hand) {
    var vec = getVec(hand);
    var d = Math.sqrt(vec[0] * vec[0] + vec[2] * vec[2]) * 0.5;

    params.distance = d;
    console.log(df(d), vec[0] * 0.5, vec[2] * 0.5, d);

    return df(d);
  };

  var preVec = Leap.vec3.create(), getVec = function(hand){
    if(hand.fingers && hand.fingers[0] && hand.fingers[0].bones[3] && hand.fingers[1] && hand.fingers[1].bones[3]){
      Leap.vec3.add(preVec, hand.fingers[0].bones[3].nextJoint, hand.fingers[1].bones[3].nextJoint);
    }
    return preVec;
  };
  
  var df = function(d) {
    var a = 40.0;
    return a * 1200.0 / (a + d);
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
      thereminNode.pitch(freq);
    });
  });
  return {
    init: function () {},
    params: params
  };
});
