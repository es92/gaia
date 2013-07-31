var PlayingPlaylist = function(){
  this.playlist = null;
  this.index = null;
  this.modified = null;
  this._setNotModified();

  this.originalPlaylistId = null;
  
  this.state = null;
  

  Utils.setupPassParent(this, 'savePlaylistToPlaylists');
  Utils.setupPassParent(this, 'playSong');
  Utils.setupPassParent(this, 'pauseSong');
  Utils.setupPassParent(this, 'stopSong');

}

PlayingPlaylist.prototype = {
  name: "playingPlaylist",
  //============== API ===============
  switchToPlaylist: function(playlist, playlistId){
    var next = function(){
      this.playlist = playlist.copy();
      this._setNotModified();
      this.originalPlaylistId = playlistId;
      this.stop();
      window.ui.setPlaylist(this.playlist);
    }.bind(this);

    if (this._needsSaving()){
      this.checkWantSaveBeforeReplace(next);
    }
    else
      next();
  },
  checkWantSaveBeforeReplace: function(next){
    window.ui.userWantsSave(
      function yes(){
        this.savePlaylist(next, true);
    }.bind(this),
      function no(){
        next();
    }.bind(this),
      function cancel(){
        return;
    });
  },
  switchToSources: function(title, sources){

    var next = function(){
      this.playlist = new Playlist(title);
      for (var i = 0; i < sources.length; i++){
        this.playlist.appendAudioSource(sources[i]);
      }
      window.ui.setPlaylist(this.playlist);
      this.originalPlaylistId = null;
      this._setNotModified();
      this.play();
    }.bind(this);

    if (this._needsSaving()){
      this.checkWantSaveBeforeReplace(next);
    }
    else
      next();
  },
  enqueue: function(title, songs){
    if (this.playlist === null){
      this.switchToSources(title, songs);
      this.stop();
    }
    else {
      var oldlength = this.playlist.list.length;
      this.playlist.list.push.apply(this.playlist.list, songs);
      if (oldlength === 0)
        this.stop();
      window.ui.setPlaylist(this.playlist); // TODO inefficient
      this._setModified();
    }
  },
  savePlaylist: function(done, blockCancel){
    if (this.originalPlaylistId !== null){
      window.ui.saveAsNewOrUpdate(  
        function saveAsNew(){
          this.originalPlaylistId = this.savePlaylistToPlaylists(this.playlist, null);
          this._setNotModified();
          if (done)
            done();
      }.bind(this), 
        function saveAsUpdate(){
          this.savePlaylistToPlaylists(this.playlist, this.originalPlaylistId);
          this._setNotModified();
          if (done)
            done();
      }.bind(this),
        function cancel(){
          if (done)
            done();
      }.bind(this), !blockCancel);
    }
    else {
      this.originalPlaylistId = this.savePlaylistToPlaylists(this.playlist, null);
      this._setNotModified();
    }
  },
  clearPlaylist: function(){
    this.stop();
    if (this.playlist.length > 0)
      this._setModified();
    this.playlist.list = [];
    this.index = null;
    window.ui.setPlaylist(this.playlist);
  },
  shufflePlaylist: function(){
    var song = null;
    if (!this._atEnd() && !this._atBegin()){
      song = this.playlist.list[this.index];
    }
    Utils.shuffleArray(this.playlist.list);
    for (var i = 0; i < this.playlist.list.length; i++){
      if (this.playlist.list[i] === song){
        this.index = i;
        break;
      }
    }
    if (this.playlist.list.length > 0)
      this._setModified();
    window.ui.setPlaylist(this.playlist);
  },
  renamePlaylist: function(title){
    this.playlist.title = title;
    this._setModified();
    window.ui.setPlaylist(this.playlist); // TODO inefficient
  },
  deleteItem: function(index){
    this._setModified();

    if (this.index === index){
      this.playNext();
    }
    this.playlist.remove(index);
  },
  deletedPlaylist: function(playlistId){
    console.log("DELETED", this.originalPlaylistId, playlistId);
    if ('' + this.originalPlaylistId === '' + playlistId){
      this.originalPlaylistId = null;
      this._setModified();
    }
  },
  renamedPlaylist: function(playlistId, newTitle){
    if ('' + this.originalPlaylistId === '' + playlistId && !this._needsSaving()){
      this.renamePlaylist(newTitle);
      this._setNotModified();
    }
  },
  shuffledPlaylist: function(playlist, playlistId){
    if ('' + this.originalPlaylistId === '' + playlistId && !this._needsSaving()){
      this._setModified();
      //TODO should we copy over the shuffled playlist?
    }
  },
  switchToItem: function(index){
    if (index === this.index){
      this.togglePlay();
    }
    else {
      this.stop();
      this.index = index;
      this.play();
    }
  },
  moveItem: function(){
    //TODO
  },
  play: function(){
    if (this._atBegin() || this._atEnd()){
      this.index = 0;
    }
    this.playSong(this.playlist.list[this.index]);
    this.state = 'playing';
    this._songStateChanged();
  },
  togglePlay: function(){
    if (this.state === 'playing')
      this.pause();
    else
      this.play();
  },
  pause: function(){
    this.pauseSong(this.playlist.list[this.index]);
    this.state = 'paused';
    this._songStateChanged();
  },
  stop: function(){
    this.stopSong(this.playlist.list[this.index]);
    this.state = 'stopped';
    this._songStateChanged();
  },
  playNext: function(){
    var wasPlaying = this.state === 'playing';
    this.stop();
    this.index += 1;
    if (!this._atEnd()){
      if (wasPlaying)
        this.play();
      else
        this.pause();
    }
    else {
      this._songStateChanged();
    }
  },
  playPrev: function(){
    this.stop();
    this.index -= 1;
    if (!this._atBegin())
      this.play();
  },
  //============== helpers ===============
  _needsSaving: function(){
    return this.modified;
  },
  _setModified: function(){
    this.modified = true;
    window.ui.setSavable();
    if (this.originalPlaylistId !== null){
      //TODO remove current radio button on playlists screen
    }
  },
  _setNotModified: function(){
    this.modified = false;
    window.ui.setNotSavable();
  },
  _songStateChanged: function(){
    var song;
    if (this.playlist.list.length !== 0){
      if (this._atEnd() || this._atBegin())
        song = this.playlist.list[0];
      else
        song = this.playlist.list[this.index];
      window.ui.setSongState(song, this.index, this.state);
    }
  },
  _atEnd: function(){
    if (this.index === null)
      return this.playlist.list.length === 0;
    return this.index >= this.playlist.list.length;
  },
  _atBegin: function(){
    return this.index === null || this.index < 0;
  },

}
