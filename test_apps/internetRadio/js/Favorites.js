var Favorites = function(){
  this.loadFavorites();
}

Favorites.prototype = {
  isFavorite: function(station){
    return this.favorites[station.title] !== undefined;
  },
  toggleFavorite: function(station){
    if (this.favorites[station.title])
      delete this.favorites[station.title];
    else
      this.favorites[station.title] = station;
    this.saveFavorites();
  },
  loadFavorites: function(){
    if (window.localStorage.favorites){
      this.favorites = JSON.parse(window.localStorage.favorites);
    }
    else {
      this.favorites = {};
      this.saveFavorites();
    }
  },
  saveFavorites: function(){
    window.localStorage.favorites = JSON.stringify(this.favorites);
  }
}
