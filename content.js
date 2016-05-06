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

function simulate(element, eventName) {
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers) {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                options.button, options.clientX, options.clientY, options.clientX, options.clientY,
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    } else {
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
    clientX: 0,
    clientY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}

if (window.url != "chrome-extension://" + chrome.runtime.id + "/app.html") {
    document.body.addEventListener("mousedown", function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'mousedown',
                        evt_data: {
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
                            innerText: e.srcElement.innerText,
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    }, true);
    document.body.addEventListener("click", function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                /*var el = e.target;
                 do {
                 if (el.hasAttribute && el.hasAttribute("data-nofire")) {
                 return;
                 }
                 } while (el = el.parentNode);*/
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) {
                        events = [];
                    }
                    events.push({
                        evt: 'click',
                        evt_data: {
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
                            innerText: e.srcElement.innerText,
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    }, true);
    document.body.addEventListener("mouseup", function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) {
                        events = [];
                    }
                    events.push({
                        evt: 'mouseup',
                        evt_data: {
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
                            innerText: e.srcElement.innerText,
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    }, true);
    document.body.addEventListener("keydown", function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) {
                        events = [];
                    }
                    events.push({
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
                            innerText: e.srcElement.innerText,
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    }, true);
    document.body.addEventListener("keypress", function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) {
                        events = [];
                    }
                    events.push({
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
                            innerText: e.srcElement.innerText,
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    }, true);
    document.body.addEventListener("keyup", function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) {
                        events = [];
                    }
                    events.push({
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
                            innerText: e.srcElement.innerText,
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    }, true);
}