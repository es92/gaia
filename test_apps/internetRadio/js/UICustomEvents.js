var UICustomEvents = {
  onenter: function(elem, fn){
    elem.addEventListener('keypress', function(event){
      if (event.which === 13)
        fn(elem);
    });
  }
}


