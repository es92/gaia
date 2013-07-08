var AudioPlayer = function(){
  this.audioPlayer = document.getElementById('audioPlayer');

  Utils.setupPassEvent(this, 'playing');
  Utils.setupPassEvent(this, 'paused');
  Utils.setupPassEvent(this, 'ended');
  Utils.setupPassEvent(this, 'waiting');
  Utils.setupPassEvent(this, 'notWaiting');

  this.audioPlayer.addEventListener('play', this.playing);
  this.audioPlayer.addEventListener('pause', this.paused);
  this.audioPlayer.addEventListener('ended', this.ended);
  this.audioPlayer.addEventListener('waiting', this.waiting);
  this.audioPlayer.addEventListener('canplaythrough', this.notWaiting);
}

AudioPlayer.prototype = {
  load: function(link){
    this.audioPlayer.removeAttribute('src');
    this.audioPlayer.load();
    this.audioPlayer.mozAudioChannelType = 'content';
    this.audioPlayer.src = link;
    this.audioPlayer.load();
  },
  play: function(){
    this.audioPlayer.play();
  },
  togglePlay: function(){
    if (this.audioPlayer.paused){
      this.play();
    }
    else {
      this.pause();
    }
  },
  pause: function(){
    this.audioPlayer.pause();
  }
}
