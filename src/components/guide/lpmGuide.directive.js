'use strict';

angular.module('leapmin').directive('lpmGuide', function ($window, leapThree){

  var THREE = $window.THREE;
  var scene = leapThree.scene;;

  var renderer, camera;

  var initRenderer = function(renderArea){

    var width = renderArea.parent().innerWidth();
    var height = window.innerHeight - renderArea.offset().top - 20;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderArea[0].appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.y = 160;
    camera.position.z = 800;
    new THREE.OrbitControls(camera, renderer.domElement);
  };

  var animate = function(){
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  return {
    restrict: 'AC',
    scope: true,
    template: '<div></div>',
    link: function ($scope, $elem, $attrs){
      initRenderer($elem);
      renderer.render(scene, camera);
      animate();
      $scope.$destroy(function (){
      });
    }
  };

});

