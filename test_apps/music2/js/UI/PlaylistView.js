var PlaylistView = function(list, hideAlbumArt){
  this.dom = {};
  this.dom.list = list;
  this.dom.list.classList.add('playlistView');

  this.hideAlbumArt = hideAlbumArt;

  this.playlist = new UIItemList(this.dom.list);
  this.playlist.draggable = true;

  this.playlist.onelemMoved = this.onElemMoved.bind(this);

  Utils.setupPassParent(this, 'deleteItemFromPlaylist');
  Utils.setupPassParent(this, 'switchToPlaylistItem');
  Utils.setupPassParent(this, 'movePlaylistItemRelative');

  this.show = this.playlist.show.bind(this.playlist);
  this.hide = this.playlist.hide.bind(this.playlist);

  this.currentPlaylist = null;
}

PlaylistView.prototype = {
  name: "PlaylistView",
  setPlaylist: function(playlist){
    this.currentPlaylist = playlist;
    this.playlist.empty();

    if (playlist === null || playlist === undefined){
      var text = Utils.classDiv('text');
      text.innerHTML = 'no playlist selected:<br>select songs or select a playlist';
      this.dom.list.appendChild(text);
      return;
    }

    if (playlist.list.length === 0){
      var text = Utils.classDiv('text');
      text.innerHTML = 'playlist empty';
      this.dom.list.appendChild(text);
    }

    for (var i = 0; i < playlist.list.length; i++){
      var source = playlist.list[i];

      var showAlbumArt = true;
      if (i > 0){
        var other = playlist.list[i-1];
        if (other.parentPageName === source.parentPageName){
          showAlbumArt = !source.hasSameAlbumArt(other);
        }
      }
      var item = this.uiItemFromPlaylistItem(source, i+1, showAlbumArt);
      this.playlist.append(item);
      item.dom.div.classList.add('playlistViewItem');
    }
  },
  setSongState: function(index, state){
    var item = this.playlist.itemByIndex(index);
    if (!item)
      return;
    var icon = item.dom.icon;
    icon.classList.remove('beingPlayedIcon');
    icon.classList.remove('beingPausedIcon');
    icon.classList.remove('tracknum');
    icon.innerHTML = '';
    if (state === 'paused')
      icon.classList.add('beingPausedIcon');
    else if (state === 'playing')
      icon.classList.add('beingPlayedIcon');
    else {
      icon.classList.add('tracknum');
      icon.innerHTML = index;
    }
  },
  uiItemFromPlaylistItem: function(source, index, showAlbum){
    var content = document.createElement('div');
    var contentText = Utils.classDiv('info');

    if (showAlbum && !this.hideAlbumArt){
      var contentAlbumCover = document.createElement('img');
      contentAlbumCover.src = '';
      contentAlbumCover.classList.add('albumCover');
      source.setAlbumArt(contentAlbumCover);
      content.appendChild(contentAlbumCover);
      contentText.classList.add('right');
    }

    content.appendChild(contentText);
    source.setInfo(contentText);
    Utils.onButtonTap(content, function(){
      this.switchToPlaylistItem(item.index);
    }.bind(this));
    //this.setupOnSwitchEvent(content, source, playlistId);

    var more = null;

    var icon;
    var state = source.getState();
    if (state === 'pause')
      icon = 'beingPausedIcon';
    else if (state === 'play')
      icon = 'beingPlayedIcon';
    else {
      icon = document.createElement('div');
      icon.classList.add('tracknum');
      icon.innerHTML = index;
    }

    var del = document.createElement('div');
    del.classList.add('playlistItemDelete');

    var item = new UIItem(icon, content, more, del);
    item.data.source = source;
    //this.setupOnDeleteClick(del, item, source);
    Utils.onButtonTap(del, function(){
      this.deleteItemFromPlaylist(item.index);
      this.playlist.remove(item);
    }.bind(this));

    return item;
  },
  onElemMoved: function(moveData){
    var item = moveData.item;
    var relativeItem = moveData.relativeItem;
    var relativeDir = moveData.relativeDir;
    this.movePlaylistItemRelative(this.currentPlaylist, item.data.source, relativeItem.data.source, relativeDir);
  },
}
