var CurrentMusicPageControls = function(){
  Utils.loadDomIds(this, [
    "playPrev",
    "togglePlay",
    "playNext",
  ]);
  this.seekBar = new SeekBar();

  this.nowPlaying = new NowPlaying();

  Utils.setupPassParent(this, 'play');
  Utils.setupPassParent(this, 'pause');
  Utils.setupPassParent(this, 'playPrev');
  Utils.setupPassParent(this, 'playNext');

  Utils.onButtonTap(this.dom.playPrev, this.playPrev);
  Utils.onButtonTap(this.dom.playNext, this.playNext);

  this.nowPlaying.ontogglePlaying = this.togglePlaying.bind(this);

  Utils.onButtonTap(this.dom.togglePlay, this.togglePlaying.bind(this));
}

CurrentMusicPageControls.prototype = {
  togglePlaying: function(){
    if (this.dom.togglePlay.classList.contains('pause')){
      this.pause();
    }
    else {
      this.play();
    }
  },
  setPlaying: function(){
    this.dom.togglePlay.classList.add('pause');
    this.nowPlaying.setPlaying();
    this.seekBar.enable();
  },
  setPaused: function(){
    this.dom.togglePlay.classList.remove('pause');
    this.nowPlaying.setPaused();
  },
  disable: function(){
    this.dom.togglePlay.classList.add('disabled');
    this.dom.playPrev.classList.add('disabled');
    this.dom.playNext.classList.add('disabled');

    this.dom.togglePlay.disabled = true;
    this.dom.playPrev.disabled = true;
    this.dom.playNext.disabled = true;
    this.seekBar.disable();

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

