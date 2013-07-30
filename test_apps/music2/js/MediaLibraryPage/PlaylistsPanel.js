var PlaylistsPanel = function(done, readyToSet){
  Utils.loadDomIds(this, [
      "mediaLibraryPagePanel",
      "mediaLibraryPagePanelTitle",
      "mediaLibraryPagePanelTitleText",
      "mediaLibraryPagePanelList",
      "mediaLibraryPagePanelSubCategories",
      "mediaLibraryPagePanelItems",
      "mediaLibraryPagePanelPop",

      "mediaLibraryPagePanelAlbum",
      "mediaLibraryPagePanelControls",
      "mediaLibraryPagePanelControlPlay",
      "mediaLibraryPagePanelControlAdd",

      "playlists"
  ]);

  this.dom.panel = this.dom.mediaLibraryPagePanel;
  this.dom.title = this.dom.mediaLibraryPagePanelTitle;
  this.dom.titleText = this.dom.mediaLibraryPagePanelTitleText;
  this.dom.subCategories = this.dom.mediaLibraryPagePanelSubCategories;
  this.dom.items = this.dom.mediaLibraryPagePanelItems;

  this.dom.albumCover = this.dom.mediaLibraryPagePanelAlbum;
  this.dom.controls = this.dom.mediaLibraryPagePanelControls;
  this.dom.controlPlay = this.dom.mediaLibraryPagePanelControlPlay;
  this.dom.controlAdd = this.dom.mediaLibraryPagePanelControlAdd;

  this.done = done;


  setTimeout(readyToSet, 0);
}

PlaylistsPanel.prototype = {
  setPanel: function(){
    this.dom.playlists.classList.remove('hidden');
    this.dom.mediaLibraryPagePanelList.classList.add('hidden');
    Utils.empty(this.dom.items);
    Utils.empty(this.dom.subCategories);

    Utils.empty(this.dom.titleText);
    var title = document.createElement('div');
    title.innerHTML = 'Playlists';
    this.dom.titleText.appendChild(title);

    this.dom.controls.classList.add('hidden');
    this.dom.albumCover.classList.add('hidden');

    if (this.done)
      this.done();
  },
  unload: function(){
    this.dom.playlists.classList.add('hidden');
    this.dom.mediaLibraryPagePanelList.classList.remove('hidden');
  }
}
