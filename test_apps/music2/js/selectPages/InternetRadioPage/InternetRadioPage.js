var InternetRadioPage = function(pageBridge){
  this.pageBridge = pageBridge;
  Utils.loadDomIds(this, [
      'internetRadioPage',
      'selectSourcePages'
  ]);
  this.dom.page = this.dom.internetRadioPage;

  var appendURL = function(url){
    var urlDiv = document.createElement('div');
    urlDiv.innerHTML = url;
    this.dom.page.appendChild(urlDiv);
    Utils.onButtonTap(urlDiv, function(){
      var source = new InternetAudioSource(url);
      this.pageBridge.createTemporaryPlaylistFromSources(url, [ source ]);
    }.bind(this));
  }.bind(this);

  appendURL("http://revolutionradio.ru/live.ogg");
  appendURL("http://streaming208.radionomy.com:80/ABC-Jazz");
  appendURL("http://streaming206.radionomy.com:80/abacusfm-mozart-piano");



}

InternetRadioPage.prototype = {
  name: "Internet Radio",
  activate: function(){
    this.dom.selectSourcePages.removeChild(this.dom.page);
    this.pageBridge.setPageDiv(this.dom.page);
  },
  deactivate: function(){
    this.dom.page.parentNode.removeChild(this.dom.page);
    this.dom.selectSourcePages.appendChild(this.dom.page);
  }
}


