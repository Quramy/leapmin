'use strict';

angular.module('leapmin').factory('leapTheremin', function (leapManager, thereminNode) {
  var leftHandId, rightHandId;

  var params = {
    pitchMax: 2000.0,
    pitchScale: 19.0,
    antennaX: -130,
    antennaZ: 0
  };

  var getGain = function (hand) {
    var y = getVec(hand)[1] * 0.5;
    var gain = y * 0.0003;
    return gain > 1.0 ? 1.0 : gain;
  };


  var getPitch = function (hand) {
    var vec = getVec(hand);
    var dx = vec[0] - params.antennaX, dz = vec[2] - params.antennaZ;
    var d = Math.sqrt(dx * dx + dz * dz);

    params.distance = d;
    console.log(df(d), vec[0], vec[2], d);

    return df(d);
  };
  var preVec = Leap.vec3.create(), getVec = function(hand){
    /*
    // calc middle point between index finger and thumb 
    if(hand.fingers && hand.fingers[0] && hand.fingers[0].bones[3] && hand.fingers[1] && hand.fingers[1].bones[3]){
      Leap.vec3.add(preVec, hand.fingers[0].bones[3].nextJoint, hand.fingers[1].bones[3].nextJoint);
    }
    return [preVec[0] * 0.5, preVec[1] * 0.5, preVec[2] * 0.5];
    */
    return hand.fingers[1].bones[3].nextJoint;
  };
  
  var scaleP = params.pitchScale, max = params.pitchMax, df = function(d) {
    return scaleP * max / (scaleP + d);
  };
  // inverse function.
  df.inv = function (freq) {
    return scaleP * max / freq - scaleP;
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
      var freq, gain;
      if(hand.id !== rightHandId) return;
      freq = getPitch(hand);
      gain = getGain(hand);
      //console.log(gain);
      thereminNode.pitch(freq);
      thereminNode.gain(gain);
    });
  });

  return {
    init: function () {},
    params: params,
    pitchFunction: df
  };
});
