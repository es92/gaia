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

  this.audioPlayer.onplaying = this.ui.setPlaying();
  this.audioPlayer.onpaused = this.ui.setPaused();

  this.ui.rules.ontogglePlay = this.audioPlayer.togglePlay.bind(this.audioPlayer);
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

  },
  switchCountries: function(elem){
    if (this.ui.panelAtSubcategory(this.ui.dom.countryStations)){
      this.ui.setCategories(elem.id, Countries);
    }
  },
  switchGenres: function(elem){
    if (this.ui.panelAtSubcategory(this.ui.dom.genreStations)){
      this.ui.setCategories(elem.id, Genres);
    }
  },
  gotoCategory: function(switcherId, category, search){
    console.log(category);
  }
}

window.addEventListener('load', function(){
  new InternetRadio();
});
