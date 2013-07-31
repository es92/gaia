var CurrentMusicPageOptions = function(){
  Utils.loadDomIds(this, [
    "playingPlaylistButtons",
    "savePlaylist",
    "playlistOptionsButton",
    "playlistOptionsOverlay",
    "playlistOptions",
    "clearPlaylist",
    "shufflePlaylist",
    "renamePlaylist"
  ]);

  Utils.setupPassParent(this, 'savePlaylist');
  Utils.onButtonTap(this.dom.savePlaylist, this.savePlaylist);

  Utils.onButtonTap(this.dom.playlistOptionsButton, this.toggleMenu.bind(this));

  Utils.setupPassParent(this, 'clearPlaylist');
  Utils.setupPassParent(this, 'shufflePlaylist');
  Utils.setupPassParent(this, 'renamePlaylist');
  Utils.onButtonTap(this.dom.clearPlaylist, function(){
    this.toggleMenu();
    this.clearPlaylist();
  }.bind(this));
  Utils.onButtonTap(this.dom.shufflePlaylist, function(){
    this.toggleMenu();
    this.shufflePlaylist();
  }.bind(this));
  Utils.onButtonTap(this.dom.renamePlaylist, function(){
    this.toggleMenu();
    title = prompt("Playlist Name:");
    if (title !== null && title !== '')
      this.renamePlaylist(title);
  }.bind(this));

  var tapManager = new TapManager(this.dom.playlistOptionsOverlay);
  tapManager.ontap = this.toggleMenu.bind(this);
}

CurrentMusicPageOptions.prototype = {
  name: "CurrentMusicPageOptions",
  toggleMenu: function(){
    this.dom.playlistOptions.classList.toggle('hidden');
    this.dom.playlistOptionsOverlay.classList.toggle('hidden');
  },
  showSave: function(){
    this.dom.savePlaylist.classList.remove('hidden');
    this.dom.playingPlaylistButtons.classList.add('big');
  },
  hideSave: function(){
    this.dom.savePlaylist.classList.add('hidden');
    this.dom.playingPlaylistButtons.classList.remove('big');
  },
}
