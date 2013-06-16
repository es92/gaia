var MusicDB = function(){
  this.db = new MediaDB('music', parseAudioMetadata, {
    indexes: ['metadata.album', 'metadata.artist', 'metadata.title', 'metadata.genre',
              'metadata.rated', 'metadata.played', 'date'],
    batchSize: 1,
    autoscan: false, // We call scan() explicitly after listing music we know
    version: 2
  });
  this.getFile = this.db.getFile.bind(this.db);

  this.cache = {};

  this.ready = false;

  this.db.onunavailable = function(event) {
    console.log('unavailable');
  };

  this.db.oncardremoved = function(event){
    console.log('removed');
  };

  this.db.onready = function() {
    console.log('ready');
    this.db.scan();
  }.bind(this);

  this.db.onscanstart = function() {
    console.log('scanstart');
  };

  this.db.onscanend = function() {
    console.log('scanend');
    this.ready = true;
  }.bind(this);

  this.db.oncreated = function(event) {
    console.log('created');
  };

  this.db.ondeleted = function(event) {
    console.log('deleted');
  };
}

MusicDB.prototype = {
  getGenres: function(done){
    if (!this.ready){
      setTimeout(function(){ this.getGenres(done); }.bind(this), 100);
      return;
    }
    this.db.enumerateAll('metadata.genre', null, 'nextunique', 
        function(items){
          var genres = [];
          for (var i = 0; i < items.length; i++){
            var item = items[i];
            genres.push(item);
          }
          done(genres);
        }.bind(this));
  },
  getArtists: function(genre, done){
    if (!this.ready){
      setTimeout(function(){ this.getArtists(genre, done); }.bind(this), 100);
      return;
    }
    this.db.enumerateAll('metadata.artist', null, 'nextunique', 
        function(items){
          var artists = [];
          for (var i = 0; i < items.length; i++){
            var item = items[i];
            if (genre === '*' || item.metadata.genre === genre){
              artists.push(item);
            }
          }
          done(artists);
        }.bind(this));
  },
  getAlbums: function(genre, artist, done){
    if (!this.ready){
      setTimeout(function(){ this.getAlbums(genre, artist, done); }.bind(this), 100);
      return;
    }
    this.db.enumerateAll('metadata.album', null, 'nextunique', 
        function(items){
          var albums = [];
          for (var i = 0; i < items.length; i++){
            var item = items[i];
            if (
              (genre === '*' || item.metadata.genre === genre) &&
              (artist === '*' || item.metadata.artist === artist)
            ){
              albums.push(item);
            }
          }
          done(albums);
        }.bind(this));

  },
  getSongs: function(genre, artist, album, done){
    if (!this.ready){
      setTimeout(function(){ this.getSongs(genre, artist, album, done); }.bind(this), 100);
      return;
    }
    var cacheKey = window.escape(genre) + ' ' + window.escape(artist) + ' ' + window.escape(album);
    var cached = this.cache[cacheKey];
    if (cached !== undefined){
      setTimeout(function(){
        done(cached);
      }, 0);
      return;
    }
    this.db.enumerateAll('metadata.title', null, 'nextunique', 
        function(items){
          var songs = [];
          for (var i = 0; i < items.length; i++){
            var item = items[i];
            if (
              (genre === '*' || item.metadata.genre === genre) &&
              (artist === '*' || item.metadata.artist === artist) &&
              (album === '*' || item.metadata.album === album)
            ){
              songs.push(item);
            }
          }
          this.cache[cacheKey] = songs;
          done(songs);
        }.bind(this));
  },
  getSong: function(title, done){
    if (!this.ready){
      setTimeout(function(){ this.getSong(title, done); }.bind(this), 100);
      return;
    }
    this.db.enumerateAll('metadata.title', null, 'nextunique', 
        function(items){
          for (var i = 0; i < items.length; i++){
            var item = items[i];
            if (item.metadata.title === title){
              done(item);
              return;
            }
          }
          done(null);
        }.bind(this));
  },
  getAlbumArtAsURL: function(song, done){
    if (!this.ready){
      setTimeout(function(){ this.getAlbumArtAsURL(song, done); }.bind(this), 100);
      return;
    }
    getThumbnailURL(song, done);
  }
}
