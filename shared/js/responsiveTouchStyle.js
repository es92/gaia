window.addEventListener('load', function(){

  var currTarget = null;
  var touchStartX = 0;
  var touchStartY = 0;


  function activate(target){
    var curr = target;
    while (curr !== null && curr.classList !== undefined){
      curr.classList.add('touchActive');
      curr = curr.parentNode;
    }
    currTarget = target;
  }

  function deactivate(){
    var curr = currTarget;
    while (curr !== null && curr.classList !== undefined){
      curr.classList.remove('touchActive');
      curr = curr.parentNode;
    }
    currTarget = null;
  }

  window.addEventListener('touchstart', function(e){
    activate(e.target);
    touchStartX = e.touches[0].screenX;
    touchStartY = e.touches[0].screenY;
  });

  window.addEventListener('touchend', function(e){
      deactivate();
  });

  window.addEventListener('touchmove', function(e){
    var diffX = touchStartX - e.touches[0].screenX;
    var diffY = touchStartY - e.touches[0].screenY;
    var diff = Math.sqrt(diffX*diffX + diffY*diffy);
    if (diff > 10){
      deactivate();
    }
  });

  window.addEventListener('touchcancel', function(e){
    deactivate();
  });

});

