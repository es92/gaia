var MusicUI = function(){

  Utils.loadDomIds(this, [
      'toggleCurrentMusicPageView',

  ]);

  this.viewVisibility = new ViewVisibility();
  this.viewEvents = new ViewEvents();
  this.currentMusicPage = new CurrentMusicPage();

  this.playlists = new PlaylistDrawer();

  this.currentMusicPage.source.onhideCurrentSourceView = function(){
    this.dom.toggleCurrentMusicPageView.classList.add('hidden');
    if (!this.dom.toggleCurrentMusicPageView.classList.contains('switchSong')){
      this.viewVisibility.toggleCurrentMusicPageView();
    }
  }.bind(this);

  this.currentMusicPage.source.onshowCurrentSourceView = function(){
    this.dom.toggleCurrentMusicPageView.classList.remove('hidden');
  }.bind(this);

  this._setupEventViewEvents();

  var imgs = document.getElementsByTagName('img');
  for (var i = 0; i < imgs.length; i++){
    var img = imgs[i];
    (function(img){
      img.onerror = function(){
        img.src = '';
      };
    })(img);
  }
  
  this.selectPageBridge = new SelectPageBridge();

  this.mediaLibraryPage = new MediaLibraryPage(this.selectPageBridge);


  Utils.setupPassParent(this, 'deleteItemFromPlaylist');
  Utils.setupPassParent(this, 'switchToPlaylistItem');
  Utils.setupPassParent(this, 'movePlaylistItemRelative');
  this.currentMusicPage.playlist.ondeleteItemFromPlaylist = this.deleteItemFromPlaylist;
  this.currentMusicPage.playlist.onswitchToPlaylistItem = this.switchToPlaylistItem;
  this.currentMusicPage.playlist.onmovePlaylistItemRelative = this.movePlaylistItemRelative;
  

  Utils.setupPassParent(this, 'play');
  Utils.setupPassParent(this, 'pause');
  Utils.setupPassParent(this, 'playPrev');
  Utils.setupPassParent(this, 'playNext');
  this.currentMusicPage.controls.onplay = this.play;
  this.currentMusicPage.controls.onpause = this.pause;
  this.currentMusicPage.controls.onplayPrev = this.playPrev;
  this.currentMusicPage.controls.onplayNext = this.playNext;


  Utils.setupPassParent(this, 'createPlaylist');
  Utils.setupPassParent(this, 'copyPlaylist');
  Utils.setupPassParent(this, 'deletePlaylist');
  Utils.setupPassParent(this, 'renamePlaylist');
  Utils.setupPassParent(this, 'shufflePlaylist');
  Utils.setupPassParent(this, 'switchPlaylist');
  this.playlists.oncreatePlaylist = this.createPlaylist;
  this.playlists.oncopyPlaylist = this.copyPlaylist;
  this.playlists.ondeletePlaylist = this.deletePlaylist;
  this.playlists.onrenamePlaylist = this.renamePlaylist;
  this.playlists.onshufflePlaylist = this.shufflePlaylist;
  this.playlists.onswitchPlaylist = this.switchPlaylist;

  Utils.setupPassParent(this, 'savePlayingPlaylist');
  Utils.setupPassParent(this, 'clearPlayingPlaylist');
  Utils.setupPassParent(this, 'shufflePlayingPlaylist');
  Utils.setupPassParent(this, 'renamePlayingPlaylist');
  this.currentMusicPage.options.onsavePlaylist = this.savePlayingPlaylist;
  this.currentMusicPage.options.onclearPlaylist = this.clearPlayingPlaylist;
  this.currentMusicPage.options.onshufflePlaylist = this.shufflePlayingPlaylist;
  this.currentMusicPage.options.onrenamePlaylist = this.renamePlayingPlaylist;

  Utils.setupPassParent(this, 'requestSetTime');
  this.currentMusicPage.controls.seekBar.onrequestSetTime = this.requestSetTime;

}

MusicUI.prototype = {
  name: "MusicUI",
  //============== API ===============
  setPlaylist: function(playlist){
    this.currentMusicPage.controls.nowPlaying.show();
    this.currentMusicPage.playlist.setPlaylist(playlist);
    this.currentMusicPage.setTitle(playlist.title);
    if (playlist.list.length > 0){
      this.currentMusicPage.controls.nowPlaying.show();
    }
    else {
      this.currentMusicPage.controls.nowPlaying.hide();
      this.viewVisibility.showSelectMusicPage();
    }
  },
  setSongState: function(song, index, state){
    this.currentMusicPage.source.setInfo(song, state);
    if (state === 'stopped'){
      this.currentMusicPage.controls.setPaused();
      this.currentMusicPage.controls.seekBar.disable();
    }
    else if (state === 'paused'){
      this.currentMusicPage.controls.setPaused();
      this.currentMusicPage.controls.seekBar.enable();
    }
    else if (state === 'playing'){
      this.currentMusicPage.controls.setPlaying();
      this.currentMusicPage.controls.seekBar.enable();
    }
    this.currentMusicPage.playlist.setSongState(index, state);
  },
  setSavable: function(){
    this.currentMusicPage.options.showSave();
  },
  setNotSavable: function(){
    this.currentMusicPage.options.hideSave();
  },
  setCurrentTime: function(seconds){
    this.currentMusicPage.controls.seekBar.setCurrentTime(seconds);
  },
  setTotalTime: function(seconds){
    this.currentMusicPage.controls.seekBar.setTotalTime(seconds);
  },
  saveAsNewOrUpdate: function(saveAsNew, saveAsUpdate, cancel, allowCancel){
    var options ={
      'update original playlist': 'update',
      'create new playlist': 'new'
    };

    if (allowCancel)
      options['cancel'] = { 'value': '__cancel', 'default': true };

    Utils.select(options, function(choice){
      var title;
      if (choice === '__cancel'){
        cancel();
      }
      else if (choice === 'update'){
        saveAsUpdate();
      }
      else if (choice === 'new'){
        saveAsNew();
      }
    }.bind(this));
  },
  userWantsSave: function(yes, no, cancel){
    var options ={
      'save modifications to current playlist': 'yes',
      'don\'t save modifications to current playlist': 'no'
    };

    options['cancel'] = { 'value': '__cancel', 'default': true };

    Utils.select(options, function(choice){
      var title;
      if (choice === '__cancel'){
        cancel();
      }
      else if (choice === 'yes'){
        yes();
      }
      else if (choice === 'no'){
        no();
      }
    }.bind(this));
  },
  //============== helpers ===============
  _setupEventViewEvents: function() {
    var eventViewTable = {
      'ongotoCurrentMusicPage': 'showCurrentMusicPage',
      'ongotoSelectMusicPage': 'showSelectMusicPage',

      'ontoggleCurrentMusicPageView': 'toggleCurrentMusicPageView'
    }

    for (var event in eventViewTable){
      this.viewEvents[event] = this.viewVisibility[eventViewTable[event]].bind(this.viewVisibility);
    }
  },
}
