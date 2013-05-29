'use strict';

//====================================
//  useful implementations / examples
//====================================

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

function monitorDirectChildVisibility(
  container,
  scrollMargin,
  scrollDelta,
  onscreenCallback,
  offscreenCallback
) {
  monitorChildVisibility( container, 
                          scrollMargin, 
                          scrollDelta, 
                          1, 
                          onscreenCallback, 
                          offscreenCallbach);
}

//====================================
//  MonitorChildVisibility
//    generalized function to watch children of a container at any depth level
//    returns object containing stop function
//====================================

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

  if (container.style.position === 'static' || container.style.position === '')
    throw "'position: static' containers not supported, maybe use 'position: relative'?";

  //====================================
  //  init
  //====================================

  var C = {
    scrollDelta: scrollDelta,
    scrollMargin: scrollMargin
  }
  var g = {}; //global state

  function init() {
    g.firstOnscreen = new Array(maxDepth);
    g.lastOnscreen = new Array(maxDepth);
    g.deepestFirstOnscreen = null;
    g.deepestLastOnscreen = null;
    for (var i = 0; i < maxDepth; i++){
      g.firstOnscreen[i] = null;
      g.lastOnscreen[i] = null;
    }
    g.pendingCallCallbacksTimeoutId;
    g.last = {
      scrollTop: -1,
      firstOnscreen: g.firstOnscreen.slice(0),
      lastOnscreen: g.lastOnscreen.slice(0),
      deepestFirstOnscreen: null,
      deepestLastOnscreen: null,
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
    //TODO
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
    //TODO
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
      for (var i = 0; i < maxDepth; i++){
        g.firstOnscreen[i] = null;
        g.lastOnscreen[i] = null;
      }
      return; 
    }

    var currentContainer = container;
    for (var i = 0; i < maxDepth; i++){
      if (g.firstOnscreen[i] === null) {
        g.firstOnscreen[i] = currentContainer.firstElementChild;
        if (g.firstOnscreen[i] === null)
          break;
      }
      var nextFirstOnscreen = recomputeFirstOnscreenSibling(container, g.firstOnscreen[i]);
      if (nextFirstOnscreen !== g.firstOnscreen[i]){
        g.firstOnscreen[i] = nextFirstOnscreen;
        for (var j = i+1; j < maxDepth; j++){
          g.firstOnscreen[j] = null;
        }
      }
      currentContainer = g.firstOnscreen[i];
    }

    currentContainer = container;
    for (var i = 0; i < maxDepth; i++) {
      if (g.lastOnscreen[i] === null) {
        g.lastOnscreen[i] = currentContainer.firstElementChild;
        if (g.lastOnscreen[i] === null)
          break;
      }
      var nextLastOnscreen = recomputeLastOnscreenSibling(container, g.lastOnscreen[i]);
      if (nextLastOnscreen !== g.lastOnscreen[i]) {
        g.lastOnscreen[i] = nextLastOnscreen;
        for (var j = i+1; j < maxDepth; j++){
          g.lastOnscreen[j] = null;
        }
      }
      currentContainer = g.lastOnscreen[i];
    }
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

    calcDeepestOnscreen();

    if (g.deepestFirstOnscreen === null || g.deepestLastOnscreen === null) {

    }
    else if (g.last.deepestFirstOnscreen === null || g.last.deepestLastOnscreen === null) {
      notifyOnscreenInRange(g.deepestFirstOnscreen, g.deepestLastOnscreen, ON);
    }
    else if (
      before(g.deepestLastOnscreen, g.last.deepestFirstOnscreen) ||
      after(g.deepestFirstOnscreen, g.last.deepestLastOnscreen)
    ) { //disjoint
      notifyOnscreenInRange(g.deepestFirstOnscreen, g.deepestLastOnscreen, ON);
      notifyOffscreenInRange(g.last.deepestFirstOnscreen, g.last.deepestLastOnscreen, ON);
    }
    else { //overlapping
      if (before(g.deepestFirstOnscreen, g.last.deepestFirstOnscreen)) { //onscreen at top
        var cousin = prevElementCousin(g.last.deepestFirstOnscreen);
        notifyOnscreenInRange(g.deepestFirstOnscreen, cousin, BEFORE);
        var closestPrev = prevElement(g.last.deepestFirstOnscreen);
        if (closestPrev !== cousin)
          notifyOnscreenInRange(cousin, closestPrev, BEFORE);
      }

      if (after(g.deepestLastOnscreen, g.last.deepestLastOnscreen)) { //onscreen at bottom
        var cousin = nextElementCousin(g.last.deepestLastOnscreen)
        notifyOnscreenInRange(cousin, g.deepestLastOnscreen, AFTER);
        var closestNext = nextElement(g.last.deepestLastOnscreen);
        if (closestNext !== cousin)
          notifyOnscreenInRange(closestNext, cousin, AFTER);
      }

      if (after(g.deepestFirstOnscreen, g.last.deepestFirstOnscreen)) { //offscreen at top
        var cousin = prevElementCousin(g.deepestFirstOnscreen);
        notifyOffscreenInRange(g.last.deepestFirstOnscreen, cousin, BEFORE);
        var closestPrev = prevElement(g.deepestFirstOnscreen);
        if (closestPrev !== cousin)
          notifyOffscreenInRange(cousin, closestPrev, BEFORE);
      }

      if (before(g.deepestLastOnscreen, g.last.deepestLastOnscreen)) { //offscreen at bottom
        var cousin = nextElementCousin(g.deepestLastOnscreen)
        notifyOffscreenInRange(cousin, g.last.deepestLastOnscreen, AFTER);
        var closestNext = nextElement(g.deepestLastOnscreen);
        if (closestNext !== cousin)
          notifyOffscreenInRange(closestNext, cousin, AFTER);
      }

    }

    g.last.firstOnscreen = g.firstOnscreen.slice(0);
    g.last.lastOnscreen = g.lastOnscreen.slice(0);
    g.last.deepestFirstOnscreen = g.deepestFirstOnscreen;
    g.last.deepestLastOnscreen = g.deepestLastOnscreen;
  }

  function notifyOnscreenInRange(start, stop, boundDir) {
    runInRange(start, stop, boundDir, safeOnscreenCallback);
  }

  function notifyOffscreenInRange(start, stop, boundDir) {
    runInRange(start, stop, boundDir, safeOffscreenCallback);
  }

  function runInRange(start, stop, boundDir, fn) {
    var curr = start;
    var currDepth = getDistance(container, curr);
    var justAscended = false;
    while (curr !== stop){
      if ((boundDir === BEFORE && curr.offsetTop + curr.clientHeight <= stop.offsetTop + stop.clientHeight) ||
          (boundDir === AFTER && curr.offsetTop >= start.offsetTop) ||
          (boundDir === ON)){
        fn(curr);
      }
      if (currDepth <= 0){
        break;
      }
      else if (currDepth < maxDepth && !justAscended){
        var child = curr.firstElementChild;
        if (child !== null){
          curr = child;
          currDepth += 1;
          continue;
        }
      }
      var sibling = curr.nextElementSibling;
      if (sibling !== null){
        curr = sibling;
        justAscended = false;
      }
      else {
        curr = curr.parentNode;
        currDepth -= 1;
        justAscended = true;
      }
    }
    fn(stop);
  }

  //====================================
  //  dom helpers
  //====================================

  var BEFORE = -1, ON = 0, AFTER = 1;
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

  function after(a, b) {
    return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING);
  }

  function getDistance(parent, child) {
    var depth = 0;
    var curr = child;
    while (curr !== parent) {
      depth += 1;
      curr = curr.parentNode;
    }
    return depth;
  }

  function prevElement(elem){
    var curr = elem;
    var prev = curr.previousElementSibling;
    while (prev === null){
      curr = curr.parentNode;
      prev = curr.previousElementSibling;
    }
    return prev;
  }

  function nextElement(elem){
    var curr = elem;
    var next = curr.nextElementSibling;
    while (next === null){
      curr = curr.parentNode;
      next = curr.nextElementSibling;
    }
    return next;
  }

  function prevElementCousin(elem){
    var curr = elem;
    var depth = 0;
    var prev = curr.previousElementSibling;
    while (prev === null){
      curr = curr.parentNode;
      prev = curr.previousElementSibling;
      depth -= 1;
    }
    curr = prev;
    var child = curr;
    while (depth < 0){
      child = curr.lastElementChild;
      if (child == null){
        child = curr;
        break;
      }
      curr = child;
      depth += 1;
    }
    return child;
  }

  function nextElementCousin(elem){
    var curr = elem;
    var depth = 0;
    var next = curr.nextElementSibling;
    while (next === null){
      curr = curr.parentNode;
      next = curr.nextElementSibling;
      depth -= 1;
    }
    curr = next;
    var child = curr;
    while (depth < 0){
      child = curr.firstElementChild;
      if (child == null){
        child = curr;
        break;
      }
      curr = child;
      depth += 1;
    }
    return child;
  }

  function calcDeepestOnscreen(){
    var firstOnscreenDepth = getOnscreenDepth(g.firstOnscreen);
    var lastOnscreenDepth = getOnscreenDepth(g.lastOnscreen);

    g.deepestFirstOnscreen = g.firstOnscreen[firstOnscreenDepth-1];
    g.deepestLastOnscreen = g.lastOnscreen[lastOnscreenDepth-1];
  }

  function getOnscreenDepth(onscreen){
    var depth = 1;
    while (depth < onscreen.length && onscreen[depth] !== null)
      depth += 1;
    return depth;
  }

  //====================================
  //  helpers
  //====================================

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

  //====================================
  //  initialization + return
  //====================================
  
  init();

  return {
    stop: stopMonitoring 
  };
}
