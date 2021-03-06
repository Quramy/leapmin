'use strict';

angular.module('leapmin').factory('leapThree', function($window, leapManager, leapTheremin){

  var THREE = $window.THREE;
  var baseBoneRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  var scene;

  leapManager.on('handFound', function(hand){
    hand.fingers.forEach(function (finger) {

      var boneMeshes = [];
      var jointMeshes = [];

      finger.bones.forEach(function(bone) {

        //CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
        var boneMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(3, 3, bone.length),
          new THREE.MeshBasicMaterial({
            color: 0x0088ce,
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
            color: (finger.type === 1 && i === 4) ? 0xff0000 : 0x0088ce,
            wireframe: true
          })
        );
        //jointMesh.material.color.setHex(0x0088ce);
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
          bone = finger.bones[i - 1];
          mesh.position.fromArray(bone.nextJoint);
        }
      });
    });
  };

  var initScene = function(){
    scene = new THREE.Scene();
    //scene.add(new THREE.AxisHelper(400));
    scene.add(new THREE.GridHelper(400, 10));
    addLeapCube(scene);
    addPitchGuideCircle(scene);
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

  var addPitchGuideCircle = function(scene){
    //A2 -> A4
    [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22, 24, 26, 27].map(function(note){
      var fineFreq = 110.0, isKey;
      if(note % 12 === 3){
        isKey = true;
      }else{
        isKey = false;
      }
      return {freq: Math.pow(2, note / 12.0) * fineFreq, isKey: isKey};
    }).forEach(function(freqInfo){
      var geometry, material, mesh;
      geometry = new THREE.CircleGeometry(leapTheremin.pitchFunction.inv(freqInfo.freq), 8);
      material = new THREE.MeshBasicMaterial({
        color: freqInfo.isKey ? 0xffff00 : 0xff0000,
        wireframe: true
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(Math.PI * 0.5, 0, 0);
      mesh.position.fromArray([leapTheremin.params.antennaX, 150, leapTheremin.params.antennaZ]);
      scene.add(mesh);
    });
  };

  initScene();

  return {
    init: initScene,
    scene:scene
  };

});
