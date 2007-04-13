
/**
 * Below is a slightly modified cross browser implementation of DOMOnload functionality by 
 * Dean Edwards, Matthias Miller and John Resig.
 * 
 * Discussion available at:
 * http://dean.edwards.name/weblog/2006/06/again/
 * 
 */
 
// Dean Edwards/Matthias Miller/John Resig

function __init() {
    // quit if this function has already been called
    if (arguments.callee.done) return;

    // flag this function so we don't do the same thing twice
    arguments.callee.done = true;

    // kill the timer
    if (_timer) clearInterval(_timer);

    // call definied init routine
    init();
};

/* for Mozilla/Opera9 */
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", __init, false);
}

/* for Internet Explorer */
/*@cc_on @*/
/*@if (@_win32)
    document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
    var script = document.getElementById("__ie_onload");
    script.onreadystatechange = function() {
        if (this.readyState == "complete") {
            __init(); // call the onload handler
        }
    };
/*@end @*/

/* for Safari */
if (/WebKit/i.test(navigator.userAgent)) { // sniff
    var _timer = setInterval(function() {
        if (/loaded|complete/.test(document.readyState)) {
            __init(); // call the onload handler
        }
    }, 10);
}

/* for other browsers */
window.onload = __init;
