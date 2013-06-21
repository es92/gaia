var CurrentMusicPageSource = function(){
  Utils.loadDomIds(this, [
      "currentSourceView",
      "currentSourceInfo",
      "currentSourceImg",

      "nowPlayingText",
      "nowPlayingSourceImg"
  ]);
  window.router.on('setInfo', this.setInfo.bind(this));

  Utils.setupPassEvent(this, 'hideCurrentSourceView');
  Utils.setupPassEvent(this, 'showCurrentSourceView');
}

CurrentMusicPageSource.prototype = {
  setInfo: function(source){
    Utils.empty(this.dom.currentSourceInfo);
    Utils.empty(this.dom.nowPlayingText);
    this.dom.currentSourceImg.src = '';
    this.dom.nowPlayingSourceImg.src = '';

    if (source === null || source === undefined){
      this.hideCurrentSourceView();
      return;
    }
    source.setInfo(this.dom.currentSourceInfo);
    source.setAlbumArt(this.dom.currentSourceImg);

    source.setInfo(this.dom.nowPlayingText);
    source.setAlbumArt(this.dom.nowPlayingSourceImg);

    this.showCurrentSourceView();
  },
}


