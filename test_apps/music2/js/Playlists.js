var Playlists = function(){
  Utils.setupPassParent(this, 'selectPlaylist');
  this._load();
  window.ui.playlists.setPlaylists(this.playlists);

  Utils.setupPassParent(this, 'selectPlaylist');

  Utils.setupPassParent(this, 'deletedPlaylist');
  Utils.setupPassParent(this, 'renamedPlaylist');
  Utils.setupPassParent(this, 'shuffledPlaylist');
}

Playlists.prototype = {
  name: "playlists",
  //============== API ===============
  createEmptyPlaylist: function(title){
    var playlist = new Playlist(title);
    var playlistId = this.nextPlaylistId;
    this.playlists[playlistId] = playlist;
    this.nextPlaylistId++;
    window.ui.playlists.setPlaylists(this.playlists);
    this._save();
    return playlistId;
  },
  savePlaylist: function(playlist, playlistId){
    var newPlaylist;

    if (playlistId === null)
      var playlistId = this.createEmptyPlaylist(playlist.title);

    newPlaylist = this.playlists[playlistId];
    newPlaylist.list = Utils.copyArray(playlist.list);
    newPlaylist.title = playlist.title;
    window.ui.playlists.setPlaylists(this.playlists); //TODO inefficient
    this._save();
    return playlistId;
  },
  copyPlaylist: function(title, srcPlaylistId){
    var playlistId = this.createEmptyPlaylist(title);
    this.playlists[playlistId].list = Utils.copyArray(this.playlists[srcPlaylistId].list);
    this._save();
  },
  deletePlaylist: function(playlistId){
    var playlist = this.playlists[playlistId];
    this.deletedPlaylist(playlistId);
    delete this.playlists[playlistId];
    window.ui.playlists.setPlaylists(this.playlists);
    this._save();
  },
  renamePlaylist: function(playlistId, title){
    var playlist = this.playlists[playlistId];
    playlist.title = title;
    window.ui.playlists.setPlaylists(this.playlists);
    this.renamedPlaylist(playlistId, title);
    this._save();
  },
  shufflePlaylist: function(playlistId){
    //TODO
    //this.shuffledPlaylist(this.playlists[playlistId], playlistId);
    this._save();
  },
  switchPlaylist: function(playlistId){
    this.selectPlaylist(this.playlists[playlistId], playlistId);
  },
  //============== helpers ===============
  _load: function(){
    this.playlists = {};
    if (window.localStorage.playlists){
      var serializedPlaylists = JSON.parse(window.localStorage.playlists);
      for (var playlistId in serializedPlaylists)
        this.playlists[playlistId] = Playlist.unserialize(serializedPlaylists[playlistId]);
      this.nextPlaylistId = JSON.parse(window.localStorage.nextPlaylistId);
    }
    else {
      this.nextPlaylistId = 0;
    }

  },
  _save: function(){
    var serializedPlaylists = {};
    for (var playlistId in this.playlists)
      serializedPlaylists[playlistId] = this.playlists[playlistId].serialize();
    window.localStorage.playlists = JSON.stringify(serializedPlaylists);
    window.localStorage.nextPlaylistId = JSON.stringify(this.nextPlaylistId);
  },
}
