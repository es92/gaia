
var Music = function() {

  //window.router = new Router('DEBUG');
  window.router = new Router();
  window.router.on('unserialize', this.unserializeSource.bind(this));

  this.playingPlaylist = new PlayingPlaylist();
  this.playlists = new Playlists();

  this.playlists.onselectPlaylist = this.playingPlaylist.switchToPlaylist.bind(this.playingPlaylist);
  this.playingPlaylist.onsavePlaylistToPlaylists = this.playlists.savePlaylist.bind(this.playlists);

  this.playlists.ondeletedPlaylist = this.playingPlaylist.deletedPlaylist.bind(this.playingPlaylist);
  this.playlists.onrenamedPlaylist = this.playingPlaylist.renamedPlaylist.bind(this.playingPlaylist);
  this.playlists.onshuffledPlaylist = this.playingPlaylist.shuffledPlaylist.bind(this.playingPlaylist);

  this.audioPlayer = new AudioPlayer();

  this.playingPlaylist.onplaySong = this.audioPlayer.play.bind(this.audioPlayer);
  this.playingPlaylist.onpauseSong = this.audioPlayer.pause.bind(this.audioPlayer);
  this.playingPlaylist.onstopSong = this.audioPlayer.stop.bind(this.audioPlayer);

  this.audioPlayer.onisEnded = this.playingPlaylist.playNext.bind(this.playingPlaylist);
  
  window.ui.onrequestSetTime = this.audioPlayer.setTime.bind(this.audioPlayer);

  window.ui.selectPageBridge.onenqueueIntoCustomPlaylist = function(){
    //if choose current
    //  this.playingPlaylist.enqueue
    //else
    //  this.playlists.enqueue
  }

  window.ui.selectPageBridge.onenqueueIntoCurrentPlaylist = this.playingPlaylist.enqueue.bind(this.playingPlaylist);
  window.ui.selectPageBridge.oncreateTemporaryPlaylistFromSources = this.playingPlaylist.switchToSources.bind(this.playingPlaylist);

  window.ui.ondeleteItemFromPlaylist = this.playingPlaylist.deleteItem.bind(this.playingPlaylist);
  window.ui.onswitchToPlaylistItem = this.playingPlaylist.switchToItem.bind(this.playingPlaylist);
  window.ui.onmovePlaylistItemRelative = this.playingPlaylist.moveItem.bind(this.playingPlaylist);

  window.ui.onplay = this.playingPlaylist.play.bind(this.playingPlaylist);
  window.ui.onpause = this.playingPlaylist.pause.bind(this.playingPlaylist);
  window.ui.onplayPrev = this.playingPlaylist.playPrev.bind(this.playingPlaylist);
  window.ui.onplayNext = this.playingPlaylist.playNext.bind(this.playingPlaylist);

  window.ui.oncreatePlaylist = this.playlists.createEmptyPlaylist.bind(this.playlists);
  window.ui.oncopyPlaylist = this.playlists.copyPlaylist.bind(this.playlists);
  window.ui.ondeletePlaylist = this.playlists.deletePlaylist.bind(this.playlists);
  window.ui.onrenamePlaylist = this.playlists.renamePlaylist.bind(this.playlists);
  window.ui.onshufflePlaylist = this.playlists.shufflePlaylist.bind(this.playlists);
  window.ui.onswitchPlaylist = this.playlists.switchPlaylist.bind(this.playlists);

  window.ui.onsavePlayingPlaylist = this.playingPlaylist.savePlaylist.bind(this.playingPlaylist);
  window.ui.onclearPlayingPlaylist = this.playingPlaylist.clearPlaylist.bind(this.playingPlaylist);
  window.ui.onshufflePlayingPlaylist = this.playingPlaylist.shufflePlaylist.bind(this.playingPlaylist);
  window.ui.onrenamePlayingPlaylist = this.playingPlaylist.renamePlaylist.bind(this.playingPlaylist);

}

Music.prototype = {
  name: "music",
  unserializeSource: function(serializedSource){
    return window.ui.mediaLibraryPage.unserialize(serializedSource.data);
  },
}

window.addEventListener('load', function(){
  window.ui = new MusicUI();
  window.app = new Music(); 
});
