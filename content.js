function processPath(elementPath) {
    var numPathElements = elementPath.length;
    var path = [];
    
    uniqueEl = false;
    for (var i=0; i<numPathElements-1 && !uniqueEl; i++) {
        if (elementPath[i].id!=null && elementPath[i].id!="") {
            uniqueEl = true;
            path.push({
                uniqueId: elementPath[i].id,
                tagName: elementPath[i].tagName
            });
        } else {
            var childIndex = null;
            for (var j=0; elementPath[i].parentNode!=null && j<elementPath[i].parentNode.childNodes.length; j++) {
                if (elementPath[i].parentNode.childNodes[j]===elementPath[i]) {
                    childIndex = j;
                }
            }
            path.push({
                uniqueId: null,
                childIndex: childIndex,
                tagName: elementPath[i].tagName
            });
        }
    }
    
    return path;
}

window.onload = function() {
    document.body.addEventListener("mousedown", function(e) {
        chrome.runtime.sendMessage({
            evt: 'mousedown',
            evt_data: {
                //target: e.target,
                //path: processPath(e.path),
                clientX: e.clientX,
                clientY: e.clientY,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                button: e.button,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                timeStamp: e.timeStamp
            }
        });
    }, true);
    document.body.addEventListener("click", function(e) {
        /*var el = e.target;
        do {
            if (el.hasAttribute && el.hasAttribute("data-nofire")) {
                return;
            }
        } while (el = el.parentNode);*/
        console.log(e);
        console.log(processPath(e.path));
        chrome.runtime.sendMessage({
            evt: 'click',
            evt_data: {
                //target: e.target,
                path: processPath(e.path),
                clientX: e.clientX,
                clientY: e.clientY,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                button: e.button,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                timeStamp: e.timeStamp
            }
        });
    }, true);
    document.body.addEventListener("mouseup", function(e) {
        chrome.runtime.sendMessage({
            evt: 'mouseup',
            evt_data: {
                //target: e.target,
                //path: processPath(e.path),
                clientX: e.clientX,
                clientY: e.clientY,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                button: e.button,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                timeStamp: e.timeStamp
            }
        });
    }, true);
    document.body.addEventListener("keydown", function(e) {
        chrome.runtime.sendMessage({
            evt: 'keydown',
            evt_data: {
                path: processPath(e.path),
                keyCode: e.keyCode,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                timeStamp: e.timeStamp
            }
        });
    }, true);
    document.body.addEventListener("keypress", function(e) {
        chrome.runtime.sendMessage({
            evt: 'keypress',
            evt_data: {
                path: processPath(e.path),
                keyCode: e.keyCode,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                timeStamp: e.timeStamp
            }
        });
    }, true);
    document.body.addEventListener("keyup", function(e) {
        chrome.runtime.sendMessage({
            evt: 'keyup',
            evt_data: {
                path: processPath(e.path),
                keyCode: e.keyCode,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                timeStamp: e.timeStamp
            }
        });
    }, true);
}