var MediaLibraryPagePanelView = function(musicDB, panel){

  this.musicDB = musicDB;
  Utils.loadDomIds(this, [
      "mediaLibraryPagePanel",
      "mediaLibraryPagePanelTitle",
      "mediaLibraryPagePanelTitleText",
      "mediaLibraryPagePanelList",
      "mediaLibraryPagePanelSubCategories",
      "mediaLibraryPagePanelItems",
      "mediaLibraryPagePanelPop",
      "mediaLibraryPagePanelAdd"
  ]);

  this.dom.panel = this.dom.mediaLibraryPagePanel;
  this.dom.title = this.dom.mediaLibraryPagePanelTitle;
  this.dom.titleText = this.dom.mediaLibraryPagePanelTitleText;
  this.dom.subCategories = this.dom.mediaLibraryPagePanelSubCategories;
  this.dom.items = this.dom.mediaLibraryPagePanelItems;

  this.dom.itemList = new UIItemList(this.dom.items);

  this.inactive = false;

  this.genreKnown = panel.query.genre !== '*';
  this.artistKnown = panel.query.artist !== '*';
  this.albumKnown = panel.query.album !== '*';
  this.songKnown = panel.query.song !== '*';

  Utils.setupPassEvent(this, 'gotoSubcategory');
  Utils.setupPassEvent(this, 'gotoItem');
  Utils.setupPassEvent(this, 'playSong');
  Utils.setupPassEvent(this, 'addSong');
  
  this.panel = panel;

  this.songs = [];

  console.log('\n=====================================================' + '\n' +
  'query: ' + JSON.stringify(this.panel.query, null, 2) + '\n' + 
  'select: ' + this.panel.select + '\n' + 
  '=====================================================');

  this.setPanel();
}

MediaLibraryPagePanelView.prototype = {
  setPanel: function(){

    this.setTitle();
    this.setSubcategories();

    this.fields = [];


    this.dom.itemList.empty();
    if (this.panel.select === 'Genres'){
      this.fields.push('genre');
      this.musicDB.getGenres(this.setItems.bind(this));
    }
    else if (this.panel.select === 'Artists'){
      this.fields.push('artist');
      this.musicDB.getArtists(this.panel.query.genre, this.setItems.bind(this));
    }
    else if (this.panel.select === 'Albums'){
      this.fields.push('album', 'artist');
      this.musicDB.getAlbums(
        this.panel.query.genre, 
        this.panel.query.artist, 
        this.setItems.bind(this));
    }
    else {
      this.fields.push('title', 'artist', 'album');
      this.musicDB.getSongs(
          this.panel.query.genre, 
          this.panel.query.artist,
          this.panel.query.album,
          this.setItems.bind(this));
    }

  },
  setTitle: function(){
    Utils.empty(this.dom.titleText);
    var title = document.createElement('div');
    title.innerHTML = this.panel.title;
    this.currentTitle = this.panel.title 
    this.dom.titleText.appendChild(title);

    this.dom.mediaLibraryPagePanelList.style.top = '4em';

    if ((this.panel.select !== undefined && this.panel.select !== null) || 
        !(this.genreKnown || this.artistKnown || this.albumKnown || this.songKnown)
    ){
      this.dom.titleText.disabled = true;
      this.dom.mediaLibraryPagePanelAdd.classList.add('hidden');
    }
    else {
      this.dom.titleText.disabled = false;
      this.dom.mediaLibraryPagePanelAdd.classList.remove('hidden');
    }
  },
  addSubtitle: function(text){
    var subtitle = document.createElement('div');
    subtitle.innerHTML = text;
    this.dom.titleText.appendChild(subtitle);
  },
  setSubcategories: function(){
    Utils.empty(this.dom.subCategories);
    this.dom.subCategories.classList.add('hidden');

    this.subCategoryDivs = {};

    if (this.panel.select === null){
      if (!this.genreKnown && (!this.albumKnown && !this.artistKnown && !this.songKnown)){
        this.addSubCategory('Genres');
      }
      if (!this.artistKnown){
        this.addSubCategory('Artists');
      }
      if (!this.albumKnown){
        this.addSubCategory('Albums');
      }
    }
  },
  addSubCategory: function(text){
    var subCategory = document.createElement('div');
    Utils.onButtonTap(subCategory, function(){
      this.gotoSubcategory(text);
    }.bind(this));
    subCategory.innerHTML = text;
    subCategory.classList.add('gotoPanelButton');
    this.dom.subCategories.appendChild(subCategory);
    this.subCategoryDivs[text] = subCategory;
  },
  setItems: function(items){
    var genres = {};
    var artists = {};
    var albums = {};
    for (var i = 0; i < items.length; i++){
      var item = items[i];
      genres[item.metadata.genre] = '';
      artists[item.metadata.artist] = '';
      albums[item.metadata.album] = '';
    }
    this.rerenderCategories(genres, artists, albums);
    this.artistKnown |= Utils.size(artists) === 1;
    this.albumKnown |= Utils.size(albums) === 1;

    var titleHeight = this.dom.title.clientHeight;
    if (titleHeight !== 0)
      this.dom.mediaLibraryPagePanelList.style.top = titleHeight + 'px'

    setTimeout(function(){
      this.renderItems(items); 
    }.bind(this), 0);
  },
  renderItems: function(items){
    var sortFields = [];
    if (this.panel.select === 'Genres')
      sortFields.push('genre');
    else if (this.panel.select === 'Albums')
      sortFields.push('album');
    else if (!this.panel.select && !this.genreKnown && !this.artistKnown && !this.albumKnown && !this.songKnown)
      sortFields.push('title');
    else
      sortFields.push('artist', 'album', 'tracknum', 'title');

    items.sort(this.makeItemSorter(sortFields));
    if (!this.panel.select){
      this.songs = items;
    }

    var MAX_ITEMS_SYNCHRONOUS = 30; // determined experimentally
    if (items.length > MAX_ITEMS_SYNCHRONOUS){ 
      var i = 0;
      var next = function(){
        if (i >= items.length || this.inactive)
          return;
        var item = items[i];
        this.renderItem(item);
        i++;
        setTimeout(next, 0);
      }.bind(this);
      setTimeout(next, 0);
    }
    else {
      for (var i = 0; i < items.length; i++){
        var item = items[i];
        this.renderItem(item);
      }
    }
  },
  renderItem: function(item){
    var content = document.createElement('div');
    content.classList.add('fields');
    for (var j = 0; j < this.fields.length; j++){
      if (!this.panel.select){
        if (this.genreKnown && this.fields[j] === 'genre')
          continue;
        if (this.artistKnown && this.fields[j] === 'artist')
          continue;
        if (this.albumKnown && this.fields[j] === 'album')
          continue;
      }
      var fieldDiv = document.createElement('div');
      fieldDiv.innerHTML = item.metadata[this.fields[j]];
      content.appendChild(fieldDiv);
    }

    var icon = null;
    if (!this.panel.select && (this.artistKnown || this.albumKnown) && item.metadata.tracknum >= 0){
      var icon = document.createElement('div');
      icon.classList.add('track');
      icon.innerHTML = item.metadata.tracknum;
    }

    if (this.panel.select){
      var gotoPanelButton = Utils.classDiv('gotoPanelButton');
      var target = item.metadata[this.fields[0]];
      Utils.onButtonTap(gotoPanelButton, function(){
        this.gotoItem(target);
      }.bind(this));
      gotoPanelButton.appendChild(content);

      var item = new UIItem(null, gotoPanelButton, null, null);
      this.dom.itemList.append(item);
    }
    else {
      Utils.onButtonTap(content, function(){
        this.playSong(item);
      }.bind(this));

      var add = Utils.classDiv('add');
      Utils.onButtonTap(add, function(){
        this.addSong(item);
      }.bind(this));

      var more = null;
      if (!this.artistKnown || !this.albumKnown){
        more = document.createElement('div');
        function addMoreMenuLink(text){
          var link = Utils.classDiv('gotoPanelButton', 'link');
          link.innerHTML = text;
          more.appendChild(link);
          return link;
        }
        if (!this.artistKnown){
          var link = addMoreMenuLink('see artist ' + item.metadata.artist);
          //this.manager.setupOnClickLink(this.panel, link, item.metadata.artist, 'Artists');
        }

        if (!this.albumKnown){
          var link = addMoreMenuLink('see album ' + item.metadata.album);
          //this.manager.setupOnClickLink(this.panel, link, item.metadata.album, 'Albums');
        }
      }
      else {
        content.classList.add('canGoMin');
      }

      var uiItem = new UIItem(icon, content, more, add);
      this.dom.itemList.append(uiItem);

    }
  },
  rerenderCategories: function(genres, artists, albums){
    var numArtists = Utils.size(artists);
    var numAlbums = Utils.size(albums);

    if (numAlbums <= 3 && this.subCategoryDivs.Albums){
      this.subCategoryDivs.Albums.parentNode.removeChild(this.subCategoryDivs.Albums);
      if (numAlbums > 1){
        for (var album in albums){
          var subCategory = document.createElement('div');
          Utils.onButtonTap(subCategory, function(){
            this.gotoItem(album, 'Albums');
          }.bind(this));
          subCategory.classList.add('gotoPanelButton');
          subCategory.innerHTML = album;
          subCategory.item = album;
          this.dom.subCategories.appendChild(subCategory);
        }
      }
      else {
        for (var album in albums){
          this.addSubtitle(album);
        }
      }
    }
    if (numArtists <= 3 && this.subCategoryDivs.Artists){
      this.subCategoryDivs.Artists.parentNode.removeChild(this.subCategoryDivs.Artists);
      if (numArtists > 1){
        for (var artist in artists){
          var subCategory = document.createElement('div');
          Utils.onButtonTap(subCategory, function(){
            this.gotoItem(artist, 'Artists');
          }.bind(this));
          subCategory.classList.add('gotoPanelButton');
          subCategory.innerHTML = artist;
          subCategory.item = artist;
          this.dom.subCategories.appendChild(subCategory);
        }
      }
      else {
        for (var artist in artists){
          this.addSubtitle(artist);
        }
      }
    }
    this.dom.subCategories.classList.remove('hidden');
  },
  makeItemSorter: function(fields){
    return function(a, b){
      for (var i = 0; i < fields.length; i++){
        var field = fields[i];
        if (a.metadata[field] !== b.metadata[field])
          return Utils.strCmp(a.metadata[field], b.metadata[field]);
      }
      return false;
    }
  }
}
