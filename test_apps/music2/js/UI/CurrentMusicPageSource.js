var CurrentMusicPageSource = function(){
  Utils.loadDomIds(this, [
      "currentSourceView",
      "currentSourceInfo",
      "currentSourceImg",

      "nowPlayingControls",
      "nowPlayingInfo",
      "nowPlayingSourceImg"
  ]);
  window.router.on('setInfo', this.setInfo.bind(this));
}

CurrentMusicPageSource.prototype = {
  setInfo: function(source){
    Utils.empty(this.dom.currentSourceInfo);
    Utils.empty(this.dom.nowPlayingInfo);
    this.dom.currentSourceImg.src = '';
    this.dom.nowPlayingSourceImg.src = '';

    if (source === null || source === undefined){
      this.dom.nowPlayingControls.classList.add('hidden');
      return;
    }
    this.dom.nowPlayingControls.classList.remove('hidden');
    source.setInfo(this.dom.currentSourceInfo);
    source.setAlbumArt(this.dom.currentSourceImg);

    source.setInfo(this.dom.nowPlayingInfo);
    source.setAlbumArt(this.dom.nowPlayingSourceImg);
  },
}


