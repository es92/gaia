var SeekBar = function(){
  this.init();
  this.total = 0;
  this.current = 0;
}

SeekBar.prototype = {
  init: function(){
    this.dom = {};
    var ids = [
      'seekElapsed',
      'seekBar',
      'seekBarProgress',
      'seekBarIndicator',
      'seekRemaining'
    ];
    for (var i = 0; i < ids.length; i++){
      var id = ids[i];
      this.dom[id] = document.getElementById(id);
    }
  },
  setCurrentTime: function(seconds){
    this.current = seconds;
    this.rerender();
  },
  setTotalTime: function(seconds){
    this.total = seconds;
    this.rerender();
  },
  rerender: function(){
    this.setTime(this.dom.seekElapsed, this.current);
    this.setTime(this.dom.seekRemaining, this.total);

    this.dom.seekBarProgress.min = 0;
    this.dom.seekBarProgress.max = this.total;
    this.dom.seekBarProgress.value = this.current;

    var progressPercent = 0;
    if (this.total !== 0)
      progressPercent = this.current / this.total;
    var x = progressPercent * this.dom.seekBarProgress.offsetWidth - this.dom.seekBarIndicator.offsetWidth/2;
    if (!window.isNaN(x)){
      this.dom.seekBarIndicator.style.transform = 'translateX(' + x + 'px)';
    }
  },
  setTime: function(elem, seconds){
    var mins = Math.floor(seconds/60);
    var secs = seconds % 60;
    if (window.isNaN(mins))
      mins = '--';
    else if (mins < 10)
      mins = '0' + mins;
    if (window.isNaN(secs))
      secs = '--';
    else if (secs < 10)
      secs = '0' + secs;
    elem.innerHTML = mins + ':' + secs;
  }
}
