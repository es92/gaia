
var MediaLibraryPagePanel = function(title, subCategories, select, config){
  this.title = title || 'Music Library';
  this.subCategories = subCategories || [
    'Genres',
    'Artists',
    'Albums'
  ];
  this.query = config || {
    'genre': '*',
    'artist': '*',
    'album': '*',
    'song': '*'
  };
  this.select = select;
}

MediaLibraryPagePanel.prototype = {
  getSubcategoryPanel: function(subCategory){
    var config = {};
    config.genre = this.query.genre;
    config.artist = this.query.artist;
    config.album = this.query.album;
    config.song = this.query.song;

    var select = subCategory;
    var title = subCategory;

    var subCategories = [];

    return new MediaLibraryPagePanel(title, subCategories, select, config);
  },
  getItemPanel: function(item, selectOverride){

    var switchSelect = selectOverride || this.select

    var config = {};
    config.genre = this.query.genre;
    config.artist = this.query.artist;
    config.album = this.query.album;
    config.song = this.query.song;
    var select = null;
    var title = item;

    var subCategories = [];

    if (switchSelect === 'Genres'){
      config.genre = item;
      subCategories.push('Artists', 'Albums');
    }
    else if (switchSelect === 'Artists'){
      config.artist = item;
      subCategories.push('Albums');
    }
    else if (switchSelect === 'Albums'){
      config.album = item;
      subCategories.push('Artists');
    }
    else {
      config.song = item;
    }
    return new MediaLibraryPagePanel(title, subCategories, select, config);
  }
}
