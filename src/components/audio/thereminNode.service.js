'use strict';

angular.module('leapmin').factory('thereminNode', function (audioContext) {
  var audio = audioContext();

  var buffer_size  = 16384 >> 4; //power 2
  var gain         = 0.06;
  var cutoff       = 1000; //hz

  var gainNode = audio.createGain();

  var scriptproc   = audio.createScriptProcessor(buffer_size);
  var filter       = audio.createBiquadFilter();

  var picth = function (){
    this._freq = 440.0;
    this.val = function(v){
      this._freq = v;
      this._listeners.change.forEach(function(cb){
        typeof cb === 'function' && cb(v);
      });
    };
    this._listeners = {
      change: []
    };
    this.addEventListener = function(name, listener) {
      if(this._listeners[name]){
        this._listeners[name].push(listener);
      }
    };
  };

  var voice = function(opt) {
    var p2 = Math.PI * 2.0;
    this.ph = 0;
    this.acc = 0;
    this.p = opt.picth;

    this.get = function() {
      this.ph += this.acc;
      if(this.ph > 1.0) this.ph = this.ph - 1.0;
      var g0 = Math.sin(this.ph * p2) + 0.78 * Math.sin(this.ph * p2 * 2);
      return g0 > 0.0 ? -1 : 1;
    };

    this.p.addEventListener('change', function(val){
      vo.acc = val / audio.sampleRate;
    });

  };

  var p = new picth();
  var vo = new voice({picth:p});

  var audiohandler = function (event) {
    var outL = event.outputBuffer.getChannelData(0);
    var outR = event.outputBuffer.getChannelData(1);
    for(var i = 0 ; i < outL.length; i++) {
      var out  = vo.get()
      outL[i]  = out;
      outR[i]  = outL[i];
    }
  };

  scriptproc.addEventListener('audioprocess', audiohandler)
  //scriptproc.connect(filter);

  filter.type = 0;
  filter.frequency.value = cutoff;
  filter.connect(gainNode);
  gainNode.gain.value = gain;

  p.val(440.0);
  return {
    pitch : function (freq){
      if(freq){
        return p.val(freq);
      }else{
        return p._freq;
      }
    },
    gain: function(gain){
      if(!gain){
        return gainNode.gain.value;
      }
      gainNode.gain.value = gain;
    },
    start: function () {
      //scriptproc.disconnect();
      scriptproc.connect(filter);
    },
    off: function () {
      scriptproc.disconnect();
    },
    connect: function (node) {
      return gainNode.connect(node);
    },
    disconnect: function() {
      return gainNode.disconnect();
    }
  };
});

