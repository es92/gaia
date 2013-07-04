var UIRules = function(ui){
  this.ui = ui;

  this.typeTitleById = {
    gotoSearch: "Search",
    gotoFavorites: "Favorites",
    gotoCountries: "Countries",
    gotoGenres: "Genres"
  };

}

UIRules.prototype = {
  name: 'ui.rules',
  toggleTypes: function(){
    this.ui.dom.types.classList.toggle('hidden');
    this.ui.dom.typeSwitcher.classList.toggle('hide');
  },
  toggleCurrentFavorite: function(){
    this.ui.dom.currentToggleFavorite.classList.toggle('favorited');
  },
  toggleFavorite: function(elem, station){
    elem.classList.toggle('favorited');
    //TODO favorites
  },
  switchType: function(elem){
    this.ui.dom.header.setAttribute('current', elem.id);
    this.toggleTypes();
    this.ui.dom.title.innerHTML = this.typeTitleById[elem.id];
    this.ui.dom.stations.setAttribute('current', this.ui.stationPanelIdById[elem.id]);
  },
  gotoCategory: function(switcherId, category, search){
    var panel = this.ui.getPanelBySwitcherId(switcherId);
    panel.text.innerHTML = category;
    panel.title.classList.remove('hidden');

    this.onsearch(search);

    Utils.empty(panel.items);
  },
  panelBack: function(elem){
    var title = elem.parentNode;
    var panel = elem.parentNode.parentNode;
    title.classList.add('hidden');
    if (panel === this.ui.dom.genreStations)
      this.onswitchType(this.ui.dom.gotoGenres);
    else if (panel === this.ui.dom.countryStations)
      this.onswitchType(this.ui.dom.gotoCountries);
  }
}

