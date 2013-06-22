var MediaLibraryPageNotifications = function(){
  Utils.loadDomIds(this, [
      'mediaLibraryPagePanelNotifications',
  ]);
  this.dom.panel = this.dom.mediaLibraryPagePanelNotifications;

  this.hideTimeout = null;
}

MediaLibraryPageNotifications.prototype = {
  show: function(time){
    this.dom.panel.classList.remove('up');
    if (this.hideTimeout)
      clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
    if (time){
      this.hideTimeout = setTimeout(function(){
        this.hide();
      }.bind(this), time);
    }
  },
  hide: function(){
    this.dom.panel.classList.add('up');
  },
  empty: function(){
    Utils.empty(this.dom.panel);
  },
  append: function(div){
    this.dom.panel.appendChild(div);
  },
  alert: function(text, time){
    this.empty();
    var div = Utils.classDiv('text');
    div.innerHTML = text;
    this.append(div);
    this.show(time);
  }
}
