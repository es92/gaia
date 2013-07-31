var AudioPlayer = function(){
  this.audioPlayer = document.getElementById('audioPlayer');

  Utils.setupPassParent(this, 'isPlaying');
  Utils.setupPassParent(this, 'isStopped');
  Utils.setupPassParent(this, 'isEnded');
  Utils.setupPassParent(this, 'isPaused');

  this.audioPlayer.addEventListener('play', this.isPlaying);
  this.audioPlayer.addEventListener('pause', this.isPaused);
  this.audioPlayer.addEventListener('timeupdate', this.timeupdateEvent.bind(this));
  this.audioPlayer.addEventListener('ended', this.isEnded);
}

AudioPlayer.prototype = {
  name: "AudioPlayer",
  play: function(source){
    if (source !== undefined){
      source.play(this.audioPlayer);
    }
  },
  stop: function(source){
    if (source !== undefined){
      source.stop(this.audioPlayer);
      this.isStopped();
    }
  },
  pause: function(source){
    if (source !== undefined)
      source.pause(this.audioPlayer);
  },
  setTime: function(time){
    if (this.audioPlayer.src)
      this.audioPlayer.currentTime = time;
  },
  timeupdateEvent: function(){
    window.ui.setCurrentTime(Math.round(this.audioPlayer.currentTime));
    window.ui.setTotalTime(Math.round(this.audioPlayer.duration));
  },
}
