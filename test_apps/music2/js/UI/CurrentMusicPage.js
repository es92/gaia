var CurrentMusicPage = function(){
  this.controls = new CurrentMusicPageControls();
  var currentPlaylistView = document.getElementById('currentPlaylistView');
  this.playlist = new PlaylistView(currentPlaylistView);
  this.source = new CurrentMusicPageSource();
}

CurrentMusicPage.prototype = {

}
