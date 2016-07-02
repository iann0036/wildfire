/**
 * Created by ian on 24/04/2016.
 */

var events = [];
var recording_start_time = 0;
var recording_end_time = 0;
var simulating = false;
var simulation_log = [];
var sim_start_time;

chrome.storage.onChanged.addListener(function(changes, namespace) {
    updateEvents();
});

function updateEvents() {
    chrome.storage.local.get('events', function (result) {
        events = result.events;
    });
}

updateEvents();

function downloadEventfile() {
    var text = JSON.stringify(events);
    var filename = "WildfireExport_" + Math.floor(Date.now() / 1000) + ".wfire";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function downloadEventfile() {
    var text = JSON.stringify(events);
    var filename = "WildfireExport_" + Math.floor(Date.now() / 1000) + ".wfire";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function addListener(element, eventName, handler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, handler, false);
    }
    else if (element.attachEvent) {
        element.attachEvent('on' + eventName, handler);
    }
    else {
        element['on' + eventName] = handler;
    }
}

function removeListener(element, eventName, handler) {
    if (element.addEventListener) {
        element.removeEventListener(eventName, handler, false);
    }
    else if (element.detachEvent) {
        element.detachEvent('on' + eventName, handler);
    }
    else {
        element['on' + eventName] = null;
    }
}

/*
 ** simulate(document.getElementById("btn"), "click", { clientX: 123, clientY: 321 })
 */

function constructElementIdentifier(path) {
    var js_string = "document";

    if (path.length==1) {
        return "document.getElementById('" + path[0].uniqueId + "')";
    }
    for (var i=path.length-2; i>=0; i--) {
        js_string += ".childNodes[" + path[i].childIndex + "]";
    }

    return js_string;
}

function runSimulation() {
    if (!simulating && events.length>2) {
        simulating = true;
        simulation_log = [];
        sim_start_time = Date.now();

        chrome.storage.local.get('events', function (result) {
            events = result.events;

            if (events.length < 3) {
                alert('Events not found. Something went wrong!');
                return;
            }

            /* Fast forward into first real step */
            events[0].time = events[1].time - 1000;

            chrome.windows.create({
                "url":"chrome-extension://" + chrome.runtime.id + "/new.html",
                //"url":"https://wildfire.ai/",
                "focused":true,
                "left":0,
                "top":0,
                "width":1920,
                "height":1080
                //"type":"popup"
            },function(new_window) {
                chrome.windows.update(new_window.id,{ // https://bugs.chromium.org/p/chromium/issues/detail?id=459841
                    state:"maximized"
                });

                var timeoutObject = setTimeout(function() {
                    chrome.tabs.captureVisibleTab(new_window.id,{
                        "format": "png"
                    }, function(imagedata){
                        chrome.windows.remove(new_window.id,function(){});

                        chrome.notifications.create("",{
                            type: "basic",
                            title: "Wildfire",
                            message: "Simulation completed",
                            iconUrl: "icon-128.png"
                        });
                        chrome.storage.local.get('simulations', function (result) {
                            var simulations = result.simulations;
                            if (!Array.isArray(simulations)) { // for safety only
                                simulations = [];
                            }
                            simulations.push({
                                log: simulation_log,
                                starttime: sim_start_time,
                                endtime: Date.now(),
                                image: imagedata,
                                finished: false
                            });
                            chrome.storage.local.set({simulations: simulations});
                        });
                    });
                }, 600000); // 10 minutes

                for (var i = 0; i < events.length; i++) {
                    switch (events[i].evt) {
                        case 'begin_recording':
                            setTimeout(function(i) {
                                simulation_log.push({
                                    index: i
                                });
                            }, events[i].time-recording_start_time, i);
                            break;
                        case 'end_recording':
                            setTimeout(function(new_window, timeoutObject) {
                                clearTimeout(timeoutObject);
                                chrome.tabs.captureVisibleTab(new_window.id,{
                                    "format": "png"
                                }, function(imagedata){
                                    //chrome.windows.remove(new_window.id,function(){});

                                    chrome.notifications.create("",{
                                        type: "basic",
                                        title: "Wildfire",
                                        message: "Simulation completed",
                                        iconUrl: "icon-128.png"
                                    });
                                    chrome.storage.local.get('simulations', function (result) {
                                        var simulations = result.simulations;
                                        if (!Array.isArray(simulations)) { // for safety only
                                            simulations = [];
                                        }
                                        simulations.push({
                                            log: simulation_log,
                                            events: events,
                                            starttime: sim_start_time,
                                            endtime: Date.now(),
                                            image: imagedata,
                                            finished: true
                                        });
                                        simulations = simulations.slice(-3); // restrict number of simulations for performance
                                        chrome.storage.local.set({simulations: simulations});

                                        window.location = "simulationlog.html";
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, timeoutObject);
                            break;
                        case 'mousedown':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code:"simulate(" +
                                        constructElementIdentifier(events[i].evt_data.path) +
                                        ",'mousedown', { clientX: " +
                                        events[i].evt_data.clientX +
                                        ", clientY: " +
                                        events[i].evt_data.clientY +
                                        " });",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'scroll':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code: "$('html, body').animate({" +
                                        "scrollTop: " + events[i].evt_data.scrollTopEnd + "," +
                                        "scrollLeft: " + events[i].evt_data.scrollLeftEnd +
                                        "}, " + (events[i].evt_data.endtime-events[i].time) + ");",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'mouseup':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code:"simulate(" +
                                        constructElementIdentifier(events[i].evt_data.path) +
                                        ",'mouseup', { clientX: " +
                                        events[i].evt_data.clientX +
                                        ", clientY: " +
                                        events[i].evt_data.clientY +
                                        " });",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'mouseover':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code:"simulate(" +
                                        constructElementIdentifier(events[i].evt_data.path) +
                                        ",'mouseover', { clientX: " +
                                        events[i].evt_data.clientX +
                                        ", clientY: " +
                                        events[i].evt_data.clientY +
                                        " }); simulateHoverElement('" + events[i].evt_data.csspath + "');",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'mouseout':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code:"simulate(" +
                                        constructElementIdentifier(events[i].evt_data.path) +
                                        ",'mouseout', { clientX: " +
                                        events[i].evt_data.clientX +
                                        ", clientY: " +
                                        events[i].evt_data.clientY +
                                        " }); stopSimulateHover();",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'click':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code: "$('" + events[i].evt_data.csspath + "').click();",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'focusin':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code: "$('" + events[i].evt_data.csspath + "').focus();",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'focusout':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code: "$('" + events[i].evt_data.csspath + "').blur();",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'keydown':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code:"simulate(" +
                                        constructElementIdentifier(events[i].evt_data.path) +
                                        ",'keydown', { keyCode: " +
                                        events[i].evt_data.keyCode +
                                        " });",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'keyup':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code:"simulate(" +
                                        constructElementIdentifier(events[i].evt_data.path) +
                                        ",'keyup', { keyCode: " +
                                        events[i].evt_data.keyCode +
                                        " });",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'keypress':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code:"simulate(" +
                                        constructElementIdentifier(events[i].evt_data.path) +
                                        ",'keypress', { keyCode: " +
                                        events[i].evt_data.keyCode +
                                        " });",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'submit':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code:"simulate(" +
                                        constructElementIdentifier(events[i].evt_data.path) +
                                        ",'submit', {});",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'dataentry':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code: "$('" + events[i].evt_data.csspath + "').val('" + events[i].evt_data.value.replace("'", "\\'") + "');",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'input':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code: "$('" + events[i].evt_data.csspath + "').val('" + events[i].evt_data.value.replace("'", "\\'") + "');",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'clipboard_cut':
                            setTimeout(function(new_window, events, i) {
                                var frameId = 0;

                                chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                                    for (var j=0; j<frames.length; j++) {
                                        if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
                                            frameId = frames[j].frameId;
                                        }
                                    }

                                    chrome.tabs.executeScript(new_window.tabs[0].id,{
                                        code: constructElementIdentifier(events[i].evt_data.path) +
                                        ".value = '';",
                                        frameId: frameId,
                                        matchAboutBlank: true
                                    },function(results){
                                        ; // TODO to be populated - this will have an array of results - make sure to return in code
                                    });
                                });
                            }, events[i].time-recording_start_time, new_window, events, i);
                            break;
                        case 'tabchange':
                            setTimeout(function(events, i) {
                                chrome.tabs.update(new_window.tabs[0].id, {
                                    url: events[i].evt_data.url
                                }, function(){});
                            }, events[i].time-recording_start_time, events, i);
                            break;
                        default:
                            console.log("Unknown event type: ".events[i].evt);
                    }
                }
            });
        });
        simulating = false;
    } else {
        if (events.length<3)
            swal({
                title: "No events found",
                text: "You haven't recorded any actions yet!",
                type: "info",
                showCancelButton: false,
                cancelButtonClass: "btn-default",
                confirmButtonClass: "btn-info",
                confirmButtonText: "OK",
                closeOnConfirm: true
            });
        else
            swal({
                title: "Still recording",
                text: "You are still recording!",
                type: "info",
                showCancelButton: false,
                cancelButtonClass: "btn-default",
                confirmButtonClass: "btn-info",
                confirmButtonText: "OK",
                closeOnConfirm: true
            });
    }
}

document.getElementById('simulateButton').addEventListener('click', function() {
    runSimulation();
});
document.getElementById('downloadEventfileButton2').addEventListener('click', function() {
    downloadEventfile();
});
document.getElementById('importEventfileButton').addEventListener('click', function() {
    $('#eventfileContainer').click();
});
document.getElementById('eventfileContainer').addEventListener('change', function() {
    var reader = new FileReader();

    reader.onload = function(e) {
        var new_events = JSON.parse(e.target.result);
        chrome.storage.local.set({events: new_events});
        chrome.storage.local.set({recording: false});
        chrome.notifications.create("",{
            type: "basic",
            title: "Wildfire",
            message: "Eventfile Imported",
            iconUrl: "icon-128.png"
        });
    }

    var file = document.getElementById('eventfileContainer').files[0];
    reader.readAsText(file);
});
