var UI = function(){
  this.rules = new UIRules(this);
  this.loadDom(); 

  this.stationPanelIdById = {
    gotoSearch: "searchStations",
    gotoFavorites: "favoriteStations",
    gotoCountries: "countryStations",
    gotoGenres: "genreStations"
  };

  this.stationsById = {};

  Utils.setupPassEvent(this, 'playStation');
  Utils.setupPassEvent(this, 'getIsFavorite');
}

UI.prototype = {
  loadDom: function(){
    this.dom = {};
    this.tapManagers = {};
    var elems = document.querySelectorAll('[id]');
    for (var i = 0; i < elems.length; i++){
      var elem = elems[i];
      if (!elem.name)
        elem.name = elem.id;
      if (elem.classList.contains('tappable'))
        this.tapManagers[elem.id] = Utils.makeTappable(elem);
      this.setupRules(elem);
      this.dom[elem.id] = elem;
    }
  },
  setupRules: function(elem){
    if (!elem.hasAttribute('rules'))
      return;
    var rules = elem.getAttribute('rules').split(';');
    rules = rules.map(function(rule){
      var eventName = rule.split(':')[0];
      var ruleName = rule.split(':')[1];
      Utils.setupPassEvent(this.rules, ruleName);
      var fn = function(){
        var args = Array.prototype.slice.call(arguments);
        args.unshift(elem);
        this.rules[ruleName].apply(this.rules, args); 
      }.bind(this);
      if (UICustomEvents[eventName]){
        UICustomEvents[eventName](elem, fn);
      }
      else {
        elem[eventName] = fn;
      }
    }.bind(this));
  },
  
  setCategories: function(panel, categories){
    Utils.setupPassEvent(this.rules, 'gotoCategory');
    this.stationsById[panel.id] = null;
    Utils.empty(panel.items);
    for (var category in categories){
      var div = document.createElement('div');
      div.classList.add('tappable');
      div.innerHTML = category;
      panel.items.appendChild(div);
      Utils.makeTappable(div);
      div.ontap = (function(category, search){
        return function(){
          this.rules.gotoCategory(panel, category, search);
        }.bind(this);
      }.bind(this))(category, categories[category]);
    }
  },
  setNoStations: function(panel){
    var text = document.createElement('div');
    text.classList.add('text');
    text.innerHTML = 'no stations found';
    Utils.empty(panel.items);
    panel.items.appendChild(text);
  },
  refreshStations: function(){
    for (var id in this.stationsById){
      var stations = this.stationsById[id];
      if (stations === null)
        continue;
      var panel = this.getPanelBySwitcherId(id);
      this.setStations(panel, stations);
    }
  },
  setStations: function(panel, stations){
    Utils.empty(panel.items);
    this.stationsById[panel.id] = stations;
    var items = stations.map(this.createStationElem.bind(this));
    items.forEach(panel.items.appendChild.bind(panel.items));
  },
  createStationElem: function(station){
    var elem = document.createElement('div');

    var toggleFavorite = document.createElement('div');
    toggleFavorite.classList.add('toggleFavorite');
    toggleFavorite.classList.add('tappable');
    elem.appendChild(toggleFavorite);
    if (this.getIsFavorite(station))
      toggleFavorite.classList.add('favorited');

    Utils.makeTappable(toggleFavorite);
    Utils.setupPassEvent(this.rules, 'toggleFavorite');
    toggleFavorite.ontap = function(){
      this.rules.toggleFavorite(toggleFavorite, station);
    }.bind(this);


    var text = document.createElement('div');
    text.classList.add('tappable');
    text.classList.add('text');
    text.innerHTML = station.title;
    elem.appendChild(text);

    Utils.makeTappable(text);
    text.ontap = function(){
      this.playStation(station);
    }.bind(this);


    return elem;
  },
  getPanelBySwitcherId: function(id){
    var panel = this.dom[this.stationPanelIdById[id]];
    var title = panel.querySelector('.stationPanelTitle');
    var text = title && title.querySelector('.text');
    var back = title && title.querySelector('.back');
    return {
       title: title,
       text: text,
       back: back,
       items: panel.querySelector('.stationItems'),
       id: id
    };
  },
  isPanelAtCategory: function(panel){
    return panel.querySelector('.stationPanelTitle').classList.contains('hidden');
  },
  setStation: function(station){
    this.dom.controls.classList.remove('hidden');
    this.dom.currentToggleFavorite.classList.remove('favorited');
    if (this.getIsFavorite(station))
      this.dom.currentToggleFavorite.classList.add('favorited');
    this.dom.currentTitle.innerHTML = station.title;
  },
  setPlaying: function(){
    this.dom.togglePlay.classList.add('pause');
    this.dom.togglePlay.classList.remove('buffering');
  },
  setPaused: function(){
    this.dom.togglePlay.classList.remove('pause');
  },
  setBuffering: function(){
    this.dom.togglePlay.classList.add('buffering');
  },
  setNotBuffering: function(){
    this.dom.togglePlay.classList.remove('buffering');
  }
}
