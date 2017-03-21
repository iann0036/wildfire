/* Wildfire - Embed Script
** support@wildfire.ai
*/

window.HTMLFormElement.prototype.wforigsubmit = window.HTMLFormElement.prototype.submit;
window.HTMLFormElement.prototype.submit = function() {
    var event = new CustomEvent("wfSubmit", {
        bubbles: true,
        cancelable: false
    });
    this.dispatchEvent(event);
    this.wforigsubmit();
}

if (document.getElementsByTagName('head')[0].hasAttribute('wf_suppressalerts')) {
    document.getElementsByTagName('head')[0].setAttribute('wf_suppressalerts', null);
    window.confirm = function(){console.warn('Window confirm dialog suppressed by Wildfire'); return true;};
    window.alert = function(){console.warn('Window alert dialog suppressed by Wildfire');};
}

/*
var wildfire_EventTarget_prototype_addEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, fn) {
    var args = arguments;
    var origListener = args[1];

    args[1] = function(){
        //console.log("atest");
        return origListener.apply(this, arguments);
    };

    return wildfire_EventTarget_prototype_addEventListener.apply(this, args);
}
*/
