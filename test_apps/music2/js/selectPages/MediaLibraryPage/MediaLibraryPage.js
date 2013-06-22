var MediaLibraryPage = function(pageBridge){
  this.pageBridge = pageBridge;
  Utils.loadDomIds(this, [
      'mediaLibraryPage',
      'selectSourcePages'
  ]);
  this.dom.page = this.dom.mediaLibraryPage;

  this.notifications = new MediaLibraryPageNotifications();

  this.musicDB = new MusicDB();

  this.panelManager = new MediaLibraryPagePanelManager(this.musicDB, this.pageBridge);

  setTimeout(function(){
    if (!this.musicDB.ready){
      var title = document.createElement('div');
      title.innerHTML = 'Loading...';
      this.panelManager.dom.titleText.appendChild(title);
    }
  }.bind(this), 1000);

  this.musicDB.onisReady = function(){
    this.startPanel = new MediaLibraryPagePanel();
    this.panelManager.pushPanel(this.startPanel);
    this.notifications.alert('scanning sd card', 2000);
  }.bind(this);

  this.musicDB.onmusicDeleted = function(event){
    this.notifications.alert('removed: ' + event.detail[0].metadata.title, 2000);
  }.bind(this);

  this.musicDB.onmusicCreated = function(event){
    this.notifications.alert('found: ' + event.detail[0].metadata.title, 2000);
  }.bind(this);

  this.musicDB.onmusicChanged = function(numberCreated, numberDeleted){
    var question = Utils.classDiv('question');
    var text = '';
    if (numberCreated > 0){
      if (numberCreated === 1)
        text += ' song added,<br>'
      else 
        text += numberCreated + ' songs added,<br>'
    }
    if (numberDeleted > 0){
      if (numberDeleted === 1)
        text += '1 song removed,<br>'
      else 
        text += numberDeleted + ' songs removed,<br>'
    }
    text += 'refresh?';
    question.innerHTML = text;
    var yes = Utils.classDiv('yes');
    var no = Utils.classDiv('no');

    this.notifications.empty();
    this.notifications.append(no);
    this.notifications.append(question);
    this.notifications.append(yes);
    this.notifications.show();

    Utils.onButtonTap(yes, function(){
      this.panelManager.refresh();
      this.notifications.hide();
      setTimeout(function(){
        this.notifications.alert('refreshing... (please wait a moment)', 2000);
      }.bind(this), 500);
    }.bind(this));

    Utils.onButtonTap(no, function(){
      this.notifications.hide();
    }.bind(this));
  }.bind(this);

}

MediaLibraryPage.prototype = {
  name: "Music Library",
  unserialize: function(serializedSource){
    return new FileAudioSource(this.musicDB, serializedSource);
  },
  activate: function(){
    this.dom.selectSourcePages.removeChild(this.dom.page);
    this.pageBridge.setPageDiv(this.dom.page);
  },
  deactivate: function(){
    this.dom.page.parentNode.removeChild(this.dom.page);
    this.dom.selectSourcePages.appendChild(this.dom.page);
  }
}
