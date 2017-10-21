function getUrlParams(url) {
    var urlParams = {};
    url.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) {
            urlParams[$1] = $3;
        }
    );
    
    return urlParams;
}

var urlparams = getUrlParams(window.location.href);

if (urlparams.run) {
    console.log("Running");
    var message_port = chrome.runtime.connect({name: "sim"});
    console.log(message_port.postMessage({action: "start_sim"}));
}
