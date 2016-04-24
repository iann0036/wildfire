var recording = false;

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

/*
** simulate(document.getElementById("btn"), "click", { clientX: 123, clientY: 321 })
*/

var events = [];

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        if (changeInfo.status == 'complete' && tab.active) {
            if (recording) {
                events.push({
                    tab: tab,
                    evt: 'tabchange',
                    evt_data: {
                        id: tabId,
                        openerTabId: changeInfo.openerTabId,
                        url: tab.url
                    },
                    time: Date.now()
                });
            }
        }
    }
)

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.evt=='query_recording_status') {
            sendResponse({recording: recording});
        } else if (request.evt=='query_events') {
            sendResponse({events: events});
        } else {
            if (request.evt=='begin_recording') {
                events = []; // reset events
                recording = true;
                events.unshift({
                    tab: sender.tab,
                    evt: request.evt,
                    evt_data: request.evt_data,
                    time: Date.now()
                });
            } else if (recording) {
                events.push({
                    tab: sender.tab,
                    evt: request.evt,
                    evt_data: request.evt_data,
                    time: Date.now()
                });
            }
            if (request.evt=='end_recording') {
                recording = false;
            }
        }
    }
);
