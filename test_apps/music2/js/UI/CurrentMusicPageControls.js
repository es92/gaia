var CurrentMusicPageControls = function(){
  Utils.loadDomIds(this, [
      "playPrev",
      "togglePlay",
      "playNext"
  ]);
  this.seekBar = new SeekBar();

  Utils.setupPassEvent(this, 'playPrev');
  Utils.setupPassEvent(this, 'playNext');

  Utils.onButtonTap(this.dom.playPrev, this.playPrev);
  Utils.onButtonTap(this.dom.playNext, this.playNext);

  Utils.onButtonTap(this.dom.togglePlay, function(){
    if (this.dom.togglePlay.classList.contains('pause')){
      if (this.onpause)
        this.onpause();
    }
    else {
      if (this.onplay)
        this.onplay();
    }
  }.bind(this));
}

CurrentMusicPageControls.prototype = {
  setPlaying: function(){
    this.dom.togglePlay.classList.add('pause');
  },
  setPaused: function(){
    this.dom.togglePlay.classList.remove('pause');
  },
  disable: function(){
    this.dom.togglePlay.classList.add('disabled');
    this.dom.playPrev.classList.add('disabled');
    this.dom.playNext.classList.add('disabled');

    this.dom.togglePlay.disabled = true;
    this.dom.playPrev.disabled = true;
    this.dom.playNext.disabled = true;
  },
  enable: function(){
    this.dom.togglePlay.classList.remove('disabled');
    this.dom.playPrev.classList.remove('disabled');
    this.dom.playNext.classList.remove('disabled');

    this.dom.togglePlay.disabled = false;
    this.dom.playPrev.disabled = false;
    this.dom.playNext.disabled = false;
  }
}
