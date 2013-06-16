var MediaLibraryPage = function(pageBridge){
  this.pageBridge = pageBridge;
  Utils.loadDomIds(this, [
      'mediaLibraryPage',
      'selectSourcePages'
  ]);
  this.dom.page = this.dom.mediaLibraryPage;

  this.musicDB = new MusicDB();

  this.panelManager = new MediaLibraryPagePanelManager(this.musicDB, this.pageBridge);

  this.startPanel = new MediaLibraryPagePanel();
  this.panelManager.pushPanel(this.startPanel);

}

MediaLibraryPage.prototype = {
  name: "Music Library",
  unserialize: function(serializedSource){
    return new FileAudioSource(this.musicDB, serializedSource);
  },
  activate: function(){
    this.dom.selectSourcePages.removeChild(this.dom.page);
    this.pageBridge.setPageDiv(this.dom.page);
  },
  deactivate: function(){
    this.dom.page.parentNode.removeChild(this.dom.page);
    this.dom.selectSourcePages.appendChild(this.dom.page);
  }
}
