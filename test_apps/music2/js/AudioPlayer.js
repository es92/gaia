var AudioPlayer = function(){
  this.audioPlayer = document.getElementById('audioPlayer');

  Utils.setupPassEvent(this, 'isPlaying');
  Utils.setupPassEvent(this, 'isEnded');
  Utils.setupPassEvent(this, 'isPaused');
  Utils.setupPassEvent(this, 'setCurrentTime');
  Utils.setupPassEvent(this, 'setTotalTime');

  this.audioPlayer.addEventListener('play', this.playEvent.bind(this));
  this.audioPlayer.addEventListener('pause', this.pauseEvent.bind(this));
  this.audioPlayer.addEventListener('timeupdate', this.timeupdateEvent.bind(this));
  this.audioPlayer.addEventListener('ended', this.endedEvent.bind(this));
}

AudioPlayer.prototype = {
  play: function(source){
    if (source !== undefined)
      source.play(this.audioPlayer);
  },
  stop: function(source){
    if (source !== undefined)
      source.stop(this.audioPlayer);
  },
  pause: function(source){
    if (source !== undefined)
      source.pause(this.audioPlayer);
  },

  playEvent: function(){
    this.isPlaying();
  },
  pauseEvent: function(){
    this.isPaused();
  },
  timeupdateEvent: function(){
    this.setTotalTime(Math.round(this.audioPlayer.duration));
    this.setCurrentTime(Math.round(this.audioPlayer.currentTime));
  },
  endedEvent: function(){
    this.isEnded();
  },
}
