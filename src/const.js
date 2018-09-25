export const AREA_STATE = {
  DRAGGING: 'DRAGGING',
  CIRCLE_LEAVE_WHILE_DRAGGING: 'CIRCLE_LEAVE_WHILE_DRAGGING',
  CIRCLE_HOVER: 'CIRCLE_HOVER',
  LEGEND_HOVER: 'LEGEND_HOVER',
  NEUTRAL: 'NEUTRAL'
};

export const AREA_EVENT = {
  CIRCLE_WHEEL_SCROLL: 'CIRCLE_WHEEL_SCROLL',
  CIRCLE_ENTER: 'CIRCLE_ENTER',
  CIRCLE_LEAVE: 'CIRCLE_LEAVE',
  DRAGGING_START: 'DRAGGING_START',
  DRAGGING: 'DRAGGING',
  DRAGGING_END: 'DRAGGING_END'
};

export const browserVendor = (function () {
  var isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';
  // Internet Explorer 6-11
  var isIE = false || !!document.documentMode;
  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia;
  // Chrome 1+
  var isChrome = !!window.chrome && !!window.chrome.webstore;
  // Blink engine detection
  var isBlink = (isChrome || isOpera) && !!window.CSS;

  return {
    isOpera: isOpera,
    isFirefox: isFirefox,
    isIE: isIE,
    isEdge: isEdge,
    isChrome: isChrome,
    isBlink: isBlink
  };
})();

export const RADIANS = 2 * Math.PI;
