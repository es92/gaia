var InternetRadio = function(){

  this.ui = new UI();

  this.ui.rules.onsearch = this.search.bind(this);

  this.switchTable = {
    gotoSearch: "Search",
    gotoFavorites: "Favorites",
    gotoCountries: "Countries",
    gotoGenres: "Genres"
  };

  this.ui.rules.onswitchType = function(elem){
    this['switch' + this.switchTable[elem.id]].apply(this, arguments);
  }.bind(this);

  this.ui.onplayStation = this.playStation.bind(this);

  this.ui.rules.toggleTypes();
  this.ui.rules.switchType(this.ui.dom.gotoGenres);

  this.audioPlayer = new AudioPlayer();

  this.icecast = new IcecastStationSearch();

  this.audioPlayer.onplaying = this.ui.setPlaying.bind(this.ui);
  this.audioPlayer.onpaused = this.ui.setPaused.bind(this.ui);
  this.audioPlayer.onwaiting = this.ui.setBuffering.bind(this.ui);
  this.audioPlayer.onnotWaiting = this.ui.setNotBuffering.bind(this.ui);

  this.ui.rules.ontogglePlay = this.audioPlayer.togglePlay.bind(this.audioPlayer);

  this.favorites = new Favorites();
  this.ui.ongetIsFavorite = this.favorites.isFavorite.bind(this.favorites);
  this.ui.rules.ontoggleFavorite = function(elem, station){
      this.favorites.toggleFavorite(station);
      if (this.currentStation !== null)
        this.ui.setStation(this.currentStation);
  }.bind(this);
  this.ui.rules.ontoggleCurrentFavorite = function(){
    this.favorites.toggleFavorite(this.currentStation);
    this.ui.refreshStations();
    this.switchFavorites();
  }.bind(this);

  this.currentStation = null;
}

InternetRadio.prototype = {
  search: function(query){
    if (query instanceof HTMLInputElement)
      query = [query.value];

    query = query[0]; // TODO support multiple terms
    var panel = this.ui.getPanelBySwitcherId(this.ui.dom.header.getAttribute('current'));
    this.icecast.search(query, function(stations){
      if (stations.length === 0){
        this.ui.setNoStations(panel);
      }
      else {
        this.ui.setStations(panel, stations);
      }
    }.bind(this));
  },
  playStation: function(station){
    this.currentStation = station;
    this.playM3U(station);
  },
  playM3U: function(station){
    this.icecast.getM3UUrl(station.m3u, function(link){
      this.audioPlayer.load(link);
      this.audioPlayer.play();
      this.ui.setStation(station);
    }.bind(this));
  },
  switchSearch: function(elem){

  },
  switchFavorites: function(elem){
    var stations = [];
    for (var title in this.favorites.favorites){
      var station = this.favorites.favorites[title];
      stations.push(station);
    }
    var panel = this.ui.getPanelBySwitcherId("gotoFavorites");
    this.ui.setStations(panel, stations);
  },
  switchCountries: function(elem){
    if (this.ui.isPanelAtCategory(this.ui.dom.countryStations)){
      var panel = this.ui.getPanelBySwitcherId("gotoCountries");
      this.ui.setCategories(panel, Countries);
    }
  },
  switchGenres: function(elem){
    if (this.ui.isPanelAtCategory(this.ui.dom.genreStations)){
      var panel = this.ui.getPanelBySwitcherId("gotoGenres");
      this.ui.setCategories(panel, Genres);
    }
  }
}

window.addEventListener('load', function(){
  new InternetRadio();
});
