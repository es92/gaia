var CurrentMusicPageSource = function(){
  Utils.loadDomIds(this, [
      "currentSourceView",
      "currentSourceInfo",
      "currentSourceImg"
  ]);
  window.router.on('setInfo', this.setInfo.bind(this));
}

CurrentMusicPageSource.prototype = {
  setInfo: function(source){
    Utils.empty(this.dom.currentSourceInfo);
    if (source === null)
      return;
    source.setInfo(this.dom.currentSourceInfo);
    source.setAlbumArt(this.dom.currentSourceImg);
  }
}


