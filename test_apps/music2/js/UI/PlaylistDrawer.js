var PlaylistDrawer = function(){
  Utils.loadDomIds(this, [
      "playlistDrawer",
      "playlistDrawerPlaylists",
      "playlistDrawerPlaylistItems"
  ]);
  this.playlistList = new UIItemList(this.dom.playlistDrawerPlaylists);

  this.lastCurrentPlaylist = null;

  Utils.setupPassEvent(this, 'createPlaylist');
  Utils.setupPassEvent(this, 'deletePlaylist');
  Utils.setupPassEvent(this, 'switchPlaylist');

}

PlaylistDrawer.prototype = {
  setPlaylists: function(playlists){
    this.playlistListItems = {};
    this.playlistList.empty();
    for (var playlistId in playlists){
      var playlist = playlists[playlistId];
      if (playlist.temporary)
        continue;
      var item = this.uiItemFromPlaylist(playlist, playlistId);
      this.playlistListItems[playlistId] = item;
      this.playlistList.append(item);
    }
    var newPlaylistItem = this.uiItemNewPlaylist();
    this.playlistList.append(newPlaylistItem);
  },
  setCurrentPlaylist: function(currentPlaylistId, state){
    var item = this.playlistListItems[currentPlaylistId];
    if (this.lastCurrentPlaylist !== null){
      this.lastCurrentPlaylist.setIcon(null);
    }
    if (item === undefined){
      this.lastCurrentPlaylist = null;
      return;
    }
    if (state === 'play')
      item.setIcon('currentPlayingPlaylist');
    else
      item.setIcon('currentPausedPlaylist');
    this.lastCurrentPlaylist = item;
  },
  uiItemFromPlaylist: function(playlist, id){

    var content = document.createElement('div');
    content.classList.add('playlistTitle');
    content.innerHTML = playlist.title;
    Utils.onButtonTap(content, function(){
      this.switchPlaylist(id);
    }.bind(this));

    var more = document.createElement('div');

    var del = document.createElement('div');
    Utils.onButtonTap(del, function(){
      this.deletePlaylist(id);
    }.bind(this));
    del.classList.add('playlistDelete');
    more.appendChild(del);

    var edit = document.createElement('div');
    Utils.onButtonTap(edit, function(){
      
    }.bind(this));
    edit.classList.add('playlistEdit');
    more.appendChild(edit);

    var item = new UIItem('noIcon', content, more);

    return item;
  },
  uiItemNewPlaylist: function(){
    var content = document.createElement('div');
    content.classList.add('playlistTitle');
    content.innerHTML = 'create new playlist';

    Utils.onButtonTap(content, function(){
      var title = prompt("Playlist Name:", "new playlist");
      this.createPlaylist(title);
    }.bind(this));
    
    var more = null;
    var item = new UIItem('noIcon', content, more);
    return item;
  }
}
