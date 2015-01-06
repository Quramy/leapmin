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
      var g0 = Math.sin(this.ph * p2) + 0.78 * Math.sin(this.ph * p2 * 2);
      return g0 > 0.0 ? -1 : 1;
    };

    this.p.addEventListener('change', function(val){
      vo.acc = val / audio.sampleRate;
    });

  };

  var p = new picth();
  var vo = new voice({picth:p});

  //var count = 0;
  var audiohandler = function (event) {
    var outL = event.outputBuffer.getChannelData(0);
    var outR = event.outputBuffer.getChannelData(1);
    for(var i = 0 ; i < outL.length; i++) {
      var out  = vo.get()
      outL[i]  = out;
      outR[i]  = outL[i];
    }
    //  count = count + outL.length;
  };

  /*
  $(function(){
    var connect_state = true;
    $('#toggle').on('click', function(){
      if(connect_state){
        scriptproc.disconnect();
        $(this).text('play');
        connect_state = false;
      }else{
        scriptproc.connect(filter);
        $(this).text('pause');
        connect_state = true;
      }
    });

    $('#freq').on('input', function(){
      var freq = parseFloat($(this).val());
      p.val(freq);
    });

    $('.key-notes>button').on('click', function(){
      var f = $(this).attr('data-freq')
      p.val(f);
    });

    p.addEventListener('change', function(val){
      $('#freq').val(val);
    });

    p.val(440.0);
  });
  */

  scriptproc.addEventListener('audioprocess', audiohandler)
  //scriptproc.connect(filter);

  filter.type = 0;
  filter.frequency.value = cutoff;
  filter.connect(gainNode);
  gainNode.connect(audio.destination);
  gainNode.gain.value = gain;

  console.log(audio.sampleRate);


  p.val(440.0);
  console.log('aaaa', audio);
  return {
    setPitch: function (freq){
      return p.val(freq);
    },
    setGain: function(gain){
      //gainNode.gain.value = gain;
    },
    start: function () {
      //scriptproc.disconnect();
      scriptproc.connect(filter);
    },
    off: function () {
      scriptproc.disconnect();
    }
  };
});

//webaudio.

