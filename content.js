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
        throw new SyntaxError('Only HTMLEvent, MouseEvents and KeyboardEvents interfaces are supported');

    if (eventType == 'KeyboardEvents') {
        var oEvent = new KeyboardEvent(eventName, {bubbles : true, cancelable : true,
            code : String.fromCharCode(options.keyCode).toLowerCase(),
            key : String.fromCharCode(options.keyCode).toLowerCase(), shiftKey : false});
    } else {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                options.button, options.clientX, options.clientY, options.clientX, options.clientY,
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
    }

    console.log(element.dispatchEvent(oEvent));

    return element;
}

function extend(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/,
    'KeyboardEvents': /^(?:key(?:down|up|press))$/
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

/*
new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        console.log(mutation);
        alert('mutation');
    });
}).observe(document.body, {
    attributes: true,
    childList: false,
    characterData: false,
    attributeOldValue: true,
//  characterDataOldValue: true,
    subtree: true,
    attributeFilter: ['value']
});
*/

function getClipboard() {
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Paste');
    document.body.removeChild(input);
}

var input_elements = document.body.getElementsByTagName("input");
for (var i=0; i<input_elements.length; i++) {
    input_elements[i].addEventListener('change', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'dataentry',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: e.srcElement.value,
                            type: 'input',
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
    input_elements[i].addEventListener('copy', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'clipboard_copy',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: getClipboard(),
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
    input_elements[i].addEventListener('cut', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'clipboard_cut',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: getClipboard(),
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
    input_elements[i].addEventListener('paste', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'clipboard_paste',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: getClipboard(),
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
}
var select_elements = document.body.getElementsByTagName("select");
for (var i=0; i<select_elements.length; i++) {
    select_elements[i].addEventListener('change', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'dataentry',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: e.srcElement.value,
                            type: 'select',
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
}
var textarea_elements = document.body.getElementsByTagName("textarea");
for (var i=0; i<textarea_elements.length; i++) {
    textarea_elements[i].addEventListener('change', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'dataentry',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: e.srcElement.value,
                            type: 'textarea',
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
    input_elements[i].addEventListener('copy', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'clipboard_copy',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: getClipboard(),
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
    input_elements[i].addEventListener('cut', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'clipboard_cut',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: getClipboard(),
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
    input_elements[i].addEventListener('paste', function(e) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                chrome.storage.local.get('events', function (result) {
                    var events = result.events;
                    if (!Array.isArray(events)) { // for safety only
                        events = [];
                    }
                    events.push({
                        evt: 'clipboard_paste',
                        evt_data: {
                            path: processPath(e.path),
                            bubbles: e.bubbles,
                            cancelable: e.cancelable,
                            value: getClipboard(),
                            url: document.url
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                });
            }
        });
    });
}

/*
document.addEventListener("DOMNodeInserted", function(e) {
    all_elements = e.getElementsByTagName("input");
    for (var i=0; i<all_elements.length; i++) {
        all_elements[i].addEventListener('change', function(evt) {
            alert('New event');
            console.log(evt);
        });
    }
}, false);
*/

if (window.url != "chrome-extension://" + chrome.runtime.id + "/app.html") {
//    document.addEventListener("DOMNodeInserted", function(e) {
//        alert(e);
//    }
//    document.getElementsByTagName('input').addEventListener('DOMAttrModified', function(evt) {
//        alert(evt.attrName + ' is changing from ' + evt.prevValue + ' to ' + evt.newValue);
//    }, true);
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
    }, false);
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
    }, false);
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
    }, false);
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
    }, false);
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
    }, false);
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
    }, false);
}