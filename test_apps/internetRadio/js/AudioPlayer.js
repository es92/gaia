var AudioPlayer = function(){
  this.audioPlayer = document.getElementById('audioPlayer');

  Utils.setupPassEvent(this, 'playing');
  Utils.setupPassEvent(this, 'paused');
  Utils.setupPassEvent(this, 'ended');

  this.audioPlayer.addEventListener('play', this.playing);
  this.audioPlayer.addEventListener('pause', this.paused);
  this.audioPlayer.addEventListener('ended', this.ended);
}

AudioPlayer.prototype = {
  load: function(link){
    this.audioPlayer.src = link;
  },
  play: function(){
    this.audioPlayer.play();
  },
  togglePlay: function(){
    if (this.audioPlayer.paused)
      this.play();
    else
      this.pause();
  },
  pause: function(){
    this.audioPlayer.pause();
  }
}
