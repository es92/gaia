var ViewEvents = function(){
  Utils.loadDomIds(this, [
      'selectPageContentOverlay',
      'currentMusicContentOverlay',

      'gotoSelectMusicPage',

      'toggleCurrentMusicPageView',

      'nowPlayingInfo'
  ]);

  Utils.setupPassParent(this, 'gotoCurrentMusicPage');
  Utils.setupPassParent(this, 'gotoSelectMusicPage');

  Utils.setupPassParent(this, 'toggleCurrentMusicPageView');

  Utils.onButtonTap(this.dom.toggleCurrentMusicPageView, this.toggleCurrentMusicPageView);

  Utils.onButtonTap(this.dom.nowPlayingInfo, this.gotoCurrentMusicPage);
  Utils.onButtonTap(this.dom.gotoSelectMusicPage, this.gotoSelectMusicPage);


}

ViewEvents.prototype = {

}
