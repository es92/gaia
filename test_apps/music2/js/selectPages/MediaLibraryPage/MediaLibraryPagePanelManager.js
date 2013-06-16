var MediaLibraryPagePanelManager = function(musicDB, pageBridge){
  this.musicDB = musicDB;
  this.pageBridge = pageBridge;
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

  Utils.onButtonTap(this.dom.mediaLibraryPagePanelPop, this.popPanel.bind(this));
  Utils.onButtonTap(this.dom.mediaLibraryPagePanelAdd, this.add.bind(this));
  Utils.onButtonTap(this.dom.titleText, this.playAll.bind(this));

  this.panels = [];
  this.songs = [];
}

MediaLibraryPagePanelManager.prototype = {
  pushPanel: function(panel){
    this.panels.push(panel);
    this.setPanel(panel);
    if (this.panels.length > 1)
      this.dom.mediaLibraryPagePanelPop.classList.remove('hidden');
  },
  popPanel: function(){
    if (this.panels.length > 1){
      var oldPanel = this.panels.pop();
      if (oldPanel && oldPanel.onunload) 
        oldPanel.onunload();
      this.setPanel(this.panels[this.panels.length-1]);
      if (this.panels.length === 1)
        this.dom.mediaLibraryPagePanelPop.classList.add('hidden');
    }
  },
  add: function(){
    for (var i = 0; i < this.songs.length; i++){
      var song = this.songs[i];
      var source = new FileAudioSource(this.musicDB, song);
      this.pageBridge.enqueueIntoCurrentPlaylist(this.currentTitle, source);
    }
  },
  playAll: function(){
    var sources = [];
    for (var i = 0; i < this.songs.length; i++){
      var song = this.songs[i];
      var source = new FileAudioSource(this.musicDB, song);
      sources.push(source);
    }
    this.pageBridge.createTemporaryPlaylistFromSources(this.currentTitle, sources);
  },
  setPanel: function(panel){
    var genreKnown = panel.query.genre !== '*';
    var artistKnown = panel.query.artist !== '*';
    var albumKnown = panel.query.album !== '*';
    var songKnown = panel.query.song !== '*';

    Utils.empty(this.dom.titleText);
    var title = document.createElement('div');
    title.innerHTML = panel.title;
    this.currentTitle = panel.title 
    this.dom.titleText.appendChild(title);

    this.dom.mediaLibraryPagePanelList.style.top = '4em';

    console.log('\n=====================================================' + '\n' +
    'subCategories: ' + JSON.stringify(panel.subCategories, null, 2) + '\n' +
    'query: ' + JSON.stringify(panel.query, null, 2) + '\n' + 
    'select: ' + panel.select + '\n' + 
    '=====================================================');

    if ((panel.select !== undefined && panel.select !== null) || 
        !(genreKnown || artistKnown || albumKnown || songKnown)
    ){
      this.dom.titleText.disabled = true;
      this.dom.mediaLibraryPagePanelAdd.classList.add('hidden');
    }
    else {
      this.dom.titleText.disabled = false;
      this.dom.mediaLibraryPagePanelAdd.classList.remove('hidden');
    }

    var addSubtitle = function(text){
      var subtitle = document.createElement('div');
      subtitle.innerHTML = text;
      this.dom.titleText.appendChild(subtitle);
    }.bind(this);

    Utils.empty(this.dom.subCategories);
    this.dom.subCategories.classList.add('hidden');
    var subCategoryDivs = {};
    for (var i = 0; i < panel.subCategories.length; i++){
      var subCategory = document.createElement('div');
      this.setupOnClickSubcategory(panel, subCategory);
      subCategory.innerHTML = panel.subCategories[i];
      subCategory.classList.add('gotoPanelButton');
      this.dom.subCategories.appendChild(subCategory);
      subCategoryDivs[panel.subCategories[i]] = subCategory;
    }

    var fields = [];

    var rerenderCategories = function(genres, artists, albums){
      var numArtists = Utils.size(artists);
      var numAlbums = Utils.size(albums);

      if (numAlbums <= 3 && subCategoryDivs.Albums){
        subCategoryDivs.Albums.parentNode.removeChild(subCategoryDivs.Albums);
        if (numAlbums > 1){
          for (var album in albums){
            var subCategory = document.createElement('div');
            this.setupOnClickItem(panel, subCategory, "Albums");
            subCategory.classList.add('gotoPanelButton');
            subCategory.innerHTML = album;
            subCategory.item = album;
            this.dom.subCategories.appendChild(subCategory);
          }
        }
        else {
          for (var album in albums){
            addSubtitle(album);
          }
        }
      }
      if (numArtists <= 3 && subCategoryDivs.Artists){
        subCategoryDivs.Artists.parentNode.removeChild(subCategoryDivs.Artists);
        if (numArtists > 1){
          for (var artist in artists){
            var subCategory = document.createElement('div');
            this.setupOnClickItem(panel, subCategory, "Artists");
            subCategory.classList.add('gotoPanelButton');
            subCategory.innerHTML = artist;
            subCategory.item = artist;
            this.dom.subCategories.appendChild(subCategory);
          }
        }
        else {
          for (var artist in artists){
            addSubtitle(artist);
          }
        }
      }
      this.dom.subCategories.classList.remove('hidden');
    }.bind(this);

    var setItems = function(items){

      var genres = {};
      var artists = {};
      var albums = {};
      for (var i = 0; i < items.length; i++){
        var item = items[i];
        genres[item.metadata.genre] = '';
        artists[item.metadata.artist] = '';
        albums[item.metadata.album] = '';
      }
      rerenderCategories(genres, artists, albums);
      artistKnown |= Utils.size(artists) === 1;
      albumKnown |= Utils.size(albums) === 1;
      console.log();
      this.dom.mediaLibraryPagePanelList.style.top = this.dom.title.clientHeight + 'px'
      setTimeout(function(){
        renderItems(items); 
      }, 0);
    }.bind(this);

    var renderItems = function(items){

      var sortFields = [];
      if (panel.select === 'Genres')
        sortFields.push('genre');
      else if (panel.select === 'Albums')
        sortFields.push('album');
      else if (!panel.select && !genreKnown && !artistKnown && !albumKnown && !songKnown)
        sortFields.push('title');
      else
        sortFields.push('artist', 'album', 'tracknum', 'title');

      items.sort(makeItemSorter(sortFields));
      if (!panel.select){
        this.songs = items;
      }

      var MAX_ITEMS_SYNCHRONOUS = 30; // determined experimentally
      if (items.length > MAX_ITEMS_SYNCHRONOUS){ 
        var i = 0;
        var next = function(){
          if (i >= items.length || panel.title !== this.currentTitle)
            return;
          var item = items[i];
          renderItem(item);
          i++;
          setTimeout(next, 0);
        }.bind(this);
        setTimeout(next, 0);
      }
      else {
        for (var i = 0; i < items.length; i++){
          var item = items[i];
          renderItem(item);
        }
      }
    }.bind(this)

    var renderItem = function(item){
        var div = document.createElement('div');
        var fieldsDiv = document.createElement('div');
        fieldsDiv.classList.add('fields');
        for (var j = 0; j < fields.length; j++){
          if (!panel.select){
            if (genreKnown && fields[j] === 'genre')
              continue;
            if (artistKnown && fields[j] === 'artist')
              continue;
            if (albumKnown && fields[j] === 'album')
              continue;
          }
          var subdiv = document.createElement('div');

          subdiv.innerHTML = item.metadata[fields[j]];
          fieldsDiv.appendChild(subdiv);
        }
        div.appendChild(fieldsDiv);
        if (!panel.select && (artistKnown || albumKnown) && item.metadata.tracknum >= 0){
          var subdiv = document.createElement('div');
          subdiv.classList.add('track');
          subdiv.innerHTML = item.metadata.tracknum;
          div.appendChild(subdiv);
        }
        div.item = item.metadata[fields[0]];
        if (panel.select){
          this.setupOnClickItem(panel, div);
          div.classList.add('gotoPanelButton');
        }
        else {

          this.setupOnSongPlayClick(fieldsDiv, item);

          var addButton = document.createElement('div');
          addButton.classList.add('add');
          div.appendChild(addButton)
          this.setupOnSongAddClick(addButton, item);

          var moreMenu = document.createElement('div');
          moreMenu.classList.add('moreMenu');
          moreMenu.classList.add('hidden');
          div.appendChild(moreMenu);

          function addMoreMenuLink(text){
            var link = document.createElement('div');
            link.classList.add('gotoPanelButton');
            link.classList.add('link');
            link.innerHTML = text;
            moreMenu.appendChild(link);
            return link;
          }

          if (!artistKnown){
            var link = addMoreMenuLink('see artist ' + item.metadata.artist);
            this.setupOnClickLink(panel, link, item.metadata.artist, 'Artists');
          }

          if (!albumKnown){
            var link = addMoreMenuLink('see album ' + item.metadata.album);
            this.setupOnClickLink(panel, link, item.metadata.album, 'Albums');
          }

          if (moreMenu.childNodes.length > 0){
            var moreButton = document.createElement('div');
            moreButton.classList.add('more');
            div.appendChild(moreButton);
            this.setupOnSongMoreClick(moreButton, moreMenu);
            div.classList.add('hasButtons');
          }
        }
        this.dom.items.appendChild(div);
    }.bind(this);

    function strCmp(a, b){
      if (a < b)
        return -1;
      else if (a > b)
        return 1;
      return 0;
    }

    function makeItemSorter(fields){
      return function(a, b){
        for (var i = 0; i < fields.length; i++){
          var field = fields[i];
          if (a.metadata[field] !== b.metadata[field])
            return strCmp(a.metadata[field], b.metadata[field]);
        }
        return false;
      }
    }

    Utils.empty(this.dom.items);
    if (panel.select === 'Genres'){
      fields.push('genre');
      this.musicDB.getGenres(setItems);
    }
    else if (panel.select === 'Artists'){
      fields.push('artist');
      this.musicDB.getArtists(panel.query.genre, setItems);
    }
    else if (panel.select === 'Albums'){
      fields.push('album', 'artist');
      this.musicDB.getAlbums(
        panel.query.genre, 
        panel.query.artist, 
        setItems);
    }
    else {
      fields.push('title', 'artist', 'album');
      this.musicDB.getSongs(
          panel.query.genre, 
          panel.query.artist,
          panel.query.album,
          setItems);
    }

  },
  setupOnClickSubcategory: function(panel, subCategoryDiv){
    Utils.onButtonTap(subCategoryDiv, function(){
      var subCategory = subCategoryDiv.innerHTML;
      var newPanel = panel.getSubcategoryPanel(subCategory);
      this.pushPanel(newPanel);
    }.bind(this));
  },
  setupOnClickItem: function(panel, itemDiv, selectOverride){
    Utils.onButtonTap(itemDiv, function(){
      var item = itemDiv.item;
      var newPanel = panel.getItemPanel(item, selectOverride);
      this.pushPanel(newPanel);
    }.bind(this));
  },
  setupOnClickLink: function(panel, link, item, type){
    Utils.onButtonTap(link, function(){
      var newPanel = panel.getItemPanel(item, type);
      this.pushPanel(newPanel);
    }.bind(this));
  },
  setupOnSongAddClick: function(addButton, song){
    Utils.onButtonTap(addButton, function(){
      var source = new FileAudioSource(this.musicDB, song);
      this.pageBridge.enqueueIntoCurrentPlaylist(song.metadata.title, source);
    }.bind(this));
  },
  setupOnSongPlayClick: function(playButton, song){
    Utils.onButtonTap(playButton, function(){
      var source = new FileAudioSource(this.musicDB, song);
      this.pageBridge.createTemporaryPlaylistFromSources(song.metadata.title, [ source ]);
    }.bind(this));
  },
  setupOnSongMoreClick: function(moreButton, moreMenu){
    Utils.onButtonTap(moreButton, function(){
      moreMenu.classList.toggle('hidden');
      moreButton.classList.toggle('unhide');
    }.bind(this));
  }
}
