'use strict';

angular.module('leapmin').controller('PlayCtrl', function (leapManager, leapTheremin, audioConnection) {
  var play = this;

  leapManager.init();
  leapTheremin.init();

  audioConnection.setup();
});
