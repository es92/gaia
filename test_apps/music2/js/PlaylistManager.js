var PlaylistManager = function(currentPageUI, playlistDrawerUI){
  this.ui = currentPageUI;
  this.ui.playlists = playlistDrawerUI;

  this.audioPlayer = new AudioPlayer();

  this.playlists = {};
  
  this.loadPlaylists();

  this.currentPlaylistId = null;

  if (this.numPlaylists === 0){
    //this.createPlaylist("new playlist");
    this.ui.playlists.setPlaylists(this.playlists);
    this.setCurrentPlaylist(null);
  }
  else {
    this.ui.playlists.setPlaylists(this.playlists);
    for (var id in this.playlists){
      this.setCurrentPlaylist(id);
      break;
    }
  }

  this.ui.controls.onplayPrev = this.playPrev.bind(this);
  this.ui.controls.onplayNext = this.playNext.bind(this);
  this.ui.controls.onplay = this.play.bind(this);
  this.ui.controls.onpause = this.pause.bind(this);

  this.ui.playlist.ondeleteItemFromPlaylist = this.deleteItemFromPlaylist.bind(this);
  this.ui.playlist.onswitchCurrentPlaylistToItem = this.switchCurrentPlaylistToItem.bind(this);

  this.ui.playlists.oncreatePlaylist = this.createPlaylist.bind(this);
  this.ui.playlists.ondeletePlaylist = this.deletePlaylist.bind(this);
  this.ui.playlists.onswitchPlaylist = this.setCurrentPlaylist.bind(this);

  this.audioPlayer.onisEnded = this.currentEnded.bind(this);
  this.audioPlayer.onisPaused = this.ui.controls.setPaused.bind(this.ui.controls);
  this.audioPlayer.onisPlaying = this.ui.controls.setPlaying.bind(this.ui.controls);
  this.audioPlayer.onsetTotalTime = this.ui.controls.seekBar.setTotalTime.bind(this.ui.controls.seekBar);
  this.audioPlayer.onsetCurrentTime = this.ui.controls.seekBar.setCurrentTime.bind(this.ui.controls.seekBar);
}

PlaylistManager.prototype = {
  appendAudioSourceToCurrent: function(title, source){
    if (this.currentPlaylistId === null){
      this.createPlaylist(title);
    }
    var playlist = this.playlists[this.currentPlaylistId];
    if (playlist.list.length === 0)
      this.ui.controls.enable();
    if (playlist.temporary)
      playlist.temporary = false;
    playlist.appendAudioSource(source);
    this.ui.playlist.setPlaylist(playlist);
    this.savePlaylists();
  },
  createTemporaryPlaylistFromSources: function(title, sources){
    var playlistId = this.createPlaylist(title, true);
    this.setCurrentPlaylist(playlistId);

    var playlist = this.playlists[this.currentPlaylistId];
    for (var i = 0; i < sources.length; i++){
      playlist.appendAudioSource(sources[i]);
    }
    this.ui.playlist.setPlaylist(playlist);
    this.ui.playlists.setCurrentPlaylist(this.currentPlaylistId, 'stop');
    this.play();
  },
  stop: function(){
    this.ui.source.setInfo(null);
    if (this.currentPlaylistId === null)
      return;
    var playlist = this.playlists[this.currentPlaylistId];
    playlist.stop(this.audioPlayer);
    this.ui.playlists.setCurrentPlaylist(this.currentPlaylistId, 'stop');
  },
  togglePlaying: function(){
    if (this.currentPlaylistId === null)
      return;
    var playlist = this.playlists[this.currentPlaylistId];
    if (playlist.getCurrentSource().state === 'play')
      this.pause();
    else
      this.play();
  },
  play: function(){
    if (this.currentPlaylistId === null)
      return;
    var playlist = this.playlists[this.currentPlaylistId];
    this.ui.source.setInfo(playlist.getCurrentSource());
    playlist.play(this.audioPlayer);
    this.ui.playlist.setPlaylist(playlist);
    this.ui.playlists.setCurrentPlaylist(this.currentPlaylistId, 'play');
  },
  pause: function(){
    if (this.currentPlaylistId === null)
      return;
    var playlist = this.playlists[this.currentPlaylistId];
    playlist.pause(this.audioPlayer);
    this.ui.playlist.setPlaylist(playlist);
    this.ui.playlists.setCurrentPlaylist(this.currentPlaylistId, 'pause');
  },
  playNext: function(){
    if (this.currentPlaylistId === null)
      return;
    var playlist = this.playlists[this.currentPlaylistId];
    playlist.stop(this.audioPlayer);
    playlist.currentIndex += 1;
    if (!playlist.atEnd()){
      playlist.play(this.audioPlayer);
    }
    this.ui.playlist.setPlaylist(playlist);
  },
  playPrev: function(){
    if (this.currentPlaylistId === null)
      return;
    var playlist = this.playlists[this.currentPlaylistId];
    playlist.stop(this.audioPlayer);
    playlist.currentIndex -= 1;
    if (!playlist.atBegin()){
      playlist.play(this.audioPlayer);
    }
    this.ui.playlist.setPlaylist(playlist);
  },
  currentEnded: function(){
    this.ui.controls.setPaused();
    this.playNext();
  },
  deleteItemFromPlaylist: function(source, playlist){
    if (this.currentPlaylistId !== null &&
        playlist === this.playlists[this.currentPlaylistId] &&
        source === playlist.getCurrentSource()
    ){
      this.playNext();
    }
    playlist.deleteSource(source);
    if (playlist.list.length === 0){
      this.ui.controls.disable();
    }
    this.savePlaylists();
  },
  switchCurrentPlaylistToItem: function(source, playlist){
    if (this.currentPlaylistId === null)
      return;
    var currentPlaylist = this.playlists[this.currentPlaylistId];

    if (playlist === currentPlaylist &&
        source === playlist.getCurrentSource()
    ){
      this.togglePlaying();
    }
    else {
      this.stop();
      var currentPlaylist = this.playlists[this.currentPlaylistId];
      currentPlaylist.setCurrentSource(source);
      this.play();
    }
    var currentPlaylist = this.playlists[this.currentPlaylistId];
    this.ui.playlist.setPlaylist(currentPlaylist);
  },
  loadPlaylists: function(){
    this.playlists = {}; 
    this.nextPlaylistId = 0;
    this.numPlaylists = 0;
    if (window.localStorage.playlists === undefined)
      return;
    var serializedPlaylists = JSON.parse(window.localStorage.playlists);
    for (var id in serializedPlaylists){
      this.numPlaylists += 1;
      this.playlists[id] = Playlist.unserialize(serializedPlaylists[id]);
    }
    this.nextPlaylistId = parseInt(window.localStorage.nextPlaylistId);
  },
  createPlaylist: function(title, temporary){
    if (!temporary)
      temporary = false;
    var playlist = new Playlist(title, temporary);
    var playlistId = this.nextPlaylistId
    this.playlists[playlistId] = playlist;
    this.nextPlaylistId++;
    this.numPlaylists += 1;
    this.ui.playlists.setPlaylists(this.playlists);
    if (!playlist.temporary)
      this.savePlaylists();
    if (this.numPlaylists === 1){
      this.setCurrentPlaylist(playlistId);
    }
    return playlistId;
  },
  deletePlaylist: function(playlistId){
    var playlist = this.playlists[playlistId];
    if (this.currentPlaylistId !== null &&
        playlist === this.playlists[this.currentPlaylistId]
    ){
      this.setCurrentPlaylist(null);
    }
    delete this.playlists[playlistId];
    this.numPlaylists -= 1;
    this.ui.playlists.setPlaylists(this.playlists);
    this.savePlaylists();
  },
  setCurrentPlaylist: function(playlistId){
    this.stop();
    this.currentPlaylistId = playlistId;
    var currentPlaylist = this.playlists[this.currentPlaylistId];
    this.ui.playlist.setPlaylist(currentPlaylist);
    this.ui.playlists.setCurrentPlaylist(playlistId);
    if (playlistId === null){
      this.ui.controls.disable();
    }
    else {
      this.ui.controls.enable();
    }
  },
  savePlaylists: function(){
    var serializedPlaylists = {};
    for (var id in this.playlists){
      var playlist = this.playlists[id];
      if (playlist.temporary)
        continue;
      serializedPlaylists[id] = playlist.serialize();
    }
    window.localStorage.playlists = JSON.stringify(serializedPlaylists);
    window.localStorage.nextPlaylistId = this.nextPlaylistId;
  }
}
