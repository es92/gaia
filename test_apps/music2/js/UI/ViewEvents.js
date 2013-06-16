var ViewEvents = function(){
  Utils.loadDomIds(this, [
      'gotoCurrentMusicPage',
      'gotoSelectMusicPage',

      'toggleMetaDrawer',
      'togglePlaylistDrawer',

      'gotoSettings',
      'gotoSources',

      'toggleCurrentMusicPageView'
  ]);

  Utils.setupPassEvent(this, 'gotoCurrentMusicPage');
  Utils.setupPassEvent(this, 'gotoSelectMusicPage');

  Utils.setupPassEvent(this, 'toggleMetaDrawer');
  Utils.setupPassEvent(this, 'togglePlaylistDrawer');

  Utils.setupPassEvent(this, 'gotoSettings');
  Utils.setupPassEvent(this, 'gotoSources');

  Utils.setupPassEvent(this, 'toggleCurrentMusicPageView');


  Utils.onButtonTap(this.dom.gotoCurrentMusicPage, this.gotoCurrentMusicPage);
  Utils.onButtonTap(this.dom.gotoSelectMusicPage, this.gotoSelectMusicPage);

  Utils.onButtonTap(this.dom.toggleMetaDrawer, this.toggleMetaDrawer);
  Utils.onButtonTap(this.dom.togglePlaylistDrawer, this.togglePlaylistDrawer);

  Utils.onButtonTap(this.dom.gotoSettings, this.gotoSettings);
  Utils.onButtonTap(this.dom.gotoSources, this.gotoSources);

  Utils.onButtonTap(this.dom.toggleCurrentMusicPageView, this.toggleCurrentMusicPageView);
}

ViewEvents.prototype = {

}
