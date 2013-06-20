var PlaylistView = function(list){
  this.dom = {};
  this.dom.list = list;
  this.dom.list.classList.add('playlistView');

  this.playlist = new UIItemList(this.dom.list);

  Utils.setupPassEvent(this, 'deleteItemFromPlaylist');
  Utils.setupPassEvent(this, 'switchCurrentPlaylistToItem');

  this.show = this.playlist.show.bind(this.playlist);
  this.hide = this.playlist.hide.bind(this.playlist);
}

PlaylistView.prototype = {
  setPlaylist: function(playlist){
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
      var item = this.uiItemFromPlaylistItem(source, playlist, i+1);
      this.playlist.append(item);
    }
  },
  uiItemFromPlaylistItem: function(source, playlist, index){
    var content = document.createElement('div');
    content.classList.add('info');
    source.setInfo(content);
    this.setupOnSwitchEvent(content, source, playlist);

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
    this.setupOnDeleteClick(del, item, source, playlist);

    return item;
  },
  setupOnToggleMoreClick: function(toggleMore, more, item, source, playlist){
    Utils.onButtonTap(toggleMore, function(){
      more.classList.toggle('hidden');
      toggleMore.classList.toggle('hide');
    });
  },
  setupOnDeleteClick: function(rm, item, source, playlist){
    Utils.onButtonTap(rm, function(){
      this.playlist.remove(item);
      this.deleteItemFromPlaylist(source, playlist);
    }.bind(this));
  },
  setupOnSwitchEvent: function(clickable, source, playlist){
    Utils.onButtonTap(clickable, function(){
      this.switchCurrentPlaylistToItem(source, playlist);
    }.bind(this));
  }
}
