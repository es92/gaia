'use strict';

function monitorGrandchildWithTagVisibility(
  container,
  scrollMargin,
  scrollDelta,
  tagName,
  onscreenCallback,
  offscreenCallback
) {
  var tagName = tag.toUpperCase();
  var maxDepth = 2;
  monitorChildVisibility(
    container,
    scrollMargin,
    scrollDelta,
    maxDepth,
    function(elem, depth) {
      if (elem.tagName === tagName && depth == 2)
        onscreenCallback.apply(null, arguments);
    },
    function(elem, depth) {
      if (elem.tagName === tagName && depth == 2)
        offscreenCallback.apply(null, arguments);
    });
}

function monitorChildWithTagVisibility(
  container,
  scrollMargin,
  scrollDelta,
  maxDepth,
  tagName,
  onscreenCallback,
  offscreenCallback
) {
  var tagName = tag.toUpperCase();
  monitorChildVisibility(
    container,
    scrollMargin,
    scrollDelta,
    maxDepth,
    function(elem) {
      if (elem.tagName === tagName)
        onscreenCallback.apply(null, arguments);
    },
    function(elem) {
      if (elem.tagName === tagName)
        offscreenCallback.apply(null, arguments);
    });
}

//returns object containing stop function
function monitorChildVisibility(
  container, 
  scrollMargin, // how close an element needs to be to the container edge to be 
                // considered onscreen
  scrollDelta, // how much the container needs to be scrolled before onscreen
               // and offscreen are recalculated
  maxDepth, // max depth from container to monitor (1 === direct children)
  onscreenCallback, // called with the element that is now onscreen
  offscreenCallback // called with the element that is now offscreen
) {

  //onscreenCallback = function(elem) {
  //  console.log('on', arguments);
  //  elem.style.background = 'blue';
  //}

  //offscreenCallback = function(elem) {
  //  console.log('off', arguments);
  //  elem.style.background = 'red';
  //}

  //var divs = document.getElementsByTagName('div');
  //for (var i = 0; i < divs.length; i++) {
  //  var div = divs[i];
  //  div.onclick = function(e) {
  //    var child = e.target;

  //    var scrollTop = container.scrollTop;
  //    var screenTop = scrollTop - C.scrollMargin;
  //    var screenBottom = scrollTop + container.clientHeight + C.scrollMargin;


  //    var childTop = child.offsetTop;
  //    var childBottom = childTop + child.offsetHeight;
  //    console.log(screenTop, screenBottom, childTop, childBottom);
  //  }
  //}

  if (container.style.position === 'static' || container.style.position === '')
    throw "'position: static' containers not supported, maybe use 'position: relative'?";

  //====================================
  //  init
  //====================================

  const C = {
    scrollDelta: scrollDelta,
    scrollMargin: scrollMargin
  }
  var g = {}; //global state

  function init() {
    g.firstOnscreen = null;
    g.lastOnscreen = null;
    g.pendingCallCallbacksTimeoutId;
    g.last = {
      scrollTop: -1,
      firstOnscreen: null,
      lastOnscreen: null
    }

    //add events that could trigger an element to go onscreen or offscreen
    container.addEventListener('scroll', scrollHandler);
    window.addEventListener('resize', updateVisibility);
    g.observer = new MutationObserver(mutationHandler);
    g.observer.observe(container, { childList: true, subtree: true });

    updateVisibility(true);
  }

  //====================================
  //  event handlers
  //====================================

  function scrollHandler() {
    var scrollTop = container.scrollTop;
    if (Math.abs(scrollTop - g.last.ScrollTop) < C.scrollDelta) {
      return;
    }
    g.last.ScrollTop = scrollTop;

    updateVisibility();
  }

  function mutationHandler(mutations) {
    if (container.clientHeight === 0) { //container hidden
      return;
    }

    if (g.pendingCallCallbacksTimeoutId)
      callCallbacks();

    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      if (mutation.addedNodes) { 
        for (var j = 0; j < mutation.addedNodes.length; j++) {
          var child = mutation.addedNodes[j];
          if (child.nodeType === Node.ELEMENT_NODE) {
            childAdded(child);
          }
        }
      }
      if (mutation.removedNodes) {
        for (var j = 0; j < mutation.removedNodes.length; j++) {
          var child = mutation.removedNodes[j];
          if (child.nodeType === Node.ELEMENT_NODE) {
            childRemoved(child,
                         mutation.previousSibling,
                         mutation.nextSibling);
            
          }
        }
      }
    }
  }

  function childAdded(child) {
    if (
        g.lastOnscreen !== null && 
        after(child, g.lastOnscreen) && //after last onscreen child
        child.offsetTop > container.clientHeight + scrollMargin //not on first page
    ) {
      return;
    }
    else if (g.firstOnScreen === null || after(child, g.firstOnscreen)) {
      safeOnscreenCallback(child);
    }
    recomputeFirstAndLastOnscreen();
    callCallbacks();
  }

  function childRemoved(child, prev, next) {
    if (container.firstElementChild === null) { //container empty
      g.firstOnscreen = g.lastOnscreen = null;
      g.last.firstOnscreen = g.last.lastOnscreen = null;
      return;
    }
    else if (
      g.lastOnscreen !== child && 
      prev !== null && after(prev, g.lastOnscreen)
    ) { //after last onscreen child
      return;
    }
    else {
      if (child === g.firstOnscreen) {
        g.firstOnscreen = next;
      }
      if (child === g.last.firstOnscreen) {
        g.last.firstOnscreen = next;
      }
      if (child === g.lastOnscreen) {
        g.lastOnscreen = prev;
      }
      if (child === g.last.lastOnscreen) {
        g.last.lastOnscreen = prev;
      }
      recomputeFirstAndLastOnscreen();
      callCallbacks();
    }
    
  }

  function updateVisibility(callImmediately) {
    if (container.clientHeight === 0) {
      return;
    }

    recomputeFirstAndLastOnscreen();

    if (callImmediately || scrollDelta >= 1) {
      callCallbacks();
    } 
    else {
      deferCallingCallbacks();
    }
  }

  //====================================
  //  visibility computation
  //====================================

  function recomputeFirstAndLastOnscreen() {
    if (container.firstElementChild === null) { //container empty
      g.firstOnscreen = g.lastOnscreen = null;
      return; 
    }

    if (g.firstOnscreen === null) {
      g.firstOnscreen = container.firstElementChild;
    }
    g.firstOnscreen = recomputeFirstOnscreenSibling(container, g.firstOnscreen);

    if (g.lastOnscreen == null) {
      g.lastOnscreen = g.firstOnscreen;
    }
    g.lastOnscreen = recomputeLastOnscreenSibling(container, g.lastOnscreen);
  }

  function recomputeFirstOnscreenSibling(container, guessOfFirstOnscreen) {
    var currentFirstOnscreen = guessOfFirstOnscreen;
    while (visibilityPosition(container, currentFirstOnscreen) !== BEFORE) {
      var prev = currentFirstOnscreen.previousElementSibling;
      if (prev === null)
        break;
      currentFirstOnscreen = prev;
    }
    while (visibilityPosition(container, currentFirstOnscreen) === BEFORE) {
      var next = currentFirstOnscreen.nextElementSibling;
      if (next === null)
        break;
      currentFirstOnscreen = next;
    }
    return currentFirstOnscreen;
  }

  function recomputeLastOnscreenSibling(container, guessOfLastOnscreen) {
    var currentLastOnscreen = guessOfLastOnscreen;
    while (visibilityPosition(container, currentLastOnscreen) !== AFTER) {
      var next = currentLastOnscreen.nextElementSibling;
      if (next === null)
        break;
      currentLastOnscreen = next;
    }
    while (visibilityPosition(container, currentLastOnscreen) === AFTER) {
      var prev = currentLastOnscreen.previousElementSibling;
      if (prev === null)
        break;
      currentLastOnscreen = prev;
    }
    return currentLastOnscreen;
  }

  //====================================
  //  notification of offscreen / onscreen
  //====================================

  function deferCallingCallbacks() {
    if (g.pendingCallCallbacksTimeoutId !== null) {
      window.clearTimeout(g.pendingCallCallbacksTimeoutId);
    }
    g.pendingCallCallbacksTimeoutId = setTimeout(callCallbacks, 0);
  }

  function callCallbacks() {

    if (g.pendingCallCallbacksTimeoutId !== null) {
      window.clearTimeout(g.pendingCallCallbacksTimeoutId);
      g.pendingCallCallbacksTimeoutId = null;
    }

    if (g.firstOnscreen == null || g.lastOnscreen == null) {

    }
    else if (g.last.firstOnscreen == null || g.last.lastOnscreen == null) {
      notifyOnscreenInRange(g.firstOnscreen, g.lastOnscreen);
    }
    else if (
      before(g.lastOnscreen, g.last.firstOnscreen) ||
      after(g.firstOnscreen, g.last.lastOnscreen)
    ) { //disjoint
      notifyOnscreenInRange(g.firstOnscreen, g.lastOnscreen);
      notifyOffscreenInRange(g.last.firstOnscreen, g.last.lastOnscreen);
    }
    else { //overlapping
      if (before(g.firstOnscreen, g.last.firstOnscreen)) { //onscreen at top
        notifyOnscreenInRange(g.firstOnscreen, g.last.firstOnscreen.previousElementSibling);
      }

      if (after(g.lastOnscreen, g.last.lastOnscreen)) { //onscreen at bottom
        notifyOnscreenInRange(g.last.lastOnscreen.nextElementSibling, g.lastOnscreen);
      }

      if (after(g.firstOnscreen, g.last.firstOnscreen)) { //offscreen at top
        notifyOffscreenInRange(g.last.firstOnscreen, g.firstOnscreen.previousElementSibling);
      }

      if (before(g.lastOnscreen, g.last.lastOnscreen)) { //offscreen at bottom
        notifyOffscreenInRange(g.lastOnscreen.nextElementSibling, g.last.lastOnscreen);
      }

    }

    //g.firstOnscreen.style.background = 'black';
    //g.lastOnscreen.style.background = 'black';
    g.last.firstOnscreen = g.firstOnscreen;
    g.last.lastOnscreen = g.lastOnscreen;
  }

  function notifyOnscreenInRange(start, stop) {
      var curr = start;
      while (curr !== null) {
        safeOnscreenCallback(curr);
        if (curr == stop)
          break;
        curr = curr.nextElementSibling;
      }
  }

  function notifyOffscreenInRange(start, stop) {
      var curr = start;
      while (curr !== null) {
        safeOffscreenCallback(curr);
        if (curr == stop)
          break;
        curr = curr.nextElementSibling;
      }
  }

  //====================================
  //  helpers
  //====================================

  const BEFORE = -1, ON = 0, AFTER = 1;
  function visibilityPosition(container, child) {

    var scrollTop = container.scrollTop;
    var screenTop = scrollTop - C.scrollMargin;
    var screenBottom = scrollTop + container.clientHeight + C.scrollMargin;


    var childTop = child.offsetTop;
    var childBottom = childTop + child.offsetHeight;
    if (childBottom <= screenTop)
      return BEFORE;
    if (childTop >= screenBottom)
      return AFTER;
    return ON;
  }

  function before(a, b) {
    return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  // Return true if node a is after node b and false otherwise
  function after(a, b) {
    return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING);
  }

  function safeOnscreenCallback(child, depth) {
      try {
        onscreenCallback.apply(null, arguments);
      }
      catch (e) {
        console.warn('monitorChildVisiblity: Exception in onscreenCallback:',
                     e, e.stack);
      }
  }

  function safeOffscreenCallback(child, depth) {
      try {
        offscreenCallback.apply(null, arguments);
      }
      catch (e) {
        console.warn('monitorChildVisiblity: Exception in onscreenCallback:',
                     e, e.stack);
      }
  }

  //====================================
  //  cleanup
  //====================================

  function stopMonitoring() {
    container.removeEventListener('scroll', scrollHandler);
    window.removeEventListener('resize', updateVisibility);
    g.observer.disconnect();
  }


  init();

  return {
    stop: stopMonitoring 
  };
}
