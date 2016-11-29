/**
 * Created by ian.mckay on 24/04/2016.
 */

var events = [];
var recording_start_time = 0;
var recording_end_time = 0;
var simulating = false;
var simulation_log = [];
var sim_start_time;
var all_settings;
var timeoutObject;
var stepIterator = 0;
var new_window;
var event_execution_timeout = 10000;
var eventExecutionTimeoutCounter;
var closeListener;
var terminated;

var node_details = [];

chrome.storage.local.get('settings', function (settings) {
    if (settings.settings != null) {
        all_settings = settings.settings;
    } else {
        all_settings = new Object();
        all_settings.account = "";
        all_settings.cloudapikey = "";
        all_settings.emulatehover = false;
        all_settings.leavesimulationopen = false;
        all_settings.recordmouseout = false;
        all_settings.recordmouseover = false;
        all_settings.simulatemouseout = false;
        all_settings.simulatemouseover = false;
        all_settings.customsubmit = true;
        all_settings.runminimized = false;
        chrome.storage.local.set({settings: all_settings});
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    updateEvents();
});

function closeListenerCallback(closed_window_id) {
	if (closed_window_id == new_window.id) {
		terminateSimulation(false, "Simulation terminated");
	}
}

function updateEvents() {
    chrome.storage.local.get('events', function (result) {
        events = result.events;
    });
}

updateEvents();

function downloadEventfile() {
    var text = encrypt(JSON.stringify(events));
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

function closeListenerCallbackWorkflow(closed_window_id) {
	if (closed_window_id == new_window.id) {
        var custom = new CustomStop();
        CustomTracker.push(custom);
        node.add(custom, new draw2d.layout.locator.CenterLocator(node));
		terminateSimulation(false, "Simulation terminated");
	}
}

function terminateSimulation(finished, reason) {
	if (terminated)
		return;
	terminated = true; // prevent race against close listener
	
	chrome.windows.onRemoved.removeListener(closeListenerCallback);
    chrome.windows.onRemoved.removeListener(closeListenerCallbackWorkflow);
    clearTimeout(timeoutObject);
	
    simulating = false;
    try {
        chrome.tabs.captureVisibleTab(new_window.id,{
            "format": "png"
        }, function(imagedata){
            if (!all_settings.leavesimulationopen)
                chrome.windows.remove(new_window.id,function(){});
            
            if (simulation_log.length < events.length && finished) { // No errors but missing events
                finished = false;
                reason = "Missed events";
            }

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
                    finished: finished,
                    events: events,
                    terminate_reason: reason,
                    node_details: node_details
                });
                chrome.storage.local.set({simulations: simulations});
            });
        });
    } catch(err) {
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
                image: null,
                finished: finished,
                events: events,
                terminate_reason: reason,
                node_details: node_details
            });
            chrome.storage.local.set({simulations: simulations});
        });
    }
}

function simulateEvent(code, i) {
	setTimeout(function(new_window, events, i, code) {
		var frameId = 0;

		chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
			for (var j=0; j<frames.length; j++) {
				if (frames[j].frameId!=0 && frames[j].url == events[i].evt_data.url) {
					frameId = frames[j].frameId;
				}
			}
			
			eventExecutionTimeoutCounter = setTimeout(function(i){
				simulation_log.push({
					index: i,
					error: true
				});
				terminateSimulation(false, "Event timeout");
			}, event_execution_timeout, i);

            code = "try { " + code + "; } catch(err) { new Object({error: err.message}); }";

			chrome.tabs.executeScript(new_window.tabs[0].id,{
				code: code,
				frameId: frameId,
				matchAboutBlank: true
			},function(results){
                error = true;
                if (results && results.length==1 && !results[0].error)
                    error = false;
				simulation_log.push({
                    index: i,
                    error: error,
                    results: results
                });
				
				simulateNextStep();
			});
		});
	}, events[i].time-events[i-1].time, new_window, events, i, code);
}

function simulateNextStep() {
    var i = stepIterator;
    clearTimeout(eventExecutionTimeoutCounter);

    switch (events[i].evt) {
        case 'begin_recording':
            setTimeout(function(i) {
                simulation_log.push({
                    index: i,
                    error: false
                });
                simulateNextStep();
            }, events[i].time-recording_start_time, i);
            break;
        case 'end_recording':
            setTimeout(function(new_window, timeoutObject, i) {
				simulation_log.push({
                    index: i,
                    error: false
                });
                terminateSimulation(true, "");
            }, events[i].time-events[i-1].time, new_window, timeoutObject, i);
            break;
        case 'mousedown':
            simulateEvent("simulate(" +
				constructElementIdentifier(events[i].evt_data.path) +
				",'mousedown', { clientX: " +
				events[i].evt_data.clientX +
				", clientY: " +
				events[i].evt_data.clientY +
				" });", i);
            break;
        case 'scroll':
            simulateEvent("$('html, body').animate({" +
				"scrollTop: " + events[i].evt_data.scrollTopEnd + "," +
				"scrollLeft: " + events[i].evt_data.scrollLeftEnd +
				"}, " + (events[i].evt_data.endtime-events[i].time) + ");", i);
            break;
        case 'mouseup':
            simulateEvent("simulate(" +
				constructElementIdentifier(events[i].evt_data.path) +
				",'mouseup', { clientX: " +
				events[i].evt_data.clientX +
				", clientY: " +
				events[i].evt_data.clientY +
				" });", i);
            break;
        case 'mouseover':
            if (all_settings.simulatemouseover) {
				simulateEvent("simulate(" +
					constructElementIdentifier(events[i].evt_data.path) +
					",'mouseover', { clientX: " +
					events[i].evt_data.clientX +
					", clientY: " +
					events[i].evt_data.clientY +
					" }); simulateHoverElement('" + events[i].evt_data.csspath + "');", i);
			} else {
				simulation_log.push({
                    index: i,
                    error: false
                });
			}
            break;
        case 'mouseout':
            if (all_settings.simulatemouseout) {
				simulateEvent("simulate(" +
					constructElementIdentifier(events[i].evt_data.path) +
					",'mouseout', { clientX: " +
					events[i].evt_data.clientX +
					", clientY: " +
					events[i].evt_data.clientY +
					" }); stopSimulateHover();", i);
			} else {
				simulation_log.push({
                    index: i,
                    error: false
                });
			}
            break;
        case 'click':
            simulateEvent("$('" + events[i].evt_data.csspath + "').click();", i);
            break;
        case 'focusin':
            simulateEvent("$('" + events[i].evt_data.csspath + "').focus();", i);
            break;
        case 'focusout':
            simulateEvent("$('" + events[i].evt_data.csspath + "').blur();", i);
            break;
        case 'keydown':
            simulateEvent("simulate(" +
				constructElementIdentifier(events[i].evt_data.path) +
				",'keydown', { keyCode: " +
				events[i].evt_data.keyCode +
				" });", i);
            break;
        case 'keyup':
			simulateEvent("simulate(" +
				constructElementIdentifier(events[i].evt_data.path) +
				",'keyup', { keyCode: " +
				events[i].evt_data.keyCode +
				" });", i);
            break;
        case 'keypress':
			simulateEvent("simulate(" +
				constructElementIdentifier(events[i].evt_data.path) +
				",'keypress', { keyCode: " +
				events[i].evt_data.keyCode +
				" });", i);
            break;
        case 'submit':
			simulateEvent("simulate(" +
				constructElementIdentifier(events[i].evt_data.path) +
				",'submit', {});", i);
            break;
        case 'dataentry':
			simulateEvent("$('" + events[i].evt_data.csspath + "').val('" +
				events[i].evt_data.value.replace("'", "\\'") + "');", i);
            break;
        case 'change':
			simulateEvent("$('" + events[i].evt_data.csspath + "').val('" +
				events[i].evt_data.value.replace("'", "\\'") + "');", i);
            break;
        case 'input':
			simulateEvent("$('" + events[i].evt_data.csspath + "').val('" +
				events[i].evt_data.value.replace("'", "\\'") + "');", i);
			/*simulateEvent("$('" + events[i].evt_data.csspath + "').val('" +
				events[i].evt_data.value.replace("'", "\\'") + "');", i);*/
            break;
        case 'clipboard_cut':
			simulateEvent(constructElementIdentifier(events[i].evt_data.path) +
                        ".value = '';", i);
            break;
        case 'tabchange':
            setTimeout(function(events, i) {
                eventExecutionTimeoutCounter = setTimeout(function(i){
                    simulation_log.push({
                        index: i,
                        error: true
                    });
                    terminateSimulation(false, "Tab change timeout");
                }, event_execution_timeout, i);

                chrome.tabs.update(new_window.tabs[0].id, {
                    url: events[i].evt_data.url
                }, function(){
					simulation_log.push({
						index: i,
						error: false
					});
                    simulateNextStep();
                });
            }, events[i].time-events[i-1].time, events, i);
            break;
        case 'select':
            simulateEvent(";", i); // TODO - emulate Text Select
            break;
        default:
            console.log("Unknown event type: " + events[i].evt);
            simulation_log.push({
                index: i,
                error: true
            });
			terminateSimulation(false, "Unknown event type: " + events[i].evt);
            break;
    }

    stepIterator++;
}

function runSimulation() {
    if (!simulating && events!=null && events.length>2) {
        recording_start_time = events[0].time;
        simulating = true;
        simulation_log = [];
        sim_start_time = Date.now();
		stepIterator = 0;
		terminated = false;

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
            },function(simulation_window) {
                new_window = simulation_window;
                if (all_settings.runminimized) {
                    chrome.windows.update(new_window.id, { // https://bugs.chromium.org/p/chromium/issues/detail?id=459841
                        state: "minimized"
                    });
                }
				
				chrome.tabs.getAllInWindow(new_window.id, function(tabs){
					for (var i=1; i<tabs.length; i++) {
						chrome.tabs.remove(tabs[i].id);
					}
				});

                timeoutObject = setTimeout(function() {
                    terminateSimulation(false, "Global run timeout");
                }, 600000); // 10 minutes
				
				chrome.windows.onRemoved.addListener(closeListenerCallback);

                simulateNextStep();
            });
        });
    } else {
        if (events==null || events.length<3)
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

function generatePassphrase() {
  var ret = "3ur9";
  ret += "480tvb4";
  ret += "39f83r8";
  return ret;
}
function encrypt(str) {
  return CryptoJS.AES.encrypt(str, generatePassphrase()).toString();
}
function decrypt(str) {
  return CryptoJS.AES.decrypt(str, generatePassphrase()).toString(CryptoJS.enc.Utf8);
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
        var new_events = JSON.parse(decrypt(e.target.result));
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
