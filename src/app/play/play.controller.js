'use strict';

angular.module('leapmin').controller('PlayCtrl', function (leapManager, leapTheremin) {
  var play = this;

  leapManager.init();
  leapTheremin.init();
});
