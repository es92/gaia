var UI = function() {
  this.viewVisibility = new ViewVisibility();
  this.viewEvents = new ViewEvents();

  this.sourcesMetaDrawer = new SourcesMetaDrawer();
  this.playlistDrawer = new PlaylistDrawer();
  this.currentMusicPage = new CurrentMusicPage();

  this.setupEventViewEvents();

}

UI.prototype = {
  setupEventViewEvents: function() {
    var eventViewTable = {
      'ongotoCurrentMusicPage': 'showCurrentMusicPage',
      'ongotoSelectMusicPage': 'showSelectMusicPage',

      'ontoggleMetaDrawer': 'toggleMetaDrawer',
      'ontogglePlaylistDrawer': 'togglePlaylistDrawer',

      'ongotoSettings': 'metaDrawerGotoSettings',
      'ongotoSources': 'metaDrawerGotoSources',

      'ontoggleCurrentMusicPageView': 'toggleCurrentMusicPageView'
    }

    for (var event in eventViewTable){
      this.viewEvents[event] = this.viewVisibility[eventViewTable[event]].bind(this.viewVisibility);
    }
  },
  addPage: function(page, onActivate, onDeactivate){
    this.sourcesMetaDrawer.addSource(page.name, onActivate, onDeactivate);
  },
  activatePage: function(page){
    this.sourcesMetaDrawer.activateSource(page.name);
  }
}

