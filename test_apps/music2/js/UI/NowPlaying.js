var NowPlaying = function(){
  Utils.loadDomIds(this, [
    "nowPlayingControls",
    "nowPlayingTogglePlay",

    'nowPlayingControls',
    "nowPlayingText",
    "nowPlayingSourceImg"
  ]);

  Utils.setupPassParent(this, 'togglePlaying');

  Utils.onButtonTap(this.dom.nowPlayingTogglePlay, this.togglePlaying);
}

NowPlaying.prototype = {
  show: function(){
    if (this.dom.nowPlayingControls.classList.contains('hidden')){
      this.dom.nowPlayingControls.classList.remove('hidden');
    }
  },
  hide: function(){
    this.dom.nowPlayingControls.classList.add('hidden');
  },
  setSource: function(){

  },
  setPlaying: function(){
    this.dom.nowPlayingTogglePlay.classList.add('pause');
  },
  setPaused: function(){
    this.dom.nowPlayingTogglePlay.classList.remove('pause');
  }
}
