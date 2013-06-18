var PlaylistDrawer = function(){
  Utils.loadDomIds(this, [
      "playlistDrawer",
      //"playlistDrawerPlaylists",
      //"playlistDrawerPlaylistItems",
      "playlistDrawerTitle",
      "playlistDrawerTitleContent",
      "playlistDrawerTitleBack",
      "playlistDrawerTitleDel",
      "playlistDrawerPlaylists",
      "playlistDrawerPlaylistItems",
  ]);

  this.dom.title = this.dom.playlistDrawerTitle
  this.dom.titleContent = this.dom.playlistDrawerTitleContent;

  this.playlist = new PlaylistView(this.dom.playlistDrawerPlaylistItems);
  this.playlistList = new UIItemList(this.dom.playlistDrawerPlaylists);

  this.lastCurrentPlaylist = null;

  this.selectedPlaylistId = null;

  Utils.setupPassEvent(this, 'createPlaylist');
  Utils.setupPassEvent(this, 'deletePlaylist');
  Utils.setupPassEvent(this, 'switchPlaylist');

  Utils.onButtonTap(this.dom.playlistDrawerTitleBack, this.switchToPlaylistView.bind(this));
  Utils.onButtonTap(this.dom.playlistDrawerTitleDel, this.deleteCurrentPlaylist.bind(this));

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
  setCurrentPlaylist: function(currentPlaylistId){
    var item = this.playlistListItems[currentPlaylistId];
    if (this.lastCurrentPlaylist !== null){
      this.lastCurrentPlaylist.setIcon(null);
    }
    if (item === undefined){
      this.lastCurrentPlaylist = null;
      return;
    }
    item.setIcon('currentPlaylist');
    this.lastCurrentPlaylist = item;
  },
  uiItemFromPlaylist: function(playlist, id){

    var content = document.createElement('div');
    content.classList.add('playlistTitle');
    content.innerHTML = playlist.title;
    Utils.onButtonTap(content, function(){
      this.switchPlaylist(id);
    }.bind(this));

    var gotoPlaylistButton = document.createElement('div');
    gotoPlaylistButton.classList.add('gotoPlaylistButton');

    Utils.onButtonTap(gotoPlaylistButton, function(){
      this.switchToPlaylistItemView(playlist, id);
    }.bind(this));

    //var more = document.createElement('div');
    var more = null;

    //var del = document.createElement('div');
    //Utils.onButtonTap(del, function(){
    //  this.deletePlaylist(id);
    //}.bind(this));
    //del.classList.add('playlistDelete');
    //more.appendChild(del);

    //var edit = document.createElement('div');
    //Utils.onButtonTap(edit, function(){
    //  
    //}.bind(this));
    //edit.classList.add('playlistEdit');
    //more.appendChild(edit);

    var item = new UIItem(null, content, more, gotoPlaylistButton);

    return item;
  },
  switchToPlaylistItemView: function(playlist, playlistId){
    this.playlist.show();
    this.playlistList.hide();

    this.dom.titleContent.innerHTML = playlist.title;
    this.dom.title.classList.remove('hidden');

    this.playlist.setPlaylist(playlist);

    this.selectedPlaylistId = playlistId;

  },
  switchToPlaylistView: function(){
    this.playlistList.show();
    this.playlist.hide();

    this.dom.title.classList.add('hidden');

    this.selectedPlaylistId = null;
  },
  deleteCurrentPlaylist: function(){
    var playlist = this.selectedPlaylistId;
    this.switchToPlaylistView();
    this.deletePlaylist(playlist);
  },
  uiItemNewPlaylist: function(){
    var content = document.createElement('div');
    content.classList.add('playlistTitle');
    content.innerHTML = 'create playlist';

    Utils.onButtonTap(content, function(){
      var title = prompt("Playlist Name:", "new playlist");
      this.createPlaylist(title);
    }.bind(this));
    
    var more = null;
    var item = new UIItem('noIcon', content, more);
    return item;
  }
}
