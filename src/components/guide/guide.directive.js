'use strict';


angular.module('leapmin').directive('guide', function ($window, leapManager){

  var THREE = $window.THREE;
  var baseBoneRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  var renderer, scene, camera;

  var leapController = leapManager.leapController;
  leapController.on('handFound', function(hand){
    hand.fingers.forEach(function (finger) {

      var boneMeshes = [];
      var jointMeshes = [];

      finger.bones.forEach(function(bone) {

        //CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
        var boneMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(3, 3, bone.length),
          new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
          })
        );

        //boneMesh.material.color.setHex(0xffffff);
        scene.add(boneMesh);
        boneMeshes.push(boneMesh);
      });

      for (var i = 0; i < finger.bones.length + 1; i++) {

        var jointMesh = new THREE.Mesh(
          new THREE.SphereGeometry(7, 6, 4),
          //new THREE.MeshPhongMaterial(),
          new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
          })
        );
        jointMesh.material.color.setHex(0x0088ce);
        scene.add(jointMesh);
        jointMeshes.push(jointMesh);
      }
      finger.data('boneMeshes', boneMeshes);
      finger.data('jointMeshes', jointMeshes);
    });
  }).on('handLost', function(hand){

    hand.fingers.forEach(function (finger) {

      var boneMeshes = finger.data('boneMeshes');
      var jointMeshes = finger.data('jointMeshes');

      boneMeshes.forEach(function(mesh){
        scene.remove(mesh);
      });

      jointMeshes.forEach(function(mesh){
        scene.remove(mesh);
      });

      finger.data({
        boneMeshes: null
      });
    });

  }).on('frame', function(frame){
    frame.hands.forEach(function(hand){
      updateHand(hand);
    });
  });

  var updateHand = function(hand){
    hand.fingers.forEach(function (finger) {
      finger.data('boneMeshes').forEach(function(mesh, i){
        var bone = finger.bones[i];
        mesh.position.fromArray(bone.center());
        mesh.setRotationFromMatrix(new THREE.Matrix4().fromArray( bone.matrix() ));
        mesh.quaternion.multiply(baseBoneRotation);
      });

      finger.data('jointMeshes').forEach(function(mesh, i){
        var bone = finger.bones[i];

        if (bone) {
          mesh.position.fromArray(bone.prevJoint);
        }else{
          bone = finger.bones[i-1];
          mesh.position.fromArray(bone.nextJoint);
        }
      });
    });
  };

  /**
   *
   * Initialize THREE.js's scene.
   *
   **/
  var initScene = function(renderArea){

    var width = renderArea.parent().innerWidth();
    var height = window.innerHeight - renderArea.offset().top - 20;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderArea[0].appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.y = 160;
    camera.position.z = 800;

    new THREE.OrbitControls(camera, renderer.domElement);

    scene = new THREE.Scene();

    scene.add(new THREE.AxisHelper(400));
    scene.add(new THREE.GridHelper(400, 10));

    return scene;

  };

  /**
   *
   * Make a box object object which stands for the Leap device.
   *
   **/
  var addLeapCube = function(scene){
    var geometry, material, mesh;

    geometry = new THREE.CubeGeometry(80, 11.5, 30);
    material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  };

  var animate = function(){
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);
    leapController.frame(0).hands.forEach(updateHand);
  };

  return {
    restrict: 'AC',
    scope: true,
    template: '<div></div>',
    link: function ($scope, $elem, $attrs){
      initScene($elem);
      addLeapCube(scene);
      renderer.render(scene, camera);
      animate();
      $scope.$destroy(function (){
      });
    }
  };

});

