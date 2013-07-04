var UI = function(){
  this.rules = new UIRules(this);
  this.loadDom(); 

  this.stationPanelIdById = {
    gotoSearch: "searchStations",
    gotoFavorites: "favoriteStations",
    gotoCountries: "countryStations",
    gotoGenres: "genreStations"
  };

  Utils.setupPassEvent(this, 'playStation');
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
  
  setCategories: function(switcherId, categories){
    Utils.setupPassEvent(this.rules, 'gotoCategory');
    var stationItems = this.dom[this.stationPanelIdById[switcherId]].querySelector('.stationItems');
    Utils.empty(stationItems);
    for (var category in categories){
      var div = document.createElement('div');
      div.classList.add('tappable');
      div.innerHTML = category;
      stationItems.appendChild(div);
      Utils.makeTappable(div);
      div.ontap = (function(category, search){
        return function(){
          this.rules.gotoCategory(switcherId, category, search);
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
  setStations: function(panel, stations){
    Utils.empty(panel.items);
    var items = stations.map(this.createStationElem.bind(this));
    items.forEach(panel.items.appendChild.bind(panel.items));
  },
  createStationElem: function(station){
    var elem = document.createElement('div');

    var toggleFavorite = document.createElement('div');
    toggleFavorite.classList.add('toggleFavorite');
    toggleFavorite.classList.add('tappable');
    elem.appendChild(toggleFavorite);

    Utils.makeTappable(toggleFavorite);
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
       items: panel.querySelector('.stationItems')
    };
  },
  panelAtSubcategory: function(panel){
    return panel.querySelector('.stationPanelTitle').classList.contains('hidden');
  },
  setStation: function(station){
    this.dom.controls.classList.remove('hidden');
    this.dom.currentTitle.innerHTML = station.title;
  },
  setPlaying: function(){
    this.dom.togglePlay.classList.add('pause');
  },
  setPaused: function(){
    this.dom.togglePlay.classList.remove('pause');
  },
  setBuffering: function(){

  }
}
