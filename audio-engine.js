/*
 * Dirlizanu — comfort audio layer
 *
 * Design reference: Kenney UI Audio (CC0), available on GitHub through
 * Calinou/kenney-ui-audio. The shipped earcons remain synthesized locally so
 * the PWA stays offline-first, tiny and deterministic.
 *
 * This wrapper keeps the public Web Audio surface used by game.js, while:
 * - softening every oscillator to a sine-like timbre;
 * - filtering excessive high-frequency energy;
 * - lowering global level;
 * - stealing the previous voice whenever a new cue actually begins;
 * - fading the stolen voice for 7 ms to prevent clicks.
 */
(function () {
  'use strict';

  var NativeContext = window.AudioContext || window.webkitAudioContext;
  if (!NativeContext || window.__DIRLIZANU_AUDIO_INSTALLED__) return;

  window.__DIRLIZANU_AUDIO_INSTALLED__ = true;

  var activeVoice = null;
  var activationTimers = [];

  function clearTimer(timer) {
    var index = activationTimers.indexOf(timer);
    if (index >= 0) activationTimers.splice(index, 1);
  }

  function softenedFrequency(value) {
    if (!isFinite(value)) return value;
    if (value > 900) return value * .86;
    if (value > 650) return value * .92;
    return value;
  }

  function frequencyFacade(parameter) {
    return {
      get value() { return parameter.value; },
      set value(value) { parameter.value = softenedFrequency(value); },
      setValueAtTime: function (value, time) {
        return parameter.setValueAtTime(softenedFrequency(value), time);
      },
      linearRampToValueAtTime: function (value, time) {
        return parameter.linearRampToValueAtTime(softenedFrequency(value), time);
      },
      exponentialRampToValueAtTime: function (value, time) {
        return parameter.exponentialRampToValueAtTime(Math.max(1, softenedFrequency(value)), time);
      },
      setTargetAtTime: function (value, time, constant) {
        return parameter.setTargetAtTime(softenedFrequency(value), time, constant);
      },
      cancelScheduledValues: function (time) {
        return parameter.cancelScheduledValues(time);
      }
    };
  }

  function silenceVoice(voice, now) {
    if (!voice || voice.ended) return;
    voice.ended = true;
    try {
      var parameter = voice.gain && voice.gain.gain;
      if (parameter) {
        if (typeof parameter.cancelAndHoldAtTime === 'function') {
          parameter.cancelAndHoldAtTime(now);
        } else {
          var held = Math.max(.0001, parameter.value || .0001);
          parameter.cancelScheduledValues(now);
          parameter.setValueAtTime(held, now);
        }
        parameter.exponentialRampToValueAtTime(.0001, now + .007);
      }
      voice.oscillator.stop(now + .011);
    } catch (error) {}
  }

  function activateVoice(voice, context) {
    var now = context.currentTime;
    if (activeVoice && activeVoice !== voice) silenceVoice(activeVoice, now);
    activeVoice = voice;
  }

  function ComfortAudioContext() {
    var context = new NativeContext();
    var input = context.createBiquadFilter();
    var compressor = context.createDynamicsCompressor();
    var master = context.createGain();

    input.type = 'lowpass';
    input.frequency.setValueAtTime(4300, context.currentTime);
    input.Q.setValueAtTime(.55, context.currentTime);

    compressor.threshold.setValueAtTime(-24, context.currentTime);
    compressor.knee.setValueAtTime(18, context.currentTime);
    compressor.ratio.setValueAtTime(3, context.currentTime);
    compressor.attack.setValueAtTime(.004, context.currentTime);
    compressor.release.setValueAtTime(.09, context.currentTime);

    master.gain.setValueAtTime(.72, context.currentTime);
    input.connect(compressor);
    compressor.connect(master);
    master.connect(context.destination);

    this._context = context;
    this.destination = input;
  }

  Object.defineProperties(ComfortAudioContext.prototype, {
    currentTime: {
      get: function () { return this._context.currentTime; }
    },
    state: {
      get: function () { return this._context.state; }
    },
    sampleRate: {
      get: function () { return this._context.sampleRate; }
    }
  });

  ComfortAudioContext.prototype.resume = function () {
    return this._context.resume();
  };

  ComfortAudioContext.prototype.close = function () {
    activationTimers.forEach(function (timer) { clearTimeout(timer); });
    activationTimers.length = 0;
    if (activeVoice) silenceVoice(activeVoice, this._context.currentTime);
    activeVoice = null;
    return this._context.close();
  };

  ComfortAudioContext.prototype.createGain = function () {
    var node = this._context.createGain();
    return {
      _node: node,
      gain: node.gain,
      connect: function (destination) {
        node.connect(destination && destination._node ? destination._node : destination);
        return destination;
      },
      disconnect: function () { node.disconnect(); }
    };
  };

  ComfortAudioContext.prototype.createOscillator = function () {
    var owner = this;
    var oscillator = this._context.createOscillator();
    var frequency = frequencyFacade(oscillator.frequency);
    var connectedGain = null;
    var voice = { oscillator: oscillator, gain: null, ended: false };
    var facade = {
      frequency: frequency,
      connect: function (destination) {
        connectedGain = destination && destination._node ? destination._node : destination;
        voice.gain = connectedGain;
        oscillator.connect(connectedGain);
        return destination;
      },
      disconnect: function () { oscillator.disconnect(); },
      start: function (when) {
        var startAt = typeof when === 'number' ? when : owner._context.currentTime;
        oscillator.start(startAt);
        var wait = Math.max(0, (startAt - owner._context.currentTime) * 1000);
        if (wait < 5) {
          activateVoice(voice, owner._context);
        } else {
          var timer = setTimeout(function () {
            clearTimer(timer);
            activateVoice(voice, owner._context);
          }, wait);
          activationTimers.push(timer);
        }
      },
      stop: function (when) {
        try { oscillator.stop(when); } catch (error) {}
      }
    };

    Object.defineProperty(facade, 'type', {
      get: function () { return oscillator.type; },
      set: function () {
        /* A sine onset is less abrasive than the original triangle transient. */
        oscillator.type = 'sine';
      }
    });

    oscillator.onended = function () {
      voice.ended = true;
      if (activeVoice === voice) activeVoice = null;
    };

    return facade;
  };

  window.AudioContext = ComfortAudioContext;
  window.webkitAudioContext = ComfortAudioContext;
}());
