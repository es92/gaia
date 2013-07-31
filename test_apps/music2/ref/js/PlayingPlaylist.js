var PlayingPlaylist = function(){
  this.playlist = null;
  this.playingIndex = null;
}

PlayingPlaylist.prototype = {
  setFromPlaylist: function(playlist){
    this.playlist = playlist.copy();
  },
  stop: function(audioPlayer){
    this.playlist.stop();
    audioPlayer.stop(this.list[this.currentIndex]);
  },
}
