var IMGplayer = {
    version: '1.2',
};
/*!
 *  howler.js v2.0.3
 *  howlerjs.com
 *
 *  (c) 2013-2017, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

/** Global Methods **/
/***************************************************************************/

/**
 * Create the global controller. All contained methods and properties apply
 * to all sounds that are currently playing or will be in the future.
 */
var HowlerGlobal = function() {
    this.init();
};
HowlerGlobal.prototype = {
    /**
     * Initialize the global Howler object.
     * @return {Howler}
     */
    init: function() {
        var self = this || Howler;

        // Create a global ID counter.
        self._counter = 0;

        // Internal properties.
        self._codecs = {};
        self._howls = [];
        self._muted = false;
        self._volume = 1;
        self._canPlayEvent = 'canplaythrough';
        self._navigator = (typeof window !== 'undefined' && window.navigator) ? window.navigator : null;

        // Public properties.
        self.masterGain = null;
        self.noAudio = false;
        self.usingWebAudio = true;
        self.autoSuspend = true;
        self.ctx = null;

        // Set to false to disable the auto iOS enabler.
        self.mobileAutoEnable = true;

        // Setup the various state values for global tracking.
        self._setup();

        return self;
    },

    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
        var self = this || Howler;
        vol = parseFloat(vol);

        // If we don't have an AudioContext created yet, run the setup.
        if (!self.ctx) {
            setupAudioContext();
        }

        if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
            self._volume = vol;

            // Don't update any of the nodes if we are muted.
            if (self._muted) {
                return self;
            }

            // When using Web Audio, we just need to adjust the master gain.
            if (self.usingWebAudio) {
                self.masterGain.gain.value = vol;
            }

            // Loop through and change volume for all HTML5 audio nodes.
            for (var i = 0; i < self._howls.length; i++) {
                if (!self._howls[i]._webAudio) {
                    // Get all of the sounds in this Howl group.
                    var ids = self._howls[i]._getSoundIds();

                    // Loop through all sounds and change the volumes.
                    for (var j = 0; j < ids.length; j++) {
                        var sound = self._howls[i]._soundById(ids[j]);

                        if (sound && sound._node) {
                            sound._node.volume = sound._volume * vol;
                        }
                    }
                }
            }

            return self;
        }

        return self._volume;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    mute: function(muted) {
        var self = this || Howler;

        // If we don't have an AudioContext created yet, run the setup.
        if (!self.ctx) {
            setupAudioContext();
        }

        self._muted = muted;

        // With Web Audio, we just need to mute the master gain.
        if (self.usingWebAudio) {
            self.masterGain.gain.value = muted ? 0 : self._volume;
        }

        // Loop through and mute all HTML5 Audio nodes.
        for (var i = 0; i < self._howls.length; i++) {
            if (!self._howls[i]._webAudio) {
                // Get all of the sounds in this Howl group.
                var ids = self._howls[i]._getSoundIds();

                // Loop through all sounds and mark the audio node as muted.
                for (var j = 0; j < ids.length; j++) {
                    var sound = self._howls[i]._soundById(ids[j]);

                    if (sound && sound._node) {
                        sound._node.muted = (muted) ? true : sound._muted;
                    }
                }
            }
        }

        return self;
    },

    /**
     * Unload and destroy all currently loaded Howl objects.
     * @return {Howler}
     */
    unload: function() {
        var self = this || Howler;

        for (var i = self._howls.length - 1; i >= 0; i--) {
            self._howls[i].unload();
        }

        // Create a new AudioContext to make sure it is fully reset.
        if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== 'undefined') {
            self.ctx.close();
            self.ctx = null;
            setupAudioContext();
        }

        return self;
    },

    /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
        return (this || Howler)._codecs[ext.replace(/^x-/, '')];
    },

    /**
     * Setup various state values for global tracking.
     * @return {Howler}
     */
    _setup: function() {
        var self = this || Howler;

        // Keeps track of the suspend/resume state of the AudioContext.
        self.state = self.ctx ? self.ctx.state || 'running' : 'running';

        // Automatically begin the 30-second suspend process
        self._autoSuspend();

        // Check if audio is available.
        if (!self.usingWebAudio) {
            // No audio is available on this system if noAudio is set to true.
            if (typeof Audio !== 'undefined') {
                try {
                    var test = new Audio();

                    // Check if the canplaythrough event is available.
                    if (typeof test.oncanplaythrough === 'undefined') {
                        self._canPlayEvent = 'canplay';
                    }
                } catch ( e ) {
                    self.noAudio = true;
                }
            } else {
                self.noAudio = true;
            }
        }

        // Test to make sure audio isn't disabled in Internet Explorer.
        try {
            var test = new Audio();
            if (test.muted) {
                self.noAudio = true;
            }
        } catch ( e ) {}

        // Check for supported codecs.
        if (!self.noAudio) {
            self._setupCodecs();
        }

        return self;
    },

    /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */
    _setupCodecs: function() {
        var self = this || Howler;
        var audioTest = null;

        // Must wrap in a try/catch because IE11 in server mode throws an error.
        try {
            audioTest = (typeof Audio !== 'undefined') ? new Audio() : null;
        } catch ( err ) {
            return self;
        }

        if (!audioTest || typeof audioTest.canPlayType !== 'function') {
            return self;
        }

        var mpegTest = audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');

        // Opera version <33 has mixed MP3 support, so we need to check for and block it.
        var checkOpera = self._navigator && self._navigator.userAgent.match(/OPR\/([0-6].)/g);
        var isOldOpera = (checkOpera && parseInt(checkOpera[0].split('/')[1], 10) < 33);

        self._codecs = {
            mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''))),
            mpeg: !!mpegTest,
            opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
            ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
            oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
            wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
            aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
            caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
            m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
            mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
            weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
            webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
            dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
            flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
        };

        return self;
    },

    /**
     * Mobile browsers will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _enableMobileAudio: function() {
        var self = this || Howler;

        // Only run this on mobile devices if audio isn't already eanbled.
        var isMobile = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i.test(self._navigator && self._navigator.userAgent);
        var isTouch = !!(('ontouchend' in window) || (self._navigator && self._navigator.maxTouchPoints > 0) || (self._navigator && self._navigator.msMaxTouchPoints > 0));
        if (self._mobileEnabled || !self.ctx || (!isMobile && !isTouch)) {
            return;
        }

        self._mobileEnabled = false;

        // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
        // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
        // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.
        if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
            self._mobileUnloaded = true;
            self.unload();
        }

        // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
        // http://stackoverflow.com/questions/24119684
        self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);

        // Call this method on touch start to create and play a buffer,
        // then check if the audio actually played to determine if
        // audio has now been unlocked on iOS, Android, etc.
        var unlock = function() {
            // Create an empty buffer.
            var source = self.ctx.createBufferSource();
            source.buffer = self._scratchBuffer;
            source.connect(self.ctx.destination);

            // Play the empty buffer.
            if (typeof source.start === 'undefined') {
                source.noteOn(0);
            } else {
                source.start(0);
            }

            // Setup a timeout to check that we are unlocked on the next event loop.
            source.onended = function() {
                source.disconnect(0);

                // Update the unlocked state and prevent this check from happening again.
                self._mobileEnabled = true;
                self.mobileAutoEnable = false;

                // Remove the touch start listener.
                document.removeEventListener('touchend', unlock, true);
            };
        };

        // Setup a touch start listener to attempt an unlock in.
        document.addEventListener('touchend', unlock, true);

        return self;
    },

    /**
     * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
     * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
     * @return {Howler}
     */
    _autoSuspend: function() {
        var self = this;

        if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === 'undefined' || !Howler.usingWebAudio) {
            return;
        }

        // Check if any sounds are playing.
        for (var i = 0; i < self._howls.length; i++) {
            if (self._howls[i]._webAudio) {
                for (var j = 0; j < self._howls[i]._sounds.length; j++) {
                    if (!self._howls[i]._sounds[j]._paused) {
                        return self;
                    }
                }
            }
        }

        if (self._suspendTimer) {
            clearTimeout(self._suspendTimer);
        }

        // If no sound has played after 30 seconds, suspend the context.
        self._suspendTimer = setTimeout(function() {
            if (!self.autoSuspend) {
                return;
            }

            self._suspendTimer = null;
            self.state = 'suspending';
            self.ctx.suspend().then(function() {
                self.state = 'suspended';

                if (self._resumeAfterSuspend) {
                    delete self._resumeAfterSuspend;
                    self._autoResume();
                }
            });
        }, 30000);

        return self;
    },

    /**
     * Automatically resume the Web Audio AudioContext when a new sound is played.
     * @return {Howler}
     */
    _autoResume: function() {
        var self = this;

        if (!self.ctx || typeof self.ctx.resume === 'undefined' || !Howler.usingWebAudio) {
            return;
        }

        if (self.state === 'running' && self._suspendTimer) {
            clearTimeout(self._suspendTimer);
            self._suspendTimer = null;
        } else if (self.state === 'suspended') {
            self.state = 'resuming';
            self.ctx.resume().then(function() {
                self.state = 'running';

                // Emit to all Howls that the audio has resumed.
                for (var i = 0; i < self._howls.length; i++) {
                    self._howls[i]._emit('resume');
                }
            });

            if (self._suspendTimer) {
                clearTimeout(self._suspendTimer);
                self._suspendTimer = null;
            }
        } else if (self.state === 'suspending') {
            self._resumeAfterSuspend = true;
        }

        return self;
    }
};

// Setup the global audio controller.
var Howler = new HowlerGlobal();

/** Group Methods **/
/***************************************************************************/

/**
 * Create an audio group controller.
 * @param {Object} o Passed in properties for this group.
 */
var Howl = function(o) {
    var self = this;

    // Throw an error if no source is provided.
    if (!o.src || o.src.length === 0) {
        console.error('An array of source files must be passed with any new Howl.');
        return;
    }

    self.init(o);
};
Howl.prototype = {
    /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */
    init: function(o) {
        var self = this;

        // If we don't have an AudioContext created yet, run the setup.
        if (!Howler.ctx) {
            setupAudioContext();
        }

        // Setup user-defined default properties.
        self._autoplay = o.autoplay || false;
        self._format = (typeof o.format !== 'string') ? o.format : [o.format];
        self._html5 = o.html5 || false;
        self._muted = o.mute || false;
        self._loop = o.loop || false;
        self._pool = o.pool || 5;
        self._preload = (typeof o.preload === 'boolean') ? o.preload : true;
        self._rate = o.rate || 1;
        self._sprite = o.sprite || {};
        self._src = (typeof o.src !== 'string') ? o.src : [o.src];
        self._volume = o.volume !== undefined ? o.volume : 1;

        // Setup all other default properties.
        self._duration = 0;
        self._state = 'unloaded';
        self._sounds = [];
        self._endTimers = {};
        self._queue = [];

        // Setup event listeners.
        self._onend = o.onend ? [{
            fn: o.onend
        }] : [];
        self._onfade = o.onfade ? [{
            fn: o.onfade
        }] : [];
        self._onload = o.onload ? [{
            fn: o.onload
        }] : [];
        self._onloaderror = o.onloaderror ? [{
            fn: o.onloaderror
        }] : [];
        self._onpause = o.onpause ? [{
            fn: o.onpause
        }] : [];
        self._onplay = o.onplay ? [{
            fn: o.onplay
        }] : [];
        self._onstop = o.onstop ? [{
            fn: o.onstop
        }] : [];
        self._onmute = o.onmute ? [{
            fn: o.onmute
        }] : [];
        self._onvolume = o.onvolume ? [{
            fn: o.onvolume
        }] : [];
        self._onrate = o.onrate ? [{
            fn: o.onrate
        }] : [];
        self._onseek = o.onseek ? [{
            fn: o.onseek
        }] : [];
        self._onresume = [];

        // Web Audio or HTML5 Audio?
        self._webAudio = Howler.usingWebAudio && !self._html5;

        // Automatically try to enable audio on iOS.
        if (typeof Howler.ctx !== 'undefined' && Howler.ctx && Howler.mobileAutoEnable) {
            Howler._enableMobileAudio();
        }

        // Keep track of this Howl group in the global controller.
        Howler._howls.push(self);

        // If they selected autoplay, add a play event to the load queue.
        if (self._autoplay) {
            self._queue.push({
                event: 'play',
                action: function() {
                    self.play();
                }
            });
        }

        // Load the source file unless otherwise specified.
        if (self._preload) {
            self.load();
        }

        return self;
    },

    /**
     * Load the audio file.
     * @return {Howler}
     */
    load: function() {
        var self = this;
        var url = null;

        // If no audio is available, quit immediately.
        if (Howler.noAudio) {
            self._emit('loaderror', null, 'No audio support.');
            return;
        }

        // Make sure our source is in an array.
        if (typeof self._src === 'string') {
            self._src = [self._src];
        }

        // Loop through the sources and pick the first one that is compatible.
        for (var i = 0; i < self._src.length; i++) {
            var ext,
                str;

            if (self._format && self._format[i]) {
                // If an extension was specified, use that instead.
                ext = self._format[i];
            } else {
                // Make sure the source is a string.
                str = self._src[i];
                if (typeof str !== 'string') {
                    self._emit('loaderror', null, 'Non-string found in selected audio sources - ignoring.');
                    continue;
                }

                // Extract the file extension from the URL or base64 data URI.
                ext = /^data:audio\/([^;,]+);/i.exec(str);
                if (!ext) {
                    ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
                }

                if (ext) {
                    ext = ext[1].toLowerCase();
                }
            }

            // Log a warning if no extension was found.
            if (!ext) {
                console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
            }

            // Check if this extension is available.
            if (ext && Howler.codecs(ext)) {
                url = self._src[i];
                break;
            }
        }

        if (!url) {
            self._emit('loaderror', null, 'No codec support for selected audio sources.');
            return;
        }

        self._src = url;
        self._state = 'loading';

        // If the hosting page is HTTPS and the source isn't,
        // drop down to HTML5 Audio to avoid Mixed Content errors.
        if (window.location.protocol === 'https:' && url.slice(0, 5) === 'http:') {
            self._html5 = true;
            self._webAudio = false;
        }

        // Create a new sound object and add it to the pool.
        new Sound(self);

        // Load and decode the audio data for playback.
        if (self._webAudio) {
            loadBuffer(self);
        }

        return self;
    },

    /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Number}          Sound ID.
     */
    play: function(sprite, internal) {
        var self = this;
        var id = null;

        // Determine if a sprite, sound id or nothing was passed
        if (typeof sprite === 'number') {
            id = sprite;
            sprite = null;
        } else if (typeof sprite === 'string' && self._state === 'loaded' && !self._sprite[sprite]) {
            // If the passed sprite doesn't exist, do nothing.
            return null;
        } else if (typeof sprite === 'undefined') {
            // Use the default sound sprite (plays the full audio length).
            sprite = '__default';

            // Check if there is a single paused sound that isn't ended.
            // If there is, play that sound. If not, continue as usual.
            var num = 0;
            for (var i = 0; i < self._sounds.length; i++) {
                if (self._sounds[i]._paused && !self._sounds[i]._ended) {
                    num++;
                    id = self._sounds[i]._id;
                }
            }

            if (num === 1) {
                sprite = null;
            } else {
                id = null;
            }
        }

        // Get the selected node, or get one from the pool.
        var sound = id ? self._soundById(id) : self._inactiveSound();

        // If the sound doesn't exist, do nothing.
        if (!sound) {
            return null;
        }

        // Select the sprite definition.
        if (id && !sprite) {
            sprite = sound._sprite || '__default';
        }

        // If we have no sprite and the sound hasn't loaded, we must wait
        // for the sound to load to get our audio's duration.
        if (self._state !== 'loaded' && !self._sprite[sprite]) {
            self._queue.push({
                event: 'play',
                action: function() {
                    self.play(self._soundById(sound._id) ? sound._id : undefined);
                }
            });

            return sound._id;
        }

        // Don't play the sound if an id was passed and it is already playing.
        if (id && !sound._paused) {
            // Trigger the play event, in order to keep iterating through queue.
            if (!internal) {
                setTimeout(function() {
                    self._emit('play', sound._id);
                }, 0);
            }

            return sound._id;
        }

        // Make sure the AudioContext isn't suspended, and resume it if it is.
        if (self._webAudio) {
            Howler._autoResume();
        }

        // Determine how long to play for and where to start playing.
        var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
        var duration = Math.max(0, ((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek);
        var timeout = (duration * 1000) / Math.abs(sound._rate);

        // Update the parameters of the sound
        sound._paused = false;
        sound._ended = false;
        sound._sprite = sprite;
        sound._seek = seek;
        sound._start = self._sprite[sprite][0] / 1000;
        sound._stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
        sound._loop = !!(sound._loop || self._sprite[sprite][2]);

        // Begin the actual playback.
        var node = sound._node;
        if (self._webAudio) {
            // Fire this when the sound is ready to play to begin Web Audio playback.
            var playWebAudio = function() {
                self._refreshBuffer(sound);

                // Setup the playback params.
                var vol = (sound._muted || self._muted) ? 0 : sound._volume;
                node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
                sound._playStart = Howler.ctx.currentTime;

                // Play the sound using the supported method.
                if (typeof node.bufferSource.start === 'undefined') {
                    sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
                } else {
                    sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
                }

                // Start a new timer if none is present.
                if (timeout !== Infinity) {
                    self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
                }

                if (!internal) {
                    setTimeout(function() {
                        self._emit('play', sound._id);
                    }, 0);
                }
            };

            var isRunning = (Howler.state === 'running');
            if (self._state === 'loaded' && isRunning) {
                playWebAudio();
            } else {
                // Wait for the audio to load and then begin playback.
                var event = !isRunning && self._state === 'loaded' ? 'resume' : 'load';
                self.once(event, playWebAudio, isRunning ? sound._id : null);

                // Cancel the end timer.
                self._clearTimer(sound._id);
            }
        } else {
            // Fire this when the sound is ready to play to begin HTML5 Audio playback.
            var playHtml5 = function() {
                node.currentTime = seek;
                node.muted = sound._muted || self._muted || Howler._muted || node.muted;
                node.volume = sound._volume * Howler.volume();
                node.playbackRate = sound._rate;
                node.play();

                // Setup the new end timer.
                if (timeout !== Infinity) {
                    self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
                }

                if (!internal) {
                    self._emit('play', sound._id);
                }
            };

            // Play immediately if ready, or wait for the 'canplaythrough'e vent.
            var loadedNoReadyState = (self._state === 'loaded' && (window && window.ejecta || !node.readyState && Howler._navigator.isCocoonJS));
            if (node.readyState === 4 || loadedNoReadyState) {
                playHtml5();
            } else {
                var listener = function() {
                    // Begin playback.
                    playHtml5();

                    // Clear this listener.
                    node.removeEventListener(Howler._canPlayEvent, listener, false);
                };
                node.addEventListener(Howler._canPlayEvent, listener, false);

                // Cancel the end timer.
                self._clearTimer(sound._id);
            }
        }

        return sound._id;
    },

    /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */
    pause: function(id) {
        var self = this;

        // If the sound hasn't loaded, add it to the load queue to pause when capable.
        if (self._state !== 'loaded') {
            self._queue.push({
                event: 'pause',
                action: function() {
                    self.pause(id);
                }
            });

            return self;
        }

        // If no id is passed, get all ID's to be paused.
        var ids = self._getSoundIds(id);

        for (var i = 0; i < ids.length; i++) {
            // Clear the end timer.
            self._clearTimer(ids[i]);

            // Get the sound.
            var sound = self._soundById(ids[i]);

            if (sound && !sound._paused) {
                // Reset the seek position.
                sound._seek = self.seek(ids[i]);
                sound._rateSeek = 0;
                sound._paused = true;

                // Stop currently running fades.
                self._stopFade(ids[i]);

                if (sound._node) {
                    if (self._webAudio) {
                        // make sure the sound has been created
                        if (!sound._node.bufferSource) {
                            return self;
                        }

                        if (typeof sound._node.bufferSource.stop === 'undefined') {
                            sound._node.bufferSource.noteOff(0);
                        } else {
                            sound._node.bufferSource.stop(0);
                        }

                        // Clean up the buffer source.
                        self._cleanBuffer(sound._node);
                    } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
                        sound._node.pause();
                    }
                }
            }

            // Fire the pause event, unless `true` is passed as the 2nd argument.
            if (!arguments[1]) {
                self._emit('pause', sound ? sound._id : null);
            }
        }

        return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Howl}
     */
    stop: function(id, internal) {
        var self = this;

        // If the sound hasn't loaded, add it to the load queue to stop when capable.
        if (self._state !== 'loaded') {
            self._queue.push({
                event: 'stop',
                action: function() {
                    self.stop(id);
                }
            });

            return self;
        }

        // If no id is passed, get all ID's to be stopped.
        var ids = self._getSoundIds(id);

        for (var i = 0; i < ids.length; i++) {
            // Clear the end timer.
            self._clearTimer(ids[i]);

            // Get the sound.
            var sound = self._soundById(ids[i]);

            if (sound) {
                // Reset the seek position.
                sound._seek = sound._start || 0;
                sound._rateSeek = 0;
                sound._paused = true;
                sound._ended = true;

                // Stop currently running fades.
                self._stopFade(ids[i]);

                if (sound._node) {
                    if (self._webAudio) {
                        // make sure the sound has been created
                        if (!sound._node.bufferSource) {
                            if (!internal) {
                                self._emit('stop', sound._id);
                            }

                            return self;
                        }

                        if (typeof sound._node.bufferSource.stop === 'undefined') {
                            sound._node.bufferSource.noteOff(0);
                        } else {
                            sound._node.bufferSource.stop(0);
                        }

                        // Clean up the buffer source.
                        self._cleanBuffer(sound._node);
                    } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
                        sound._node.currentTime = sound._start || 0;
                        sound._node.pause();
                    }
                }
            }

            if (sound && !internal) {
                self._emit('stop', sound._id);
            }
        }

        return self;
    },

    /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */
    mute: function(muted, id) {
        var self = this;

        // If the sound hasn't loaded, add it to the load queue to mute when capable.
        if (self._state !== 'loaded') {
            self._queue.push({
                event: 'mute',
                action: function() {
                    self.mute(muted, id);
                }
            });

            return self;
        }

        // If applying mute/unmute to all sounds, update the group's value.
        if (typeof id === 'undefined') {
            if (typeof muted === 'boolean') {
                self._muted = muted;
            } else {
                return self._muted;
            }
        }

        // If no id is passed, get all ID's to be muted.
        var ids = self._getSoundIds(id);

        for (var i = 0; i < ids.length; i++) {
            // Get the sound.
            var sound = self._soundById(ids[i]);

            if (sound) {
                sound._muted = muted;

                if (self._webAudio && sound._node) {
                    sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
                } else if (sound._node) {
                    sound._node.muted = Howler._muted ? true : muted;
                }

                self._emit('mute', sound._id);
            }
        }

        return self;
    },

    /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */
    volume: function() {
        var self = this;
        var args = arguments;
        var vol,
            id;

        // Determine the values based on arguments.
        if (args.length === 0) {
            // Return the value of the groups' volume.
            return self._volume;
        } else if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
            // First check if this is an ID, and if not, assume it is a new volume.
            var ids = self._getSoundIds();
            var index = ids.indexOf(args[0]);
            if (index >= 0) {
                id = parseInt(args[0], 10);
            } else {
                vol = parseFloat(args[0]);
            }
        } else if (args.length >= 2) {
            vol = parseFloat(args[0]);
            id = parseInt(args[1], 10);
        }

        // Update the volume or return the current volume.
        var sound;
        if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
            // If the sound hasn't loaded, add it to the load queue to change volume when capable.
            if (self._state !== 'loaded') {
                self._queue.push({
                    event: 'volume',
                    action: function() {
                        self.volume.apply(self, args);
                    }
                });

                return self;
            }

            // Set the group volume.
            if (typeof id === 'undefined') {
                self._volume = vol;
            }

            // Update one or all volumes.
            id = self._getSoundIds(id);
            for (var i = 0; i < id.length; i++) {
                // Get the sound.
                sound = self._soundById(id[i]);

                if (sound) {
                    sound._volume = vol;

                    // Stop currently running fades.
                    if (!args[2]) {
                        self._stopFade(id[i]);
                    }

                    if (self._webAudio && sound._node && !sound._muted) {
                        sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
                    } else if (sound._node && !sound._muted) {
                        sound._node.volume = vol * Howler.volume();
                    }

                    self._emit('volume', sound._id);
                }
            }
        } else {
            sound = id ? self._soundById(id) : self._sounds[0];
            return sound ? sound._volume : 0;
        }

        return self;
    },

    /**
     * Fade a currently playing sound between two volumes (if no id is passsed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */
    fade: function(from, to, len, id) {
        var self = this;
        var diff = Math.abs(from - to);
        var dir = from > to ? 'out' : 'in';
        var steps = diff / 0.01;
        var stepLen = (steps > 0) ? len / steps : len;

        // Since browsers clamp timeouts to 4ms, we need to clamp our steps to that too.
        if (stepLen < 4) {
            steps = Math.ceil(steps / (4 / stepLen));
            stepLen = 4;
        }

        // If the sound hasn't loaded, add it to the load queue to fade when capable.
        if (self._state !== 'loaded') {
            self._queue.push({
                event: 'fade',
                action: function() {
                    self.fade(from, to, len, id);
                }
            });

            return self;
        }

        // Set the volume to the start position.
        self.volume(from, id);

        // Fade the volume of one or all sounds.
        var ids = self._getSoundIds(id);
        for (var i = 0; i < ids.length; i++) {
            // Get the sound.
            var sound = self._soundById(ids[i]);

            // Create a linear fade or fall back to timeouts with HTML5 Audio.
            if (sound) {
                // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
                if (!id) {
                    self._stopFade(ids[i]);
                }

                // If we are using Web Audio, let the native methods do the actual fade.
                if (self._webAudio && !sound._muted) {
                    var currentTime = Howler.ctx.currentTime;
                    var end = currentTime + (len / 1000);
                    sound._volume = from;
                    sound._node.gain.setValueAtTime(from, currentTime);
                    sound._node.gain.linearRampToValueAtTime(to, end);
                }

                var vol = from;
                sound._interval = setInterval(function(soundId, sound) {
                    // Update the volume amount, but only if the volume should change.
                    if (steps > 0) {
                        vol += (dir === 'in' ? 0.01 : -0.01);
                    }

                    // Make sure the volume is in the right bounds.
                    vol = Math.max(0, vol);
                    vol = Math.min(1, vol);

                    // Round to within 2 decimal points.
                    vol = Math.round(vol * 100) / 100;

                    // Change the volume.
                    if (self._webAudio) {
                        if (typeof id === 'undefined') {
                            self._volume = vol;
                        }

                        sound._volume = vol;
                    } else {
                        self.volume(vol, soundId, true);
                    }

                    // When the fade is complete, stop it and fire event.
                    if ((to < from && vol <= to) || (to > from && vol >= to)) {
                        clearInterval(sound._interval);
                        sound._interval = null;
                        self.volume(to, soundId);
                        self._emit('fade', soundId);
                    }
                }.bind(self, ids[i], sound), stepLen);
            }
        }

        return self;
    },

    /**
     * Internal method that stops the currently playing fade when
     * a new fade starts, volume is changed or the sound is stopped.
     * @param  {Number} id The sound id.
     * @return {Howl}
     */
    _stopFade: function(id) {
        var self = this;
        var sound = self._soundById(id);

        if (sound && sound._interval) {
            if (self._webAudio) {
                sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
            }

            clearInterval(sound._interval);
            sound._interval = null;
            self._emit('fade', id);
        }

        return self;
    },

    /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */
    loop: function() {
        var self = this;
        var args = arguments;
        var loop,
            id,
            sound;

        // Determine the values for loop and id.
        if (args.length === 0) {
            // Return the grou's loop value.
            return self._loop;
        } else if (args.length === 1) {
            if (typeof args[0] === 'boolean') {
                loop = args[0];
                self._loop = loop;
            } else {
                // Return this sound's loop value.
                sound = self._soundById(parseInt(args[0], 10));
                return sound ? sound._loop : false;
            }
        } else if (args.length === 2) {
            loop = args[0];
            id = parseInt(args[1], 10);
        }

        // If no id is passed, get all ID's to be looped.
        var ids = self._getSoundIds(id);
        for (var i = 0; i < ids.length; i++) {
            sound = self._soundById(ids[i]);

            if (sound) {
                sound._loop = loop;
                if (self._webAudio && sound._node && sound._node.bufferSource) {
                    sound._node.bufferSource.loop = loop;
                    if (loop) {
                        sound._node.bufferSource.loopStart = sound._start || 0;
                        sound._node.bufferSource.loopEnd = sound._stop;
                    }
                }
            }
        }

        return self;
    },

    /**
     * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   rate() -> Returns the first sound node's current playback rate.
     *   rate(id) -> Returns the sound id's current playback rate.
     *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
     *   rate(rate, id) -> Sets the playback rate of passed sound id.
     * @return {Howl/Number} Returns self or the current playback rate.
     */
    rate: function() {
        var self = this;
        var args = arguments;
        var rate,
            id;

        // Determine the values based on arguments.
        if (args.length === 0) {
            // We will simply return the current rate of the first node.
            id = self._sounds[0]._id;
        } else if (args.length === 1) {
            // First check if this is an ID, and if not, assume it is a new rate value.
            var ids = self._getSoundIds();
            var index = ids.indexOf(args[0]);
            if (index >= 0) {
                id = parseInt(args[0], 10);
            } else {
                rate = parseFloat(args[0]);
            }
        } else if (args.length === 2) {
            rate = parseFloat(args[0]);
            id = parseInt(args[1], 10);
        }

        // Update the playback rate or return the current value.
        var sound;
        if (typeof rate === 'number') {
            // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
            if (self._state !== 'loaded') {
                self._queue.push({
                    event: 'rate',
                    action: function() {
                        self.rate.apply(self, args);
                    }
                });

                return self;
            }

            // Set the group rate.
            if (typeof id === 'undefined') {
                self._rate = rate;
            }

            // Update one or all volumes.
            id = self._getSoundIds(id);
            for (var i = 0; i < id.length; i++) {
                // Get the sound.
                sound = self._soundById(id[i]);

                if (sound) {
                    // Keep track of our position when the rate changed and update the playback
                    // start position so we can properly adjust the seek position for time elapsed.
                    sound._rateSeek = self.seek(id[i]);
                    sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
                    sound._rate = rate;

                    // Change the playback rate.
                    if (self._webAudio && sound._node && sound._node.bufferSource) {
                        sound._node.bufferSource.playbackRate.value = rate;
                    } else if (sound._node) {
                        sound._node.playbackRate = rate;
                    }

                    // Reset the timers.
                    var seek = self.seek(id[i]);
                    var duration = ((self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000) - seek;
                    var timeout = (duration * 1000) / Math.abs(sound._rate);

                    // Start a new end timer if sound is already playing.
                    if (self._endTimers[id[i]] || !sound._paused) {
                        self._clearTimer(id[i]);
                        self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
                    }

                    self._emit('rate', sound._id);
                }
            }
        } else {
            sound = self._soundById(id);
            return sound ? sound._rate : self._rate;
        }

        return self;
    },

    /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */
    seek: function() {
        var self = this;
        var args = arguments;
        var seek,
            id;

        // Determine the values based on arguments.
        if (args.length === 0) {
            // We will simply return the current position of the first node.
            id = self._sounds[0]._id;
        } else if (args.length === 1) {
            // First check if this is an ID, and if not, assume it is a new seek position.
            var ids = self._getSoundIds();
            var index = ids.indexOf(args[0]);
            if (index >= 0) {
                id = parseInt(args[0], 10);
            } else {
                id = self._sounds[0]._id;
                seek = parseFloat(args[0]);
            }
        } else if (args.length === 2) {
            seek = parseFloat(args[0]);
            id = parseInt(args[1], 10);
        }

        // If there is no ID, bail out.
        if (typeof id === 'undefined') {
            return self;
        }

        // If the sound hasn't loaded, add it to the load queue to seek when capable.
        if (self._state !== 'loaded') {
            self._queue.push({
                event: 'seek',
                action: function() {
                    self.seek.apply(self, args);
                }
            });

            return self;
        }

        // Get the sound.
        var sound = self._soundById(id);

        if (sound) {
            if (typeof seek === 'number' && seek >= 0) {
                // Pause the sound and update position for restarting playback.
                var playing = self.playing(id);
                if (playing) {
                    self.pause(id, true);
                }

                // Move the position of the track and cancel timer.
                sound._seek = seek;
                sound._ended = false;
                self._clearTimer(id);

                // Restart the playback if the sound was playing.
                if (playing) {
                    self.play(id, true);
                }

                // Update the seek position for HTML5 Audio.
                if (!self._webAudio && sound._node) {
                    sound._node.currentTime = seek;
                }

                self._emit('seek', id);
            } else {
                if (self._webAudio) {
                    var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
                    var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
                    return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
                } else {
                    return sound._node.currentTime;
                }
            }
        }

        return self;
    },

    /**
     * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
     * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
     * @return {Boolean} True if playing and false if not.
     */
    playing: function(id) {
        var self = this;

        // Check the passed sound ID (if any).
        if (typeof id === 'number') {
            var sound = self._soundById(id);
            return sound ? !sound._paused : false;
        }

        // Otherwise, loop through all sounds and check if any are playing.
        for (var i = 0; i < self._sounds.length; i++) {
            if (!self._sounds[i]._paused) {
                return true;
            }
        }

        return false;
    },

    /**
     * Get the duration of this sound. Passing a sound id will return the sprite duration.
     * @param  {Number} id The sound id to check. If none is passed, return full source duration.
     * @return {Number} Audio duration in seconds.
     */
    duration: function(id) {
        var self = this;
        var duration = self._duration;

        // If we pass an ID, get the sound and return the sprite length.
        var sound = self._soundById(id);
        if (sound) {
            duration = self._sprite[sound._sprite][1] / 1000;
        }

        return duration;
    },

    /**
     * Returns the current loaded state of this Howl.
     * @return {String} 'unloaded', 'loading', 'loaded'
     */
    state: function() {
        return this._state;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */
    unload: function() {
        var self = this;

        // Stop playing any active sounds.
        var sounds = self._sounds;
        for (var i = 0; i < sounds.length; i++) {
            // Stop the sound if it is currently playing.
            if (!sounds[i]._paused) {
                self.stop(sounds[i]._id);
            }

            // Remove the source or disconnect.
            if (!self._webAudio) {
                // Set the source to 0-second silence to stop any downloading.
                sounds[i]._node.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

                // Remove any event listeners.
                sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);
                sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false);
            }

            // Empty out all of the nodes.
            delete sounds[i]._node;

            // Make sure all timers are cleared out.
            self._clearTimer(sounds[i]._id);

            // Remove the references in the global Howler object.
            var index = Howler._howls.indexOf(self);
            if (index >= 0) {
                Howler._howls.splice(index, 1);
            }
        }

        // Delete this sound from the cache (if no other Howl is using it).
        var remCache = true;
        for (i = 0; i < Howler._howls.length; i++) {
            if (Howler._howls[i]._src === self._src) {
                remCache = false;
                break;
            }
        }

        if (cache && remCache) {
            delete cache[self._src];
        }

        // Clear global errors.
        Howler.noAudio = false;

        // Clear out `self`.
        self._state = 'unloaded';
        self._sounds = [];
        self = null;

        return null;
    },

    /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
     * @return {Howl}
     */
    on: function(event, fn, id, once) {
        var self = this;
        var events = self['_on' + event];

        if (typeof fn === 'function') {
            events.push(once ? {
                id: id,
                fn: fn,
                once: once
            } : {
                id: id,
                fn: fn
            });
        }

        return self;
    },

    /**
     * Remove a custom event. Call without parameters to remove all events.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */
    off: function(event, fn, id) {
        var self = this;
        var events = self['_on' + event];
        var i = 0;

        if (fn) {
            // Loop through event store and remove the passed function.
            for (i = 0; i < events.length; i++) {
                if (fn === events[i].fn && id === events[i].id) {
                    events.splice(i, 1);
                    break;
                }
            }
        } else if (event) {
            // Clear out all events of this type.
            self['_on' + event] = [];
        } else {
            // Clear out all events of every type.
            var keys = Object.keys(self);
            for (i = 0; i < keys.length; i++) {
                if ((keys[i].indexOf('_on') === 0) && Array.isArray(self[keys[i]])) {
                    self[keys[i]] = [];
                }
            }
        }

        return self;
    },

    /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    once: function(event, fn, id) {
        var self = this;

        // Setup the event listener.
        self.on(event, fn, id, 1);

        return self;
    },

    /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */
    _emit: function(event, id, msg) {
        var self = this;
        var events = self['_on' + event];

        // Loop through event store and fire all functions.
        for (var i = events.length - 1; i >= 0; i--) {
            if (!events[i].id || events[i].id === id || event === 'load') {
                setTimeout(function(fn) {
                    fn.call(this, id, msg);
                }.bind(self, events[i].fn), 0);

                // If this event was setup with `once`, remove it.
                if (events[i].once) {
                    self.off(event, events[i].fn, events[i].id);
                }
            }
        }

        return self;
    },

    /**
     * Queue of actions initiated before the sound has loaded.
     * These will be called in sequence, with the next only firing
     * after the previous has finished executing (even if async like play).
     * @return {Howl}
     */
    _loadQueue: function() {
        var self = this;

        if (self._queue.length > 0) {
            var task = self._queue[0];

            // don't move onto the next task until this one is done
            self.once(task.event, function() {
                self._queue.shift();
                self._loadQueue();
            });

            task.action();
        }

        return self;
    },

    /**
     * Fired when playback ends at the end of the duration.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _ended: function(sound) {
        var self = this;
        var sprite = sound._sprite;

        // Should this sound loop?
        var loop = !!(sound._loop || self._sprite[sprite][2]);

        // Fire the ended event.
        self._emit('end', sound._id);

        // Restart the playback for HTML5 Audio loop.
        if (!self._webAudio && loop) {
            self.stop(sound._id, true).play(sound._id);
        }

        // Restart this timer if on a Web Audio loop.
        if (self._webAudio && loop) {
            self._emit('play', sound._id);
            sound._seek = sound._start || 0;
            sound._rateSeek = 0;
            sound._playStart = Howler.ctx.currentTime;

            var timeout = ((sound._stop - sound._start) * 1000) / Math.abs(sound._rate);
            self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
        }

        // Mark the node as paused.
        if (self._webAudio && !loop) {
            sound._paused = true;
            sound._ended = true;
            sound._seek = sound._start || 0;
            sound._rateSeek = 0;
            self._clearTimer(sound._id);

            // Clean up the buffer source.
            self._cleanBuffer(sound._node);

            // Attempt to auto-suspend AudioContext if no sounds are still playing.
            Howler._autoSuspend();
        }

        // When using a sprite, end the track.
        if (!self._webAudio && !loop) {
            self.stop(sound._id);
        }

        return self;
    },

    /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */
    _clearTimer: function(id) {
        var self = this;

        if (self._endTimers[id]) {
            clearTimeout(self._endTimers[id]);
            delete self._endTimers[id];
        }

        return self;
    },

    /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */
    _soundById: function(id) {
        var self = this;

        // Loop through all sounds and find the one with this ID.
        for (var i = 0; i < self._sounds.length; i++) {
            if (id === self._sounds[i]._id) {
                return self._sounds[i];
            }
        }

        return null;
    },

    /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */
    _inactiveSound: function() {
        var self = this;

        self._drain();

        // Find the first inactive node to recycle.
        for (var i = 0; i < self._sounds.length; i++) {
            if (self._sounds[i]._ended) {
                return self._sounds[i].reset();
            }
        }

        // If no inactive node was found, create a new one.
        return new Sound(self);
    },

    /**
     * Drain excess inactive sounds from the pool.
     */
    _drain: function() {
        var self = this;
        var limit = self._pool;
        var cnt = 0;
        var i = 0;

        // If there are less sounds than the max pool size, we are done.
        if (self._sounds.length < limit) {
            return;
        }

        // Count the number of inactive sounds.
        for (i = 0; i < self._sounds.length; i++) {
            if (self._sounds[i]._ended) {
                cnt++;
            }
        }

        // Remove excess inactive sounds, going in reverse order.
        for (i = self._sounds.length - 1; i >= 0; i--) {
            if (cnt <= limit) {
                return;
            }

            if (self._sounds[i]._ended) {
                // Disconnect the audio source when using Web Audio.
                if (self._webAudio && self._sounds[i]._node) {
                    self._sounds[i]._node.disconnect(0);
                }

                // Remove sounds until we have the pool size.
                self._sounds.splice(i, 1);
                cnt--;
            }
        }
    },

    /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */
    _getSoundIds: function(id) {
        var self = this;

        if (typeof id === 'undefined') {
            var ids = [];
            for (var i = 0; i < self._sounds.length; i++) {
                ids.push(self._sounds[i]._id);
            }

            return ids;
        } else {
            return [id];
        }
    },

    /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _refreshBuffer: function(sound) {
        var self = this;

        // Setup the buffer source for playback.
        sound._node.bufferSource = Howler.ctx.createBufferSource();
        sound._node.bufferSource.buffer = cache[self._src];

        // Connect to the correct node.
        if (sound._panner) {
            sound._node.bufferSource.connect(sound._panner);
        } else {
            sound._node.bufferSource.connect(sound._node);
        }

        // Setup looping and playback rate.
        sound._node.bufferSource.loop = sound._loop;
        if (sound._loop) {
            sound._node.bufferSource.loopStart = sound._start || 0;
            sound._node.bufferSource.loopEnd = sound._stop;
        }
        sound._node.bufferSource.playbackRate.value = sound._rate;

        return self;
    },

    /**
     * Prevent memory leaks by cleaning up the buffer source after playback.
     * @param  {Object} node Sound's audio node containing the buffer source.
     * @return {Howl}
     */
    _cleanBuffer: function(node) {
        var self = this;

        if (self._scratchBuffer) {
            node.bufferSource.onended = null;
            node.bufferSource.disconnect(0);
            try {
                node.bufferSource.buffer = self._scratchBuffer;
            } catch ( e ) {}
        }
        node.bufferSource = null;

        return self;
    }
};

/** Single Sound Methods **/
/***************************************************************************/

/**
 * Setup the sound object, which each node attached to a Howl group is contained in.
 * @param {Object} howl The Howl parent group.
 */
var Sound = function(howl) {
    this._parent = howl;
    this.init();
};
Sound.prototype = {
    /**
     * Initialize a new Sound object.
     * @return {Sound}
     */
    init: function() {
        var self = this;
        var parent = self._parent;

        // Setup the default parameters.
        self._muted = parent._muted;
        self._loop = parent._loop;
        self._volume = parent._volume;
        self._muted = parent._muted;
        self._rate = parent._rate;
        self._seek = 0;
        self._paused = true;
        self._ended = true;
        self._sprite = '__default';

        // Generate a unique ID for this sound.
        self._id = ++Howler._counter;

        // Add itself to the parent's pool.
        parent._sounds.push(self);

        // Create the new node.
        self.create();

        return self;
    },

    /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */
    create: function() {
        var self = this;
        var parent = self._parent;
        var volume = (Howler._muted || self._muted || self._parent._muted) ? 0 : self._volume;

        if (parent._webAudio) {
            // Create the gain node for controlling volume (the source will connect to this).
            self._node = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
            self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
            self._node.paused = true;
            self._node.connect(Howler.masterGain);
        } else {
            self._node = new Audio();

            // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
            self._errorFn = self._errorListener.bind(self);
            self._node.addEventListener('error', self._errorFn, false);

            // Listen for 'canplaythrough' event to let us know the sound is ready.
            self._loadFn = self._loadListener.bind(self);
            self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false);

            // Setup the new audio node.
            self._node.src = parent._src;
            self._node.preload = 'auto';
            self._node.volume = volume * Howler.volume();

            // Begin loading the source.
            self._node.load();
        }

        return self;
    },

    /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */
    reset: function() {
        var self = this;
        var parent = self._parent;

        // Reset all of the parameters of this sound.
        self._muted = parent._muted;
        self._loop = parent._loop;
        self._volume = parent._volume;
        self._muted = parent._muted;
        self._rate = parent._rate;
        self._seek = 0;
        self._rateSeek = 0;
        self._paused = true;
        self._ended = true;
        self._sprite = '__default';

        // Generate a new ID so that it isn't confused with the previous sound.
        self._id = ++Howler._counter;

        return self;
    },

    /**
     * HTML5 Audio error listener callback.
     */
    _errorListener: function() {
        var self = this;

        // Fire an error event and pass back the code.
        self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0);

        // Clear the event listener.
        self._node.removeEventListener('error', self._errorListener, false);
    },

    /**
     * HTML5 Audio canplaythrough listener callback.
     */
    _loadListener: function() {
        var self = this;
        var parent = self._parent;

        // Round up the duration to account for the lower precision in HTML5 Audio.
        parent._duration = Math.ceil(self._node.duration * 10) / 10;

        // Setup a sprite if none is defined.
        if (Object.keys(parent._sprite).length === 0) {
            parent._sprite = {
                __default: [0, parent._duration * 1000]
            };
        }

        if (parent._state !== 'loaded') {
            parent._state = 'loaded';
            parent._emit('load');
            parent._loadQueue();
        }

        // Clear the event listener.
        self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
    }
};

/** Helper Methods **/
/***************************************************************************/

var cache = {};

/**
 * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
 * @param  {Howl} self
 */
var loadBuffer = function(self) {
    var url = self._src;

    // Check if the buffer has already been cached and use it instead.
    if (cache[url]) {
        // Set the duration from the cache.
        self._duration = cache[url].duration;

        // Load the sound into this Howl.
        loadSound(self);

        return;
    }

    if (/^data:[^;]+;base64,/.test(url)) {
        // Decode the base64 data URI without XHR, since some browsers don't support it.
        var data = atob(url.split(',')[1]);
        var dataView = new Uint8Array(data.length);
        for (var i = 0; i < data.length; ++i) {
            dataView[i] = data.charCodeAt(i);
        }

        decodeAudioData(dataView.buffer, self);
    } else {
        // Load the buffer from the URL.
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            // Make sure we get a successful response back.
            var code = (xhr.status + '')[0];
            if (code !== '0' && code !== '2' && code !== '3') {
                self._emit('loaderror', null, 'Failed loading audio file with status: ' + xhr.status + '.');
                return;
            }

            decodeAudioData(xhr.response, self);
        };
        xhr.onerror = function() {
            // If there is an error, switch to HTML5 Audio.
            if (self._webAudio) {
                self._html5 = true;
                self._webAudio = false;
                self._sounds = [];
                delete cache[url];
                self.load();
            }
        };
        safeXhrSend(xhr);
    }
};

/**
 * Send the XHR request wrapped in a try/catch.
 * @param  {Object} xhr XHR to send.
 */
var safeXhrSend = function(xhr) {
    try {
        xhr.send();
    } catch ( e ) {
        xhr.onerror();
    }
};

/**
 * Decode audio data from an array buffer.
 * @param  {ArrayBuffer} arraybuffer The audio data.
 * @param  {Howl}        self
 */
var decodeAudioData = function(arraybuffer, self) {
    // Decode the buffer into an audio source.
    Howler.ctx.decodeAudioData(arraybuffer, function(buffer) {
        if (buffer && self._sounds.length > 0) {
            cache[self._src] = buffer;
            loadSound(self, buffer);
        }
    }, function() {
        self._emit('loaderror', null, 'Decoding audio data failed.');
    });
};

/**
 * Sound is now loaded, so finish setting everything up and fire the loaded event.
 * @param  {Howl} self
 * @param  {Object} buffer The decoded buffer sound source.
 */
var loadSound = function(self, buffer) {
    // Set the duration.
    if (buffer && !self._duration) {
        self._duration = buffer.duration;
    }

    // Setup a sprite if none is defined.
    if (Object.keys(self._sprite).length === 0) {
        self._sprite = {
            __default: [0, self._duration * 1000]
        };
    }

    // Fire the loaded event.
    if (self._state !== 'loaded') {
        self._state = 'loaded';
        self._emit('load');
        self._loadQueue();
    }
};

/**
 * Setup the audio context when available, or switch to HTML5 Audio mode.
 */
var setupAudioContext = function() {
    // Check if we are using Web Audio and setup the AudioContext if we are.
    try {
        if (typeof AudioContext !== 'undefined') {
            Howler.ctx = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            Howler.ctx = new webkitAudioContext();
        } else {
            Howler.usingWebAudio = false;
        }
    } catch ( e ) {
        Howler.usingWebAudio = false;
    }

    // Check if a webview is being used on iOS8 or earlier (rather than the browser).
    // If it is, disable Web Audio as it causes crashing.
    var iOS = (/iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform));
    var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    var version = appVersion ? parseInt(appVersion[1], 10) : null;
    if (iOS && version && version < 9) {
        var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());
        if (Howler._navigator && Howler._navigator.standalone && !safari || Howler._navigator && !Howler._navigator.standalone && !safari) {
            Howler.usingWebAudio = false;
        }
    }

    // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).
    if (Howler.usingWebAudio) {
        Howler.masterGain = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
        Howler.masterGain.gain.value = 1;
        Howler.masterGain.connect(Howler.ctx.destination);
    }

    // Re-run the setup on Howler.
    Howler._setup();
};

// Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return {
            Howler: Howler,
            Howl: Howl
        };
    });
}

// Add support for CommonJS libraries such as browserify.
if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
}

// Define globally in case AMD is not available or unused.
if (typeof window !== 'undefined') {
    window.HowlerGlobal = HowlerGlobal;
    window.Howler = Howler;
    window.Howl = Howl;
    window.Sound = Sound;
} else if (typeof global !== 'undefined') { // Add to global in Node.js (for testing, etc).
    global.HowlerGlobal = HowlerGlobal;
    global.Howler = Howler;
    global.Howl = Howl;
    global.Sound = Sound;
}
})();


(function(argument) {
/**
 * Binary Search Stubs for JS Arrays
 * @license MIT
 * @author Jim Chen
 */
var BinArray = (function() {
    var BinArray = {};
    BinArray.bsearch = function(arr, what, how) {
        if (arr.length === 0) {
            return 0;
        }
        if (how(what, arr[0]) < 0) {
            return 0;
        }
        if (how(what, arr[arr.length - 1]) >= 0) {
            return arr.length;
        }
        var low = 0;
        var i = 0;
        var count = 0;
        var high = arr.length - 1;
        while (low <= high) {
            i = Math.floor((high + low + 1) / 2);
            count++;
            if (how(what, arr[i - 1]) >= 0 && how(what, arr[i]) < 0) {
                return i;
            }
            if (how(what, arr[i - 1]) < 0) {
                high = i - 1;
            } else if (how(what, arr[i]) >= 0) {
                low = i;
            } else {
                console.error('Program Error');
            }
            if (count > 1500) {
                console.error('Too many run cycles.');
            }
        }
        return -1; // Never actually run
    };
    BinArray.binsert = function(arr, what, how) {
        var index = BinArray.bsearch(arr, what, how);
        arr.splice(index, 0, what);
        return index;
    };
    return BinArray;
})();

var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CommentSpaceAllocator = ( function() {
    function CommentSpaceAllocator(width, height) {
        if (width === void 0) {
            width = 0;
        }
        if (height === void 0) {
            height = 0;
        }
        this._pools = [
            []
        ];
        this.avoid = 1;
        this._width = width;
        this._height = height;
    }
    CommentSpaceAllocator.prototype.willCollide = function(existing, check) {
        return existing.stime + existing.ttl >= check.stime + check.ttl / 2;
    };
    CommentSpaceAllocator.prototype.pathCheck = function(y, comment, pool) {
        var bottom = y + comment.height;
        var right = comment.right;
        for (var i = 0; i < pool.length; i++) {
            if (pool[i].y > bottom || pool[i].bottom < y) {
                continue;
            } else if (pool[i].right < comment.x || pool[i].x > right) {
                if (this.willCollide(pool[i], comment)) {
                    return false;
                } else {
                    continue;
                }
            } else {
                return false;
            }
        }
        return true;
    };
    CommentSpaceAllocator.prototype.assign = function(comment, cindex) {
        while (this._pools.length <= cindex) {
            this._pools.push([]);
        }
        var pool = this._pools[cindex];
        if (pool.length === 0) {
            comment.cindex = cindex;
            return 0;
        } else if (this.pathCheck(0, comment, pool)) {
            comment.cindex = cindex;
            return 0;
        }
        var y = 0;
        for (var k = 0; k < pool.length; k++) {
            y = pool[k].bottom + this.avoid;
            if (y + comment.height > this._height) {
                break;
            }
            if (this.pathCheck(y, comment, pool)) {
                comment.cindex = cindex;
                return y;
            }
        }
        return this.assign(comment, cindex + 1);
    };
    CommentSpaceAllocator.prototype.add = function(comment) {
        if (comment.height > this._height) {
            comment.cindex = -2;
            comment.y = 0;
        } else {
            comment.y = this.assign(comment, 0);
            BinArray.binsert(this._pools[comment.cindex], comment, function(a, b) {
                if (a.bottom < b.bottom) {
                    return -1;
                } else if (a.bottom > b.bottom) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
    };
    CommentSpaceAllocator.prototype.remove = function(comment) {
        if (comment.cindex < 0) {
            return;
        }
        if (comment.cindex >= this._pools.length) {
            throw new Error("cindex out of bounds");
        }
        var index = this._pools[comment.cindex].indexOf(comment);
        if (index < 0)
            return;
        this._pools[comment.cindex].splice(index, 1);
    };
    CommentSpaceAllocator.prototype.setBounds = function(width, height) {
        this._width = width;
        this._height = height;
    };
    return CommentSpaceAllocator;
}());
var AnchorCommentSpaceAllocator = ( function(_super) {
    __extends(AnchorCommentSpaceAllocator, _super);
    function AnchorCommentSpaceAllocator() {
        _super.apply(this, arguments);
    }
    AnchorCommentSpaceAllocator.prototype.add = function(comment) {
        _super.prototype.add.call(this, comment);
        comment.x = (this._width - comment.width) / 2;
    };
    AnchorCommentSpaceAllocator.prototype.willCollide = function(a, b) {
        return true;
    };
    AnchorCommentSpaceAllocator.prototype.pathCheck = function(y, comment, pool) {
        var bottom = y + comment.height;
        for (var i = 0; i < pool.length; i++) {
            if (pool[i].y > bottom || pool[i].bottom < y) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    };
    return AnchorCommentSpaceAllocator;
}(CommentSpaceAllocator));
//# sourceMappingURL=CommentSpaceAllocator.js.map
var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CoreComment = ( function() {
    function CoreComment(parent, init) {
        if (init === void 0) {
            init = {};
        }
        this.mode = 1;
        this.stime = 0;
        this.text = "";
        this.ttl = 4000;
        this.dur = 4000;
        this.cindex = -1;
        this.motion = [];
        this.movable = true;
        this._alphaMotion = null;
        this.absolute = true;
        this.align = 0;
        this._alpha = 1;
        this._size = 12;
        this._color = 0xffffff;
        this._border = false;
        this._shadow = true;
        this._font = "";
        if (!parent) {
            throw new Error("Comment not bound to comment manager.");
        } else {
            this.parent = parent;
        }
        if (init.hasOwnProperty("stime")) {
            this.stime = init["stime"];
        }
        if (init.hasOwnProperty("mode")) {
            this.mode = init["mode"];
        } else {
            this.mode = 1;
        }
        if (init.hasOwnProperty("dur")) {
            this.dur = init["dur"];
            this.ttl = this.dur;
        }
        this.dur *= this.parent.options.global.scale;
        this.ttl *= this.parent.options.global.scale;
        if (init.hasOwnProperty("text")) {
            this.text = init["text"];
        }
        if (init.hasOwnProperty("motion")) {
            this._motionStart = [];
            this._motionEnd = [];
            this.motion = init["motion"];
            var head = 0;
            for (var i = 0; i < init["motion"].length; i++) {
                this._motionStart.push(head);
                var maxDur = 0;
                for (var k in init["motion"][i]) {
                    var m = init["motion"][i][k];
                    maxDur = Math.max(m.dur, maxDur);
                    if (m.easing === null || m.easing === undefined) {
                        init["motion"][i][k]["easing"] = CoreComment.LINEAR;
                    }
                }
                head += maxDur;
                this._motionEnd.push(head);
            }
            this._curMotion = 0;
        }
        if (init.hasOwnProperty("color")) {
            this._color = init["color"];
        }
        if (init.hasOwnProperty("size")) {
            this._size = init["size"];
        }
        if (init.hasOwnProperty("border")) {
            this._border = init["border"];
        }
        if (init.hasOwnProperty("opacity")) {
            this._alpha = init["opacity"];
        }
        if (init.hasOwnProperty("alpha")) {
            this._alphaMotion = init["alpha"];
        }
        if (init.hasOwnProperty("font")) {
            this._font = init["font"];
        }
        if (init.hasOwnProperty("x")) {
            this._x = init["x"];
        }
        if (init.hasOwnProperty("y")) {
            this._y = init["y"];
        }
        if (init.hasOwnProperty("shadow")) {
            this._shadow = init["shadow"];
        }
        if (init.hasOwnProperty("position")) {
            if (init["position"] === "relative") {
                this.absolute = false;
                if (this.mode < 7) {
                    console.warn("Using relative position for CSA comment.");
                }
            }
        }
    }
    CoreComment.prototype.init = function(recycle) {
        if (recycle === void 0) {
            recycle = null;
        }
        if (recycle !== null) {
            this.dom = recycle.dom;
        } else {
            this.dom = document.createElement("div");
        }
        this.dom.className = this.parent.options.global.className;
        this.dom.appendChild(document.createTextNode(this.text));
        this.dom.textContent = this.text;
        this.dom.innerText = this.text;
        this.size = this._size;
        if (this._color != 0xffffff) {
            this.color = this._color;
        }
        this.shadow = this._shadow;
        if (this._border) {
            this.border = this._border;
        }
        if (this._font !== "") {
            this.font = this._font;
        }
        if (this._x !== undefined) {
            this.x = this._x;
        }
        if (this._y !== undefined) {
            this.y = this._y;
        }
        if (this._alpha !== 1 || this.parent.options.global.opacity < 1) {
            this.alpha = this._alpha;
        }
        if (this.motion.length > 0) {
            this.animate();
        }
    };
    Object.defineProperty(CoreComment.prototype, "x", {
        get: function() {
            if (this._x === null || this._x === undefined) {
                if (this.align % 2 === 0) {
                    this._x = this.dom.offsetLeft;
                } else {
                    this._x = this.parent.width - this.dom.offsetLeft - this.width;
                }
            }
            if (!this.absolute) {
                return this._x / this.parent.width;
            }
            return this._x;
        },
        set: function(x) {
            this._x = x;
            if (!this.absolute) {
                this._x *= this.parent.width;
            }
            if (this.align % 2 === 0) {
                this.dom.style.left = this._x + "px";
            } else {
                this.dom.style.right = this._x + "px";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "y", {
        get: function() {
            if (this._y === null || this._y === undefined) {
                if (this.align < 2) {
                    this._y = this.dom.offsetTop;
                } else {
                    this._y = this.parent.height - this.dom.offsetTop - this.height;
                }
            }
            if (!this.absolute) {
                return this._y / this.parent.height;
            }
            return this._y;
        },
        set: function(y) {
            this._y = y;
            if (!this.absolute) {
                this._y *= this.parent.height;
            }
            if (this.align < 2) {
                this.dom.style.top = this._y + "px";
            } else {
                this.dom.style.bottom = this._y + "px";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "bottom", {
        get: function() {
            return this.y + this.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "right", {
        get: function() {
            return this.x + this.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "width", {
        get: function() {
            if (this._width === null || this._width === undefined) {
                this._width = this.dom.offsetWidth;
            }
            return this._width;
        },
        set: function(w) {
            this._width = w;
            this.dom.style.width = this._width + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "height", {
        get: function() {
            if (this._height === null || this._height === undefined) {
                this._height = this.dom.offsetHeight;
            }
            return this._height;
        },
        set: function(h) {
            this._height = h;
            this.dom.style.height = this._height + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "size", {
        get: function() {
            return this._size;
        },
        set: function(s) {
            this._size = s;
            this.dom.style.fontSize = this._size + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "color", {
        get: function() {
            return this._color;
        },
        set: function(c) {
            this._color = c;
            var color = c.toString(16);
            color = color.length >= 6 ? color : new Array(6 - color.length + 1).join("0") + color;
            this.dom.style.color = "#" + color;
            if (this._color === 0) {
                this.dom.className = this.parent.options.global.className + " rshadow";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "alpha", {
        get: function() {
            return this._alpha;
        },
        set: function(a) {
            this._alpha = a;
            this.dom.style.opacity = Math.min(this._alpha, this.parent.options.global.opacity) + "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "border", {
        get: function() {
            return this._border;
        },
        set: function(b) {
            this._border = b;
            if (this._border) {
                this.dom.style.border = "1px solid #00ffff";
            } else {
                this.dom.style.border = "none";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "shadow", {
        get: function() {
            return this._shadow;
        },
        set: function(s) {
            this._shadow = s;
            if (!this._shadow) {
                this.dom.className = this.parent.options.global.className + " noshadow";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreComment.prototype, "font", {
        get: function() {
            return this._font;
        },
        set: function(f) {
            this._font = f;
            if (this._font.length > 0) {
                this.dom.style.fontFamily = this._font;
            } else {
                this.dom.style.fontFamily = "";
            }
        },
        enumerable: true,
        configurable: true
    });
    CoreComment.prototype.time = function(time) {
        this.ttl -= time;
        if (this.ttl < 0) {
            this.ttl = 0;
        }
        if (this.movable) {
            this.update();
        }
        if (this.ttl <= 0) {
            this.finish();
        }
    };
    CoreComment.prototype.update = function() {
        this.animate();
    };
    CoreComment.prototype.invalidate = function() {
        this._x = null;
        this._y = null;
        this._width = null;
        this._height = null;
    };
    CoreComment.prototype._execMotion = function(currentMotion, time) {
        for (var prop in currentMotion) {
            if (currentMotion.hasOwnProperty(prop)) {
                var m = currentMotion[prop];
                this[prop] = m.easing(Math.min(Math.max(time - m.delay, 0), m.dur), m.from, m.to - m.from, m.dur);
            }
        }
    };
    CoreComment.prototype.animate = function() {
        if (this._alphaMotion) {
            this.alpha = (this.dur - this.ttl) * (this._alphaMotion["to"] - this._alphaMotion["from"]) / this.dur + this._alphaMotion["from"];
        }
        if (this.motion.length === 0) {
            return;
        }
        var ttl = Math.max(this.ttl, 0);
        var time = (this.dur - ttl) - this._motionStart[this._curMotion];
        this._execMotion(this.motion[this._curMotion], time);
        if (this.dur - ttl > this._motionEnd[this._curMotion]) {
            this._curMotion++;
            if (this._curMotion >= this.motion.length) {
                this._curMotion = this.motion.length - 1;
            }
            return;
        }
    };
    CoreComment.prototype.finish = function() {
        this.parent.finish(this);
    };
    CoreComment.prototype.toString = function() {
        return ["[", this.stime, "|", this.ttl, "/", this.dur, "]", "(", this.mode, ")", this.text].join("");
    };
    CoreComment.LINEAR = function(t, b, c, d) {
        return t * c / d + b;
    };
    return CoreComment;
}());
var ScrollComment = ( function(_super) {
    __extends(ScrollComment, _super);
    function ScrollComment(parent, data) {
        _super.call(this, parent, data);
        this.dur *= this.parent.options.scroll.scale;
        this.ttl *= this.parent.options.scroll.scale;
    }
    Object.defineProperty(ScrollComment.prototype, "alpha", {
        set: function(a) {
            this._alpha = a;
            this.dom.style.opacity = Math.min(Math.min(this._alpha, this.parent.options.global.opacity), this.parent.options.scroll.opacity) + "";
        },
        enumerable: true,
        configurable: true
    });
    ScrollComment.prototype.init = function(recycle) {
        if (recycle === void 0) {
            recycle = null;
        }
        _super.prototype.init.call(this, recycle);
        this.x = this.parent.width;
        if (this.parent.options.scroll.opacity < 1) {
            this.alpha = this._alpha;
        }
        this.absolute = true;
    };
    ScrollComment.prototype.update = function() {
        this.x = (this.ttl / this.dur) * (this.parent.width + this.width) - this.width;
    };
    return ScrollComment;
}(CoreComment));
//# sourceMappingURL=Comment.js.map
/** 
 * Comment Filters Module Simplified (only supports modifiers & types)
 * @license MIT
 * @author Jim Chen
 */
function CommentFilter() {
    this.modifiers = [];
    this.runtime = null;
    this.allowTypes = {
        "1": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true,
        "8": true,
        "17": true
    };
    this.doModify = function(cmt) {
        for (var k = 0; k < this.modifiers.length; k++) {
            cmt = this.modifiers[k](cmt);
        }
        return cmt;
    };
    this.beforeSend = function(cmt) {
        return cmt;
    }
    this.doValidate = function(cmtData) {
        if (!this.allowTypes[cmtData.mode])
            return false;
        return true;
    };
    this.addRule = function(rule) {};
    this.addModifier = function(f) {
        this.modifiers.push(f);
    };
    this.runtimeFilter = function(cmt) {
        if (this.runtime == null)
            return cmt;
        return this.runtime(cmt);
    };
    this.setRuntimeFilter = function(f) {
        this.runtime = f;
    }
}

/*!
 * Comment Core Library CommentManager
 * @license MIT
 * @author Jim Chen
 *
 * Copyright (c) 2014 Jim Chen
 */
var CommentManager = (function() {
    var getRotMatrix = function(yrot, zrot) {
        // Courtesy of @StarBrilliant, re-adapted to look better
        var DEG2RAD = Math.PI / 180;
        var yr = yrot * DEG2RAD;
        var zr = zrot * DEG2RAD;
        var COS = Math.cos;
        var SIN = Math.sin;
        var matrix = [
            COS(yr) * COS(zr), COS(yr) * SIN(zr), SIN(yr), 0,
            (-SIN(zr)), COS(zr), 0, 0,
            (-SIN(yr) * COS(zr)) , (-SIN(yr) * SIN(zr)), COS(yr), 0,
            0, 0, 0, 1
        ];
        // CSS does not recognize scientific notation (e.g. 1e-6), truncating it.
        for (var i = 0; i < matrix.length; i++) {
            if (Math.abs(matrix[i]) < 0.000001) {
                matrix[i] = 0;
            }
        }
        return "matrix3d(" + matrix.join(",") + ")";
    };

    function CommentManager(stageObject) {
        var __timer = 0;

        this._listeners = {};
        this._lastPosition = 0;

        this.stage = stageObject;
        this.options = {
            global: {
                opacity: 1,
                scale: 1,
                className: "cmt"
            },
            scroll: {
                opacity: 1,
                scale: 1
            },
            limit: 0
        };
        this.timeline = [];
        this.runline = [];
        this.position = 0;
        this.limiter = 0;
        this.filter = null;
        this.csa = {
            scroll: new CommentSpaceAllocator(0, 0),
            top: new AnchorCommentSpaceAllocator(0, 0),
            bottom: new AnchorCommentSpaceAllocator(0, 0),
            reverse: new CommentSpaceAllocator(0, 0),
            scrollbtm: new CommentSpaceAllocator(0, 0)
        };

        /** Precompute the offset width **/
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
        this.startTimer = function() {
            if (__timer > 0)
                return;
            var lastTPos = new Date().getTime();
            var cmMgr = this;
            __timer = window.setInterval(function() {
                var elapsed = new Date().getTime() - lastTPos;
                lastTPos = new Date().getTime();
                cmMgr.onTimerEvent(elapsed, cmMgr);
            }, 10);
        };
        this.stopTimer = function() {
            window.clearInterval(__timer);
            __timer = 0;
        };
    }

    /** Public **/
    CommentManager.prototype.stop = function() {
        this.stopTimer();
    };

    CommentManager.prototype.start = function() {
        this.startTimer();
    };

    CommentManager.prototype.seek = function(time) {
        this.position = BinArray.bsearch(this.timeline, time, function(a, b) {
            if (a < b.stime) return -1
            else if (a > b.stime) return 1;
            else return 0;
        });
    };

    CommentManager.prototype.validate = function(cmt) {
        if (cmt == null)
            return false;
        return this.filter.doValidate(cmt);
    };

    CommentManager.prototype.load = function(a) {
        this.timeline = a;
        this.timeline.sort(function(a, b) {
            if (a.stime > b.stime) return 2;
            else if (a.stime < b.stime) return -2;
            else {
                if (a.date > b.date) return 1;
                else if (a.date < b.date) return -1;
                else if (a.dbid != null && b.dbid != null) {
                    if (a.dbid > b.dbid) return 1;
                    else if (a.dbid < b.dbid) return -1;
                    return 0;
                } else
                    return 0;
            }
        });
        this.dispatchEvent("load");
    };

    CommentManager.prototype.insert = function(c) {
        var index = BinArray.binsert(this.timeline, c, function(a, b) {
            if (a.stime > b.stime) return 2;
            else if (a.stime < b.stime) return -2;
            else {
                if (a.date > b.date) return 1;
                else if (a.date < b.date) return -1;
                else if (a.dbid != null && b.dbid != null) {
                    if (a.dbid > b.dbid) return 1;
                    else if (a.dbid < b.dbid) return -1;
                    return 0;
                } else
                    return 0;
            }
        });
        if (index <= this.position) {
            this.position++;
        }
        this.dispatchEvent("insert");
    };

    CommentManager.prototype.clear = function() {
        while (this.runline.length > 0) {
            this.runline[0].finish();
        }
        this.dispatchEvent("clear");
    };

    CommentManager.prototype.setBounds = function() {
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
        this.dispatchEvent("resize");
        for (var comAlloc in this.csa) {
            this.csa[comAlloc].setBounds(this.width, this.height);
        }
        // Update 3d perspective
        this.stage.style.perspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
        this.stage.style.webkitPerspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
    };
    CommentManager.prototype.init = function() {
        this.setBounds();
        if (this.filter == null) {
            this.filter = new CommentFilter(); //Only create a filter if none exist
        }
    };
    CommentManager.prototype.time = function(time) {
        time = time - 1;
        if (this.position >= this.timeline.length || Math.abs(this._lastPosition - time) >= 2000) {
            this.seek(time);
            this._lastPosition = time;
            if (this.timeline.length <= this.position) {
                return;
            }
        } else {
            this._lastPosition = time;
        }
        for (; this.position < this.timeline.length; this.position++) {
            if (this.timeline[this.position]['stime'] <= time) {
                if (this.options.limit > 0 && this.runline.length > this.limiter) {
                    continue; // Skip comments but still move the position pointer
                } else if (this.validate(this.timeline[this.position])) {
                    this.send(this.timeline[this.position]);
                }
            } else {
                break;
            }
        }
    };
    CommentManager.prototype.rescale = function() {};
    CommentManager.prototype.send = function(data) {
        if (data.mode === 8) {
            console.log(data);
            if (this.scripting) {
                console.log(this.scripting.eval(data.code));
            }
            return;
        }
        if (this.filter != null) {
            data = this.filter.doModify(data);
            if (data == null) return;
        }
        if (data.mode === 1 || data.mode === 2 || data.mode === 6) {
            var cmt = new ScrollComment(this, data);
        } else {
            var cmt = new CoreComment(this, data);
        }
        switch (cmt.mode) {
        case 1:
            cmt.align = 0;
            break;
        case 2:
            cmt.align = 2;
            break;
        case 4:
            cmt.align = 2;
            break;
        case 5:
            cmt.align = 0;
            break;
        case 6:
            cmt.align = 1;
            break;
        }
        cmt.init();
        this.stage.appendChild(cmt.dom);
        switch (cmt.mode) {
        default:
        case 1: {
            this.csa.scroll.add(cmt);
        }
        break;
        case 2: {
            this.csa.scrollbtm.add(cmt);
        }
        break;
        case 4: {
            this.csa.bottom.add(cmt);
        }
        break;
        case 5: {
            this.csa.top.add(cmt);
        }
        break;
        case 6: {
            this.csa.reverse.add(cmt);
        }
        break;
        case 17:
        case 7: {
            if (data.rY !== 0 || data.rZ !== 0) {
                /** TODO: revise when browser manufacturers make up their mind on Transform APIs **/
                cmt.dom.style.transform = getRotMatrix(data.rY, data.rZ);
                cmt.dom.style.webkitTransform = getRotMatrix(data.rY, data.rZ);
                cmt.dom.style.OTransform = getRotMatrix(data.rY, data.rZ);
                cmt.dom.style.MozTransform = getRotMatrix(data.rY, data.rZ);
                cmt.dom.style.MSTransform = getRotMatrix(data.rY, data.rZ);
            }
        }
        break;
        }
        cmt.y = cmt.y;
        this.dispatchEvent("enterComment", cmt);
        this.runline.push(cmt);
    };
    CommentManager.prototype.sendComment = function(data) {
        console.log("CommentManager.sendComment is deprecated. Please use send instead");
        this.send(data); // Wrapper for Backwards Compatible APIs
    };
    CommentManager.prototype.finish = function(cmt) {
        this.dispatchEvent("exitComment", cmt);
        this.stage.removeChild(cmt.dom);
        var index = this.runline.indexOf(cmt);
        if (index >= 0) {
            this.runline.splice(index, 1);
        }
        switch (cmt.mode) {
        default:
        case 1: {
            this.csa.scroll.remove(cmt);
        }
        break;
        case 2: {
            this.csa.scrollbtm.remove(cmt);
        }
        break;
        case 4: {
            this.csa.bottom.remove(cmt);
        }
        break;
        case 5: {
            this.csa.top.remove(cmt);
        }
        break;
        case 6: {
            this.csa.reverse.remove(cmt);
        }
        break;
        case 7:
            break;
        }
    };
    CommentManager.prototype.addEventListener = function(event, listener) {
        if (typeof this._listeners[event] !== "undefined") {
            this._listeners[event].push(listener);
        } else {
            this._listeners[event] = [listener];
        }
    };
    CommentManager.prototype.dispatchEvent = function(event, data) {
        if (typeof this._listeners[event] !== "undefined") {
            for (var i = 0; i < this._listeners[event].length; i++) {
                try {
                    this._listeners[event][i](data);
                } catch ( e ) {
                    console.err(e.stack);
                }
            }
        }
    };
    /** Static Functions **/
    CommentManager.prototype.onTimerEvent = function(timePassed, cmObj) {
        for (var i = 0; i < cmObj.runline.length; i++) {
            var cmt = cmObj.runline[i];
            if (cmt.hold) {
                continue;
            }
            cmt.time(timePassed);
        }
    };
    return CommentManager;
})();

/** 
 * AcFun Format Parser
 * @license MIT License
 * An alternative format comment parser
 */
function AcfunParser(jsond) {
    var list = [];
    try {
        var jsondt = JSON.parse(jsond);
    } catch ( e ) {
        console.log('Error: Could not parse json list!');
        return [];
    }
    for (var i = 0; i < jsondt.length; i++) {
        //Read each comment and generate a correct comment object
        var data = {};
        var xc = jsondt[i]['c'].split(',');
        if (xc.length > 0) {
            data.stime = parseFloat(xc[0]) * 1000;
            data.color = parseInt(xc[1])
            data.mode = parseInt(xc[2]);
            data.size = parseInt(xc[3]);
            data.hash = xc[4];
            data.date = parseInt(xc[5]);
            data.position = "absolute";
            if (data.mode != 7) {
                data.text = jsondt[i].m.replace(/(\/n|\\n|\n|\r\n|\\r)/g, "\n");
                data.text = data.text.replace(/\r/g, "\n");
                data.text = data.text.replace(/\s/g, "\u00a0");
            } else {
                data.text = jsondt[i].m;
            }
            if (data.mode == 7) {
                //High level positioned dm
                try {
                    var x = JSON.parse(data.text);
                } catch ( e ) {
                    console.log('[Err] Error parsing internal data for comment');
                    console.log('[Dbg] ' + data.text);
                    continue;
                }
                data.position = "relative";
                data.text = x.n; /*.replace(/\r/g,"\n");*/
                data.text = data.text.replace(/\ /g, "\u00a0");
                if (x.a != null) {
                    data.opacity = x.a;
                } else {
                    data.opacity = 1;
                }
                if (x.p != null) {
                    data.x = x.p.x / 1000; // relative position
                    data.y = x.p.y / 1000;
                } else {
                    data.x = 0;
                    data.y = 0;
                }
                data.shadow = x.b;
                data.dur = 4000;
                if (x.l != null)
                    data.moveDelay = x.l * 1000;
                if (x.z != null && x.z.length > 0) {
                    data.movable = true;
                    data.motion = [];
                    var moveDuration = 0;
                    var last = {
                        x: data.x,
                        y: data.y,
                        alpha: data.opacity,
                        color: data.color
                    };
                    for (var m = 0; m < x.z.length; m++) {
                        var dur = x.z[m].l != null ? (x.z[m].l * 1000) : 500;
                        moveDuration += dur;
                        var motion = {
                            x: {
                                from: last.x,
                                to: x.z[m].x / 1000,
                                dur: dur,
                                delay: 0
                            },
                            y: {
                                from: last.y,
                                to: x.z[m].y / 1000,
                                dur: dur,
                                delay: 0
                            }
                        };
                        last.x = motion.x.to;
                        last.y = motion.y.to;
                        if (x.z[m].t !== last.alpha) {
                            motion.alpha = {
                                from: last.alpha,
                                to: x.z[m].t,
                                dur: dur,
                                delay: 0
                            };
                            last.alpha = motion.alpha.to;
                        }
                        if (x.z[m].c != null && x.z[m].c !== last.color) {
                            motion.color = {
                                from: last.color,
                                to: x.z[m].c,
                                dur: dur,
                                delay: 0
                            };
                            last.color = motion.color.to;
                        }
                        data.motion.push(motion);
                    }
                    data.dur = moveDuration + (data.moveDelay ? data.moveDelay : 0);
                }
                if (x.r != null && x.k != null) {
                    data.rX = x.r;
                    data.rY = x.k;
                }

            }
            list.push(data);
        }
    }
    return list;
}

/** 
 * Bilibili Format Parser
 * @license MIT License
 * Takes in an XMLDoc/LooseXMLDoc and parses that into a Generic Comment List
 **/
function BilibiliParser(xmlDoc, text, warn) {
    function format(string) {
        // Format the comment text to be JSON Valid.
        return string.replace(/\t/, "\\t");
    }

    if (xmlDoc !== null) {
        var elems = xmlDoc.getElementsByTagName('d');
    } else {
        if (!document || !document.createElement) {
            // Maybe we are in a restricted context? Bail.
            return [];
        }
        if (warn) {
            if (!confirm("XML Parse Error. \n Allow tag soup parsing?\n[WARNING: This is unsafe.]")) {
                return [];
            }
        } else {
            // TODO: Make this safer in the future
            text = text.replace(new RegExp("</([^d])", "g"), "</disabled $1");
            text = text.replace(new RegExp("</(\S{2,})", "g"), "</disabled $1");
            text = text.replace(new RegExp("<([^d/]\W*?)", "g"), "<disabled $1");
            text = text.replace(new RegExp("<([^/ ]{2,}\W*?)", "g"), "<disabled $1");
        }
        var tmp = document.createElement("div");
        tmp.innerHTML = text;
        var elems = tmp.getElementsByTagName('d');
    }

    var tlist = [];
    for (var i = 0; i < elems.length; i++) {
        if (elems[i].getAttribute('p') != null) {
            var opt = elems[i].getAttribute('p').split(',');
            if (!elems[i].childNodes[0])
                continue;
            var text = elems[i].childNodes[0].nodeValue;
            var obj = {};
            obj.stime = Math.round(parseFloat(opt[0]) * 1000);
            obj.size = parseInt(opt[2]);
            obj.color = parseInt(opt[3]);
            obj.mode = parseInt(opt[1]);
            obj.date = parseInt(opt[4]);
            obj.pool = parseInt(opt[5]);
            obj.position = "absolute";
            if (opt[7] != null)
                obj.dbid = parseInt(opt[7]);
            obj.hash = opt[6];
            obj.border = false;
            if (obj.mode < 7) {
                obj.text = text.replace(/(\/n|\\n|\n|\r\n)/g, "\n");
            } else {
                if (obj.mode == 7) {
                    try {
                        adv = JSON.parse(format(text));
                        obj.shadow = true;
                        obj.x = parseFloat(adv[0]);
                        obj.y = parseFloat(adv[1]);
                        if (Math.floor(obj.x) < obj.x || Math.floor(obj.y) < obj.y) {
                            obj.position = "relative";
                        }
                        obj.text = adv[4].replace(/(\/n|\\n|\n|\r\n)/g, "\n");
                        obj.rZ = 0;
                        obj.rY = 0;
                        if (adv.length >= 7) {
                            obj.rZ = parseInt(adv[5], 10);
                            obj.rY = parseInt(adv[6], 10);
                        }
                        obj.motion = [];
                        obj.movable = false;
                        if (adv.length >= 11) {
                            obj.movable = true;
                            var singleStepDur = 500;
                            var motion = {
                                x: {
                                    from: obj.x,
                                    to: parseFloat(adv[7]),
                                    dur: singleStepDur,
                                    delay: 0
                                },
                                y: {
                                    from: obj.y,
                                    to: parseFloat(adv[8]),
                                    dur: singleStepDur,
                                    delay: 0
                                },
                            };
                            if (adv[9] !== '') {
                                singleStepDur = parseInt(adv[9], 10);
                                motion.x.dur = singleStepDur;
                                motion.y.dur = singleStepDur;
                            }
                            if (adv[10] !== '') {
                                motion.x.delay = parseInt(adv[10], 10);
                                motion.y.delay = parseInt(adv[10], 10);
                            }
                            if (adv.length > 11) {
                                obj.shadow = adv[11];
                                if (obj.shadow === "true") {
                                    obj.shadow = true;
                                }
                                if (obj.shadow === "false") {
                                    obj.shadow = false;
                                }
                                if (adv[12] != null) {
                                    obj.font = adv[12];
                                }
                                if (adv.length > 14) {
                                    // Support for Bilibili Advanced Paths
                                    if (obj.position === "relative") {
                                        console.log("Cannot mix relative and absolute positioning");
                                        obj.position = "absolute";
                                    }
                                    var path = adv[14];
                                    var lastPoint = {
                                        x: motion.x.from,
                                        y: motion.y.from
                                    };
                                    var pathMotion = [];
                                    var regex = new RegExp("([a-zA-Z])\\s*(\\d+)[, ](\\d+)", "g");
                                    var counts = path.split(/[a-zA-Z]/).length - 1;
                                    var m = regex.exec(path);
                                    while (m !== null) {
                                        switch (m[1]) {
                                        case "M": {
                                            lastPoint.x = parseInt(m[2], 10);
                                            lastPoint.y = parseInt(m[3], 10);
                                        }
                                        break;
                                        case "L": {
                                            pathMotion.push({
                                                "x": {
                                                    "from": lastPoint.x,
                                                    "to": parseInt(m[2], 10),
                                                    "dur": singleStepDur / counts,
                                                    "delay": 0
                                                },
                                                "y": {
                                                    "from": lastPoint.y,
                                                    "to": parseInt(m[3], 10),
                                                    "dur": singleStepDur / counts,
                                                    "delay": 0
                                                }
                                            });
                                            lastPoint.x = parseInt(m[2], 10);
                                            lastPoint.y = parseInt(m[3], 10);
                                        }
                                        break;
                                        }
                                        m = regex.exec(path);
                                    }
                                    motion = null;
                                    obj.motion = pathMotion;
                                }
                            }
                            if (motion !== null) {
                                obj.motion.push(motion);
                            }
                        }
                        obj.dur = 2500;
                        if (adv[3] < 12) {
                            obj.dur = adv[3] * 1000;
                        }
                        var tmp = adv[2].split('-');
                        if (tmp != null && tmp.length > 1) {
                            var alphaFrom = parseFloat(tmp[0]);
                            var alphaTo = parseFloat(tmp[1]);
                            obj.opacity = alphaFrom;
                            if (alphaFrom !== alphaTo) {
                                obj.alpha = {
                                    from: alphaFrom,
                                    to: alphaTo
                                }
                            }
                        }
                    } catch ( e ) {
                        console.log('[Err] Error occurred in JSON parsing');
                        console.log('[Dbg] ' + text);
                    }
                } else if (obj.mode == 8) {
                    obj.code = text; //Code comments are special
                }
            }
            if (obj.text != null)
                obj.text = obj.text.replace(/\u25a0/g, "\u2588");
            tlist.push(obj);
        }
    }
    return tlist;
}

// console.log(require("./CommentCoreLibrary.js"))
var CommentLoader = (function() {

    var Loader = function Loader(commentManager) {
        this._commentManager = commentManager;
        this._parser = function() {
            throw new Error('Format parser undefined.');
        };
        this._type = 'XML';
        this._data = null;
    };

    Loader.prototype.setParser = function(parser) {
        if (typeof parser !== 'function') {
            throw new Error('Parser expected to be a function.');
        }
        this._parser = parser;
        return this;
    };

    Loader.prototype.setType = function(type) {
        if (type === 'XML' || type === 'JSON' || type === 'RAW') {
            this._type = type;
        } else {
            throw new Error('Unrecognized type : ' + type);
        }
        return this;
    };

    Loader.prototype.download = function(method, url) {
        return new Promise((function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = (function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status !== 200) {
                        reject();
                    } else {
                        if (this._type === 'XML') {
                            this._data = this._parser(xhr.responseXML);
                        } else if (this._type === 'JSON') {
                            this._data = this._parser(JSON.parse(xhr.responseText));
                        } else {
                            this._data = this._parser(xhr.responseText);
                        }
                        resolve(this._data);
                    }
                }
            }).bind(this);
            xhr.open(method, url, true);
            xhr.send();
        }).bind(this));
    };

    Loader.prototype.load = function(method, url) {
        return this.download(method, url).then((function(data) {
            this._commentManager.load(data);
        }).bind(this));
    };

    return Loader;
})();
if (!IMGplayer) return;
var _ = function(type, props, children, callback) {
    var elem = null;
    if (type === 'text') {
        return document.createTextNode(props);
    } else {
        elem = document.createElement(type);
    }
    for (var n in props) {
        if (n !== 'style' && n !== 'className') {
            elem.setAttribute(n, props[n]);
        } else if (n === 'className') {
            elem.className = props[n];
        } else {
            for (var x in props.style) {
                elem.style[x] = props.style[x];
            }
        }
    }
    if (children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i] != null)
                elem.appendChild(children[i]);
        }
    }
    if (callback && typeof callback === 'function') {
        callback(elem);
    }
    return elem;
};
var addClass = function(elem, className) {
    if (elem == null) return;
    var oldClass = elem.className.split(' ');
    if (oldClass.indexOf(className) < 0) {
        oldClass.push(className);
    }
    elem.className = oldClass.join(' ');
};
var hasClass = function(elem, className) {
    if (elem == null) return false;
    var oldClass = elem.className.split(' ');
    return oldClass.indexOf(className) >= 0;
}
var removeClass = function(elem, className) {
    if (elem == null) return;
    var oldClass = elem.className.split(' ');
    if (oldClass.indexOf(className) >= 0) {
        oldClass.splice(oldClass.indexOf(className), 1);
    }
    elem.className = oldClass.join(' ');
};
var buildFromDefaults = function(n, d) {
    var r = {};
    for (var i in d) {
        if (n && typeof n[i] !== 'undefined')
            r[i] = n[i];
        else
            r[i] = d[i];
    }
    return r;
}
var transTime = function(time) {
    var durationtime = time;
    var second = 1;
    var minute = 60 * second;
    var hours = 60 * minute;
    var echohours = parseInt(durationtime / hours);
    if (echohours >= 1) {
        durationtime -= echohours * hours;
    }
    var echominute = parseInt(durationtime / minute);
    if (echominute >= 1) {
        durationtime -= echominute * minute;
    }
    var echosecond = parseInt(durationtime / second);
    return echohours + ':' + echominute + ':' + echosecond;
}

function launchFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}
function updateTimeFunc(sound) {
    var abptime;
    abptime = document.getElementsByClassName('ABP-Playtime')[0];
    var pbars = document.getElementsByClassName('bar dark');
    IMGplayer.barTime = pbars[0];
    var audio = document.getElementById('IMGplayerAudio')
    var barloaded = document.getElementsByClassName('barloaded')[0]
    var seek = sound.seek() || 0;
    IMGplayer.updateImg(seek, IMGplayer.imgsSource)
    barloaded.style.width = (((seek / sound.duration()) * 100) || 0) + '%';
    abptime.innerHTML = '<span id="nowPlayTime" realtime="' + seek + '">' + transTime(Math.round(seek)) + '</span><span class="total">/' + transTime(Math.round(sound.duration())) + '</span>';
    if (IMGplayer.CM.display !== false) {
        IMGplayer.CM.time(seek * 1000);
    }
    if (!IMGplayer.state.dragging) {
        IMGplayer.barTime.style.width = (((seek / sound.duration()) * 100) || 0) + '%';
    }
    if (sound.playing()) {
        IMGplayer.requestId = requestAnimationFrame(updateTimeFunc.bind(this, sound));
    }
}
IMGplayer = {
    audio: '',
    CM: '',
    Player: document.getElementById('IMGplayer'),
    container: document.getElementById('IMGplayerContainer'),
    imgsContainer: document.getElementById('imgsContainer'),
    state: buildFromDefaults({}, {
        fullscreen: false,
        commentVisible: true,
        allowRescale: false,
        playing: false,
        dragging: false,
    }),
    playerControl: '',
    barTime: '',
    timeline: '',
    cmplayBtn: '',
    imgsSource: '',
    requestId: "",
    onPlay: function() {
        // console.log(1)
    },
    offLoad: function() {
        cancelAnimationFrame(IMGplayer.requestId)
        IMGplayer.requestId = undefined
        IMGplayer.Player.removeEventListener("click", function() {
            console.log("close")
        })
    },
    init: function(imgsSource, audioSource, danmakuSource, callback) {
        try {
            var danmakulist = (danmakuSource) ? danmakuSource : '';
            IMGplayer.initImgs(imgsSource, danmakulist, function() {
                IMGplayer.initDm(IMGplayer.CM, danmakuSource)
                IMGplayer.initAudio(audioSource, callback)
                IMGplayer.bindControl()
            });
            IMGplayer.imgsSource = imgsSource;
        } catch ( e ) {
            console.log(e)
        }
    },
    initAudio: function(audioSource, callback) {
        var sound = new Howl({
            src: [audioSource],
            onplay: function() {
                IMGplayer.state.playing = true;
                IMGplayer.onPlay()
                IMGplayer.requestId = requestAnimationFrame(updateTimeFunc.bind(this, sound));
            },
            onload: function() {
                var abptime;
                abptime = document.getElementsByClassName('ABP-Playtime')[0];
                abptime.innerHTML = '<span>' + transTime(Math.round(0)) + '</span><span class="total">/' + transTime(Math.round(sound.duration())) + '</span>';
            },
            onend: function() {
                IMGplayer.restoreImgs(IMGplayer.imgsSource.length - 1);
                removeClass(IMGplayer.playerControl, 'hide');
                IMGplayer.state.playing = false;
                IMGplayer.barTime.style.width = '0%';
                IMGplayer.cmplayBtn.className = 'button ABP-Play'
                IMGplayer.CM.clear();
                IMGplayer.CM.time(0);
            },
            onpause: function() {
                removeClass(IMGplayer.playerControl, 'hide');
                IMGplayer.state.playing = false;
            },
        });
        try {
            IMGplayer.audio = sound
            callback()
        } catch ( e ) {
            alert(e)
        }
    },
    bindControl: function(argument) {
        // 弹幕开关
        var cmbtn = document.getElementsByClassName('ABP-CommentShow');
        if (cmbtn.length > 0) {
            var btnDm = cmbtn[0];
            btnDm.addEventListener('click', function(argument) {
                if (IMGplayer.CM.display == false) {
                    IMGplayer.CM.display = true;
                    IMGplayer.CM.start();
                    this.className = 'button ABP-CommentShow';
                } else {
                    IMGplayer.CM.display = false;
                    IMGplayer.CM.clear();
                    IMGplayer.CM.stop();
                    this.className = 'button ABP-CommentShow ABP-noDM';
                }
            })
        }
        // 控制台显示状态
        var tempControl = document.getElementsByClassName('ABP-Control');
        if (tempControl.length > 0) {
            var playerControl = tempControl[0];
            IMGplayer.playerControl = playerControl;
        }
        // 播放按钮
        var playbtn = document.getElementsByClassName('ABP-Play');
        if (playbtn.length > 0) {
            var cmplayBtn = playbtn[0]
            IMGplayer.cmplayBtn = cmplayBtn
            cmplayBtn.addEventListener('click', function(argument) {
                if (!IMGplayer.audio.playing()) {
                    try {
                        IMGplayer.audio.play();
                    } catch ( e ) {
                        console.log(e)
                    }
                    this.className = 'button ABP-Play ABP-Pause';
                } else {
                    IMGplayer.audio.pause();
                    this.className = 'button ABP-Play';
                }
            })
        }
        // 自动隐藏控制台
        var timer;
        document.getElementById('IMGplayerContainer').addEventListener('click', function(argument) {
            clearTimeout(timer)
            timer = setTimeout(function(argument) {
                if (IMGplayer.state.playing) {
                    addClass(playerControl, 'hide');
                }
            }, 3000)
            if (hasClass(argument.target, 'ABP-Play') || hasClass(argument.target, 'ccl-progress-bar') || hasClass(argument.target, 'ABP-Playtime') || hasClass(argument.target, 'ABP-FullScreen') || hasClass(argument.target, 'ABP-CommentShow')) {
                return
            }
            if (hasClass(playerControl, 'hide')) {
                removeClass(playerControl, 'hide');
            } else {
                addClass(playerControl, 'hide');
            }
        })
        // 全屏按键
        var btnFull = document.getElementsByClassName('ABP-FullScreen');
        if (btnFull.length > 0) {
            var cmbtnFull = btnFull[0]
            cmbtnFull.addEventListener('click', function() {
                IMGplayer.state.fullscreen = hasClass(IMGplayer.Player, 'ABP-FullScreen');
                if (!IMGplayer.state.fullscreen) {
                    launchFullscreen(IMGplayer.Player);
                    addClass(IMGplayer.Player, 'ABP-FullScreen');
                } else {
                    removeClass(IMGplayer.Player, 'ABP-FullScreen');
                    exitFullscreen();
                }
                IMGplayer.state.fullscreen = !IMGplayer.state.fullscreen;
                if (IMGplayer.CM)
                    IMGplayer.CM.setBounds();
                if (!IMGplayer.state.allowRescale) return;
                if (IMGplayer.state.fullscreen) {
                    if (IMGplayer.defaults.w > 0) {
                        IMGplayer.CM.def.scrollScale = IMGplayer.Player.offsetWidth / IMGplayer.defaults.w;
                    }
                } else {
                    IMGplayer.CM.def.scrollScale = 1;
                }
            });
        }
        // 控制播放进度
        var templine = document.getElementsByClassName('ccl-progress-bar')
        if (templine.length > 0) {
            IMGplayer.timeline = templine[0];

            IMGplayer.timeline.addEventListener('mousedown', function(e) {
                IMGplayer.state.dragging = true;
            });
            document.addEventListener('mouseup', function(e) {
                IMGplayer.state.dragging = false;
            });
            IMGplayer.timeline.addEventListener('mouseup', function(e) {
                IMGplayer.state.dragging = false;
                var newTime = ((e.layerX) / this.offsetWidth) * IMGplayer.audio.duration();
                if (Math.abs(newTime - IMGplayer.audio.seek()) > 4) {
                    if (IMGplayer.CM)
                        IMGplayer.CM.clear();
                }
                IMGplayer.CM.clear();
                IMGplayer.audio.seek(newTime)
            });
            IMGplayer.timeline.addEventListener('mousemove', function(e) {
                if (IMGplayer.state.dragging) {
                    IMGplayer.barTime.style.width = ((e.layerX) * 100 / this.offsetWidth) + '%';
                }
            });



            var temppercent
            IMGplayer.timeline.addEventListener('touchmove', function(e) {
                IMGplayer.state.dragging = true;
                var tempx = e.touches[0].clientX - this.offsetLeft
                temppercent = ((tempx) * 100 / this.offsetWidth)
                if (temppercent > 100)
                    temppercent = 100
                if (temppercent < 0)
                    temppercent = 0;
                IMGplayer.barTime.style.width = temppercent + '%';
                event.preventDefault();
            });
            var _touch = null;
            IMGplayer.timeline.addEventListener('touchstart', function(e) {
                if (e.targetTouches.length > 0) {
                    //Determine whether we want to start or stop
                    _touch = e.targetTouches[0];
                }
            });
            IMGplayer.timeline.addEventListener('touchend', function(e) {
                if (IMGplayer.state.dragging) {
                    var newTime = temppercent / 100 * IMGplayer.audio.duration();
                    if (newTime > IMGplayer.audio.duration()) {
                        newTime = IMGplayer.audio.duration()
                    }
                    if (newTime < 0) {
                        newTime = 0
                    }
                    IMGplayer.CM.clear();
                    IMGplayer.audio.seek(newTime);
                }
                IMGplayer.state.dragging = false;
                IMGplayer.CM.clear();
                if (e.changedTouches.length > 0) {
                    if (_touch != null) {
                        var diffx = e.changedTouches[0].pageX - _touch.pageX;
                        var diffy = e.changedTouches[0].pageY - _touch.pageY;
                        if (Math.abs(diffx) < 20 && Math.abs(diffy) < 20) {
                            _touch = null;
                            return;
                        }
                        if (Math.abs(diffx) > 3 * Math.abs(diffy)) {
                            if (diffx > 0) {
                                return
                                if (IMGplayer.audio.paused) {
                                    IMGplayer.btnPlay.click();
                                }
                            } else {
                                return
                                if (!IMGplayer.audio.paused) {
                                    IMGplayer.btnPlay.click();
                                }
                            }
                        } else if (Math.abs(diffy) > 3 * Math.abs(diffx)) {

                        }
                        _touch = null;
                    }
                }
            });
        }
        removeClass(IMGplayer.playerControl, 'hide')
    },
    initImgs: function(imgsSource, danmakuSource, callback) {
        var html = '';
        var images = [];
        for (var i = 0; i < imgsSource.length; i++) {
            images.push('' + imgsSource[i].url + '');
            html += '<div class="frame" id="IMGplayerImgid' + i + '" style="background-image:url(' + imgsSource[i].url + ')"></div>';
        }
        document.getElementById('imgsContainer').innerHTML = html
        // IMGplayer.imgsContainer.innerHTML = html
        document.getElementById('IMGplayer').appendChild(_('div', {
            'className': 'ABP-Control hide'
        }, [
            _('div', {
                'className': 'ABP-Playtime'
            }),
            _('div', {
                'className': 'ABP-Play'
            }),
            _('div', {
                'className': 'ccl-progress-bar'
            }, [
                _('div', {
                    'className': 'bar dark'
                }),
                _('div', {
                    'className': 'bar barloaded'
                })
            ]),
            _('div', {
                'className': 'button ABP-CommentShow'
            }),
            _('div', {
                'className': 'button ABP-FullScreen'
            })
        ]));
        // 初始化时间
        // console.log(document)
        // console.log(document.getElementsByClassName('ABP-Playtime')[0])
        var abptime = document.getElementsByClassName('ABP-Playtime')[0];
        abptime.innerHTML = '<span>0:0:0</span><span class="total">/0:0:0</span>';
        IMGplayer.checkImgsValid(images, function(argument) {
            callback();
        })
    },
    initDm: function(CM, danmakuSource) {
        CM = new CommentManager(document.getElementById('IMGplayerContainer'));
        CM.init(); // 初始化
        // 载入弹幕列表
        var loader = (new CommentLoader(CM)).setParser(BilibiliParser);
        loader.load('GET', danmakuSource);
        // 启动播放弹幕（在未启动状态下弹幕不会移动）
        CM.start();
        // 停止播放（停止弹幕移动）
        // CM.stop();
        IMGplayer.CM = CM;
    },
    restoreImgs: function(final) {
        document.getElementsByClassName('frame')[final].style.display = 'none';
        document.getElementById('IMGplayerImgid0').style.display = 'block';
    },
    checkImgsValid: function(imgUrls, callback) {
        // 加载图片数组，加载完成执行回调
        var templen = 0;
        var len = imgUrls.length;
        for (var i = 0; i < len; i++) {
            (function loadimg(url) {
                var img = new Image();
                img.src = url;
                img.onload = function() {
                    if (this.complete) {
                        templen++;
                        if (templen >= len) {
                            callback();
                        }
                    }
                }
            })(imgUrls[i])
        }
    },
    updateImg: function(currentTime, imgsSource) {
        // 假设所有图片都已经加载完
        var tempshow = 0;
        var hasperfet = false;
        try {
            for (var i = 0; i < imgsSource.length; i++) {
                document.getElementById('IMGplayerImgid' + i + '').style.display = 'none';
                if (!hasperfet) {
                    if (imgsSource[i].timer >= currentTime) {
                        try {
                            if (i >= 1 && imgsSource[i - 1].timer < currentTime) {
                                tempshow = i - 1;
                                hasperfet = true;
                            } else {
                                tempshow = i;
                                hasperfet = true;
                            }
                        } catch ( e ) {
                            console.log(e);
                        }
                    } else {
                        hasperfet = false;
                        tempshow = imgsSource.length - 1;
                    }
                }
            }
            document.querySelector('#IMGplayerImgid' + tempshow + '').style.display = 'block';
        } catch ( e ) {
            console.info(e)
        }
    },
}
})()
export default IMGplayer;