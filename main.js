var events = [];
var recording = false;
var bgSettings;
var proxyAuthEnable = false;
var proxyUsername;
var proxyPassword;
var windowWidth = 1280;
var windowHeight = 800;
var port = false;
var nodes = [], links = [];
var new_window;
var sim_start_time;
var terminated = false;
var simulation_log = [];
var waitForElementInterval, waitForTitleInterval, testExpressionInterval;
var simulating = false;
var last_node;
var isFavSim = false;
var simulation_variables = [];

if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) { // Opera
    windowWidth*=window.devicePixelRatio;
    windowHeight*=window.devicePixelRatio;
}

chrome.alarms.onAlarm.addListener(function(alarm){
    var name = alarm.name;
    if (name.startsWith("scheduled_")) {
        var name_parts = name.split("_");
        chrome.notifications.create("beginning_scheduled_sim",{
            type: "basic",
            title: "Wildfire",
            message: "A scheduled simulation is about to start.",
            iconUrl: "icon-128.png"
        });
        setTimeout(function(){
            begin_sim_with_option(name_parts[1]);
        },5000);
    }
});

function resolveVariable(str) {
    str = String(str).replace("'", "\\'");

    if (str.length < 2)
        return str;
    if (str[0] != '$')
        return str;
    if (str[1] == '$')
        return str.substring(1);
    if (simulation_variables[str.substring(1)] === undefined)
        return "";
    return simulation_variables[str.substring(1)].replace("'", "\\'");
}

function configureAlarms() {
    chrome.alarms.clearAll(function(){
        chrome.storage.local.get('scheduled', function (result) {
            var options;
            var scheduled = result.scheduled;

            if (!Array.isArray(scheduled)) {
                scheduled = [];
            }

            for (var i=0; i<scheduled.length; i++) {
                if (parseInt(scheduled[i].repeat) || Date.now() < parseInt(scheduled[i].date)) {
                    if (Date.now() >= parseInt(scheduled[i].date))
                        scheduled[i].date = Date.now() + ((parseInt(scheduled[i].repeat)*60000) - (Date.now() % (parseInt(scheduled[i].repeat)*60000)));
                    options = {
                        when: parseInt(scheduled[i].date)
                    };
                    if (scheduled[i].repeat!=0)
                        options['periodInMinutes'] = parseInt(scheduled[i].repeat);
                    chrome.alarms.create("scheduled_" + scheduled[i].workflow, options);
                }
            }
        });
    });
}

function updateBgSettings() {
	chrome.storage.local.get('settings', function (settings) {
		bgSettings = settings.settings;
	});
}

function updateWorkflowData() {
	return new Promise(function(resolve,reject){
		chrome.storage.local.get('workflow', function (workflow) {
            chrome.storage.local.get('events', function (events_result) {
                if (!events_result.events || events_result.events.length<2) {
                    chrome.notifications.create("no_recorded_events",{
                        type: "basic",
                        title: "Wildfire",
                        message: "You have no recorded events. Click here to learn about recording your events.",
                        iconUrl: "icon-128.png"
                    });
                    reject();
                } else if (workflow.workflow) {
                    var wfobj = JSON.parse(decrypt(workflow.workflow));
                    var canvas_elements = wfobj.canvas;
                    
                    nodes = [];
                    links = [];

                    for (var i=0; i<canvas_elements.length; i++) {
                        if (canvas_elements[i].type == "draw2d.Connection")
                            links.push(canvas_elements[i]);
                        else
                            nodes.push(canvas_elements[i]);
                    }

                    events = events_result.events;
                    resolve();
                } else {
                    chrome.notifications.create("no_workflow_available",{
                        type: "basic",
                        title: "Wildfire",
                        message: "There is currently no active workflow. Click here or open the Workflow Editor to generate one.",
                        iconUrl: "icon-128.png"
                    });
                    reject();
                }
		    });
        });
	});
}

function updateWorkflowDataToFavorite(favorite_index) {
    if (favorite_index == -1)
        return updateWorkflowData();
	return new Promise(function(resolve,reject){
		chrome.storage.local.get('favorites', function (favorites) {
			var wfobj = JSON.parse(decrypt(favorites.favorites[favorite_index].workflow));
			var canvas_elements = wfobj.canvas;
			
			nodes = [];
			links = [];

			for (var i=0; i<canvas_elements.length; i++) {
				if (canvas_elements[i].type == "draw2d.Connection")
					links.push(canvas_elements[i]);
				else
					nodes.push(canvas_elements[i]);
			}

            events = wfobj.events;
            resolve();
		});
	});
}

chrome.notifications.onClicked.addListener(function(notificationId){
    if (notificationId == "no_workflow_available") {
        if (typeof InstallTrigger === 'undefined') { // NOT Firefox
            chrome.windows.create({
                url: chrome.extension.getURL("workfloweditor.html"),
                type: "popup",
                width: windowWidth,
                height: windowHeight,
                left: screen.width/2-(windowWidth/2),
                top: screen.height/2-(windowHeight/2)
            });
        } else {
            window.open(chrome.extension.getURL("workfloweditor.html"), "wildfire", "left=" + screen.width/2-(windowWidth/2) +
                "top=" + screen.height/2-(windowHeight/2) + ",width=" + windowWidth + ",height=" + windowHeight +
                ",resizable=no,scrollbars=yes,status=no,menubar=no,toolbar=no,personalbar=no");
        }
    } else if (notificationId == "sim_complete") {
        if (typeof InstallTrigger === 'undefined') { // NOT Firefox
            chrome.windows.create({
                url: chrome.extension.getURL("simulations.html#0"),
                type: "popup",
                width: windowWidth,
                height: windowHeight,
                left: screen.width/2-(windowWidth/2),
                top: screen.height/2-(windowHeight/2)
            });
        } else {
            window.open(chrome.extension.getURL("simulations.html#0"), "wildfire", "left=" + screen.width/2-(windowWidth/2) +
                "top=" + screen.height/2-(windowHeight/2) + ",width=" + windowWidth + ",height=" + windowHeight +
                ",resizable=no,scrollbars=yes,status=no,menubar=no,toolbar=no,personalbar=no");
        }
    } else if (notificationId == "no_recorded_events") {
        if (typeof InstallTrigger === 'undefined') { // NOT Firefox
            chrome.windows.create({
                url: chrome.extension.getURL("docs/getting_started.html"),
                type: "popup",
                width: windowWidth,
                height: windowHeight,
                left: screen.width/2-(windowWidth/2),
                top: screen.height/2-(windowHeight/2)
            });
        } else {
            window.open(chrome.extension.getURL("docs/getting_started.html"), "wildfire", "left=" + screen.width/2-(windowWidth/2) +
                "top=" + screen.height/2-(windowHeight/2) + ",width=" + windowWidth + ",height=" + windowHeight +
                ",resizable=no,scrollbars=yes,status=no,menubar=no,toolbar=no,personalbar=no");
        }
    } else if (notificationId == "event_log_imported") {
        if (typeof InstallTrigger === 'undefined') { // NOT Firefox
            chrome.windows.create({
                url: chrome.extension.getURL("eventlog.html"),
                type: "popup",
                width: windowWidth,
                height: windowHeight,
                left: screen.width/2-(windowWidth/2),
                top: screen.height/2-(windowHeight/2)
            });
        } else {
            window.open(chrome.extension.getURL("eventlog.html"), "wildfire", "left=" + screen.width/2-(windowWidth/2) +
                "top=" + screen.height/2-(windowHeight/2) + ",width=" + windowWidth + ",height=" + windowHeight +
                ",resizable=no,scrollbars=yes,status=no,menubar=no,toolbar=no,personalbar=no");
        }
    }
});

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
		if (!tab.url.startsWith("chrome-extension://" + chrome.runtime.id) && !tab.url.startsWith("moz-extension://" + chrome.runtime.id)) {
			chrome.storage.local.get('recording', function (isRecording) {
				if (isRecording.recording) {
					if (changeInfo.status == 'loading') {
                        events.push({
                            tab: tab,
                            evt: 'tabchange',
                            evt_data: {
                                id: tabId,
                                openerTabId: changeInfo.openerTabId,
                                url: tab.url,
                                active: tab.active,
                                prerender: false
                            },
                            time: Date.now()
                        });
                        chrome.storage.local.set({events: events});
					}
				}
			});
		}
	}
);

chrome.tabs.onReplaced !== undefined && chrome.tabs.onReplaced.addListener( // Pre-rendered - special handling for not present in FF
    function (addedTabId, removedTabId) {
		chrome.tabs.get(addedTabId, function (tab) {
			if (!tab.url.startsWith("chrome-extension://" + chrome.runtime.id) && !tab.url.startsWith("moz-extension://" + chrome.runtime.id)) {
				chrome.storage.local.get('recording', function (isRecording) {
					if (isRecording.recording) {
                        events.push({
                            tab: tab,
                            evt: 'tabchange',
                            evt_data: {
                                id: tab.id,
                                openerTabId: tab.id,
                                url: tab.url,
                                active: tab.active,
                                prerender: true
                            },
                            time: Date.now()
                        });
                        chrome.storage.local.set({events: events});
					}
				});
			}
		});
	}
);

function updateExtIcon() {
    chrome.storage.local.get('recording', function (isRecording) {
        if (isRecording.recording && !recording) {
            /*chrome.browserAction.setIcon({
                path: 'icon-recording-128.png'
            });*/
			chrome.browserAction.setBadgeText({ text: "REC" });
			chrome.browserAction.setBadgeBackgroundColor({ color: "#FF2222" });
            recording = true;
        } else if (!isRecording.recording && recording) {
            /*chrome.browserAction.setIcon({
                path: 'icon-128.png'
            });*/
			chrome.browserAction.setBadgeText({ text: "" });
            recording = false;
        }
    });
}


function updateEvents() {
    chrome.storage.local.get('events', function (result) {
        var new_events = result.events;
        if (!Array.isArray(new_events)) { // for safety only
            new_events = [];
        }
        events = new_events;
    });
}

function updateProxy() {
    chrome.storage.local.get('proxy', function (proxy) {
		if (proxy && proxy.proxy && chrome.proxy) {
			if (proxy.proxy.clear)
				chrome.proxy.settings.clear({});
			else {
				if (proxy.proxy.username && proxy.proxy.username != "") {
					proxyAuthEnable = true;
					proxyUsername = proxy.proxy.username;
					proxyPassword = proxy.proxy.password;
				} else {
					proxyAuthEnable = false;
				}

				chrome.proxy.settings.set({
					value: {
						mode: "fixed_servers",
						rules: {
							singleProxy: {
								scheme: proxy.proxy.scheme,
								host: proxy.proxy.host,
								port: parseInt(proxy.proxy.port)
							},
							bypassList: proxy.proxy.ignore
						}
					},
					scope: 'regular'
				});
			}
		}
    });
}

chrome.webRequest.onAuthRequired !== undefined && chrome.webRequest.onAuthRequired.addListener( // special handling for not present in FF
	function(details) {
		if (proxyAuthEnable) {
			return({
				authCredentials : {
					'username' : proxyUsername,
					'password' : proxyPassword
				}
			});
		}
		return;
	},
	{urls: ["<all_urls>"]}, 
	["blocking"]
);

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if (changes.recording != undefined)
    	updateExtIcon();
	if (changes.settings != undefined) {
		updateBgSettings();
		setContextMenus();
	}
	if (changes.proxy != undefined)
		updateProxy();
	if (changes.favorites != undefined)
		setContextMenus();
    if (changes.scheduled != undefined)
		configureAlarms();
    if (changes.events != undefined) {
        if (changes.events.newValue.length != events.length) {
            updateEvents();
        }
    }
});

updateExtIcon();
updateBgSettings();
updateProxy();
configureAlarms();
updateEvents();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "addEvent") {
        events.push({
            evt: request.evt,
            evt_data: request.evt_data,
            time: request.time
        });
        chrome.storage.local.set({events: events});
    }
});

/*
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
	if (request.action == "registrationStatus") {
		if (bgSettings != null) {
			sendResponse({
				"success": true,
				"account": bgSettings.account,
				"cloudapikey": bgSettings.cloudapikey
			});
		} else {
			sendResponse({
				"success": false
			});
		}
	} else if (request.action == "openExtension") {
		var windowWidth = 1280;
		var windowHeight = 800;
		chrome.windows.create({
			url: chrome.extension.getURL("dashboard.html"),
			type: "popup",
			width: windowWidth,
			height: windowHeight,
			left: screen.width/2-(windowWidth/2),
			top: screen.height/2-(windowHeight/2)
		});
	} else if (request.action == "registerExtension") {
		chrome.storage.local.get('settings', function (settings) {
			bgSettings = settings.settings;
			bgSettings.account = request.account;
			bgSettings.cloudapikey = request.cloudapikey;
			chrome.storage.local.set({settings: bgSettings});
		});
		sendResponse({
			"success": true
		});
	}
});
*/

chrome.runtime.onInstalled !== undefined && chrome.runtime.onInstalled.addListener(function(details){ // special handling - not present in FF
    chrome.storage.local.set({simulating: false});    
    if (details.reason == "install") {
        if (typeof InstallTrigger === 'undefined') { // NOT Firefox
            chrome.windows.create({
                url: chrome.extension.getURL("docs/getting_started.html"),
                type: "popup",
                width: windowWidth,
                height: windowHeight,
                left: screen.width/2-(windowWidth/2),
                top: screen.height/2-(windowHeight/2)
            });
        } else {
            window.open(chrome.extension.getURL("docs/getting_started.html"), "wildfire", "left=" + screen.width/2-(windowWidth/2) +
                "top=" + screen.height/2-(windowHeight/2) + ",width=" + windowWidth + ",height=" + windowHeight +
                ",resizable=no,scrollbars=yes,status=no,menubar=no,toolbar=no,personalbar=no");
        }
    } else if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        /*chrome.notifications.create("",{
            type: "basic",
            title: "Wildfire",
            message: "The Wildfire extension has been updated",
            iconUrl: "icon-128.png"
        });*/
    }
});

function setContextMenus() {
    if (typeof InstallTrigger !== 'undefined') // Firefox
        return;
	chrome.storage.local.get('favorites', function (result) {
        var favorites = result.favorites;
        if (!Array.isArray(favorites)) { // for safety only
            favorites = [];
        }
		chrome.contextMenus.removeAll(function(){
			if (bgSettings.rightclick) {
				chrome.contextMenus.create({
					"title": "Run the current workflow",
                    "id": "wildfire-currentwf",
					"contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"],
					"documentUrlPatterns": ["http://*/*","https://*/*"],
					"onclick": function(info, tab){
						chrome.windows.get(tab.windowId, null, function(curr_window) {
                            begin_fav_sim(-1, curr_window);
                        });
					}
				});
				for (var i=0; i<favorites.length; i++) {
					if (favorites[i].rightclick)
						chrome.contextMenus.create({
							"title": "Run '" + favorites[i].name + "'",
                            "id": "wildfire-favorite-" + i,
							"contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"], // ignore chrome-extension://
							"documentUrlPatterns": ["http://*/*","https://*/*"],
							"onclick": function(info, tab){
                                chrome.windows.get(tab.windowId, null, function(curr_window) {
                                    begin_fav_sim(info.menuItemId.replace("wildfire-favorite-",""), curr_window);
                                });
							}
						});
				}
				chrome.contextMenus.create({
					"type": "separator",
					"documentUrlPatterns": ["http://*/*","https://*/*"],
					"contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"]
				});
				chrome.contextMenus.create({
					"title": "Manage Favorites",
					"contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"],
					"documentUrlPatterns": ["http://*/*","https://*/*"],
					"onclick": function(){
                        if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                            chrome.windows.create({
                                url: chrome.extension.getURL("settings.html#favorites"),
                                type: "popup",
                                width: windowWidth,
                                height: windowHeight,
                                left: screen.width/2-(windowWidth/2),
                                top: screen.height/2-(windowHeight/2)
                            });
                        } else {
                            window.open(chrome.extension.getURL("settings.html#favorites"), "wildfire", "left=" + screen.width/2-(windowWidth/2) +
                                "top=" + screen.height/2-(windowHeight/2) + ",width=" + windowWidth + ",height=" + windowHeight +
                                ",resizable=no,scrollbars=yes,status=no,menubar=no,toolbar=no,personalbar=no");
                        }
					}
				});
			}
		});
	});
}

setTimeout(function(){
    setContextMenus();
},10);

function send_message(msg) {
    try {
	    port.postMessage(msg);
    } catch(err) {
        ; // TODO: Handle this
    }
}

function getNodeById(nodeid) {
	var node = null;

	for (var i=0; i<nodes.length; i++) {
		if (nodes[i].id == nodeid) {
			node = nodes[i];
			break;
		}
	}

	return node;
}

chrome.runtime.onConnect.addListener(function(new_port) {
	port = new_port;
	if (port.name == "sim") {
		port.onMessage.addListener(function(msg) {
			if (msg.action == "getstate") {
				send_message({
					type: "state",
					state: "running"
				});
			} else if (msg.action == "begin_sim") {
				begin_sim();
			} else if (msg.action == "stop_sim") {
				terminateSimulation(false, "User terminated");
			}
		});
	}
});

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

function begin_fav_sim(fav_index, curr_window) { ////////////////////
    sim_start_time = Date.now();
    terminated = false;
    new_window = curr_window;
    isFavSim = true;
    simulation_log = [];
    simulation_variables = [];

    chrome.storage.local.set({simulating: true});

    updateWorkflowDataToFavorite(fav_index).then(function(){
	    chrome.browserAction.setBadgeText({ text: "SIM" });
        chrome.browserAction.setBadgeBackgroundColor({ color: "#00CC66" });

        var node;

        for (var i=0; i<nodes.length; i++) {
            if (nodes[i].userData.evt == "begin_recording") {
                node = nodes[i];
                break;
            }
        }

        setTimeout(function(node){ // allow time for simulation window to open
            processEvent(node);
        }, 1000, node);
    }).catch(function(){
        ; // TODO: Better handling
    });
}

function begin_sim() {
    begin_sim_with_option(-1);
}

function begin_sim_with_option(fav_index) {
    simulation_variables = [];
    sim_start_time = Date.now();
    terminated = false;
    isFavSim = false;
    simulation_log = [];

    chrome.storage.local.set({simulating: true});

	chrome.browserAction.setBadgeText({ text: "SIM" });
    chrome.browserAction.setBadgeBackgroundColor({ color: "#00CC66" });

	chrome.extension.isAllowedIncognitoAccess(function(isAllowedIncognito) {
		var incognito = false;
		if (bgSettings.incognito && isAllowedIncognito)
			incognito = true;

		var url = chrome.extension.getURL("new.html");
		/*if (events[1].evt != "tabchange" && events[1].evt_data.url && events[1].evt_data.url.length > 8) {
			url = events[1].evt_data.url;
		}*/
		
        var window_options = {
			"url":url,
			"left":0,
			"top":0,
			"width":1920,
			"height":1080,
			"incognito":incognito
		};
        if (typeof InstallTrigger === 'undefined') // NOT Firefox
            window_options["focused"] = true;

		chrome.windows.create(window_options, function(simulation_window) {
			new_window = simulation_window;
			if (bgSettings.runminimized) {
				chrome.windows.update(new_window.id, { // https://bugs.chromium.org/p/chromium/issues/detail?id=459841
					state: "minimized"
				});
			} else {
                chrome.windows.update(new_window.id, { // https://bugs.chromium.org/p/chromium/issues/detail?id=459841
					state: "maximized"
				});
            }
			
			setTimeout(function(new_window){
                if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                    chrome.tabs.query({windowId: new_window.id}, function(tabs){
                        for (var i=1; i<tabs.length; i++) {
                            chrome.tabs.remove(tabs[i].id);
                        }
                    });
                }
			}, 100, new_window);

			timeoutObject = setTimeout(function() {
				port.postMessage({
					type: "state",
					state: "terminated",
					reason: "run_timeout"
				});
				
				terminateSimulation(false, "Global run timeout"); // TODO: Check
			}, 3600000); // 1 hour
			
			chrome.windows.onRemoved.addListener(closeListenerCallback); // TODO: Check

            if (fav_index==-1) {
                updateWorkflowData().then(function(){
                    var node;

                    for (var i=0; i<nodes.length; i++) {
                        if (nodes[i].userData.evt == "begin_recording") {
                            node = nodes[i];
                            break;
                        }
                    }

                    setTimeout(function(node){ // allow time for simulation window to open
                        processEvent(node);
                    }, 1000, node);
                }).catch(function(){
                    chrome.windows.remove(new_window.id,function(){});
                    terminated = true;
                    chrome.storage.local.set({simulating: false});
                    chrome.windows.onRemoved.removeListener(closeListenerCallback);
                    clearTimeout(timeoutObject);
                    chrome.storage.local.set({proxy: {clear: true}});
                    chrome.browserAction.setBadgeText({ text: "" });
                    simulating = false;
                });
            } else {
                updateWorkflowDataToFavorite(fav_index).then(function(){
                    var node;

                    for (var i=0; i<nodes.length; i++) {
                        if (nodes[i].userData.evt == "begin_recording") {
                            node = nodes[i];
                            break;
                        }
                    }

                    setTimeout(function(node){ // allow time for simulation window to open
                        processEvent(node);
                    }, 1000, node);
                }).catch(function(){
                    chrome.windows.remove(new_window.id,function(){});
                    terminated = true;
                    chrome.storage.local.set({simulating: false});
                    chrome.storage.local.set({proxy: {clear: true}});
                    chrome.browserAction.setBadgeText({ text: "" });
                    simulating = false;
                });
            }
		});
	});
}

function closeListenerCallback(closed_window_id) {
	if (closed_window_id == new_window.id) {
		terminateSimulation(false, "Simulation terminated");
	}
}

function processEvent(node) {
    if (terminated)
		return;
    
    last_node = node;

    execEvent(node).then(function(result){
        logResultAndRaceLinks(result, false, node);
    }).catch(function(result){
        logResultAndRaceLinks(result, true, node);
    });
}

function logResultAndRaceLinks(result, failure, node) {
	// Process result
	simulation_log.push(result);

	if (node.userData.evt == "end_recording") {
		send_message({
			type: "nodestatus",
			nodeid: node.id,
			status: "tick"
		});
		terminateSimulation(true, "");
		return;
	}

	var nodeConnectionPromises = [];
	for (var i=0; i<links.length; i++) {
		if (links[i].source.node == node.id) {
			nodeConnectionPromises.push(
				new Promise(function(resolve, reject) {
					if (links[i].userData.evt == "timer") {
						setTimeout(resolve, resolveVariable(links[i].userData.wait_time), links[i]);
					} else if (links[i].userData.evt == "wait_for_element") {
						waitForElement(resolve, resolveVariable(links[i].userData.csspath), links[i]);
					} else if (links[i].userData.evt == "wait_for_title") {
						waitForTitle(resolve, resolveVariable(links[i].userData.title), links[i]);
                    } else if (links[i].userData.evt == "test_expression") {
						testExpression(resolve, links[i].userData.expr, links[i]);
					} else {
						reject();
					}
				})
			);
		}
	}
	
	if (nodeConnectionPromises.length == 0) {
		if (failure)
			send_message({
				type: "nodestatus",
				nodeid: node.id,
				status: "cross"
			});
		else
			send_message({
				type: "nodestatus",
				nodeid: node.id,
				status: "tick"
			});
		terminateSimulation(false, "No links from event");
		return;
	} else {
		Promise.race(nodeConnectionPromises)
		.then(function(winning_link) {
			clearInterval(waitForElementInterval);
			clearInterval(waitForTitleInterval);
			clearInterval(testExpressionInterval);
			if (!terminated) {
				if (failure)
					send_message({
						type: "nodestatus",
						nodeid: node.id,
						status: "cross"
					});
				else
					send_message({
						type: "nodestatus",
						nodeid: node.id,
						status: "tick"
					});
			}

			node = getNodeById(winning_link.target.node);
			processEvent(node);
		});
	}
}

function execEvent(node) {
	send_message({
		type: "nodestatus",
		nodeid: node.id,
		status: "pending"
	});

    var code = ";";

    switch (node.userData.evt) {
        case 'begin_recording':
            return new Promise(function(resolve, reject) {
                resolve({
                    error: false,
                    results: null,
                    id: node.id,
                    time: Date.now()
                });
            });
        case 'end_recording':
            return new Promise(function(resolve, reject) {
                resolve({
                    error: false,
                    results: null,
                    id: node.id,
                    time: Date.now()
                });
            });
        case 'mousedown':
            if (bgSettings.simulatemousedown) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'mousedown', { clientX: " +
                    resolveVariable(node.userData.evt_data.clientX) +
                    ", clientY: " +
                    resolveVariable(node.userData.evt_data.clientY) +
                    " });";
            }
            break;
        case 'scroll':
            if (bgSettings.simulatescroll) {
                code = "$('html, body').animate({" +
                    "scrollTop: " + resolveVariable(node.userData.evt_data.scrollTopEnd) + "," +
                    "scrollLeft: " + resolveVariable(node.userData.evt_data.scrollLeftEnd) +
                    "}, " + (resolveVariable(node.userData.evt_data.scrollTime) || 0.1) + ");";
            }
            break;
        case 'mouseup':
            if (bgSettings.simulatemouseup) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'mouseup', { clientX: " +
                    resolveVariable(node.userData.evt_data.clientX) +
                    ", clientY: " +
                    resolveVariable(node.userData.evt_data.clientY) +
                    " });";
            }
            break;
        case 'mouseover':
            if (bgSettings.simulatemouseover) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'mouseover', { clientX: " +
                    resolveVariable(node.userData.evt_data.clientX) +
                    ", clientY: " +
                    resolveVariable(node.userData.evt_data.clientY) +
                    " }); simulateHoverElement('" + resolveVariable(node.userData.evt_data.csspath) + "');";
            }
            break;
        case 'mouseout':
            if (bgSettings.simulatemouseout) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'mouseout', { clientX: " +
                    resolveVariable(node.userData.evt_data.clientX) +
                    ", clientY: " +
                    resolveVariable(node.userData.evt_data.clientY) +
                    " }); stopSimulateHover();";
            }
            break;
        case 'click':
            if (bgSettings.simulateclick) {
                if (node.userData.evt_data.button == 1) { // middle click
                    code = "jQuery('" + resolveVariable(node.userData.evt_data.csspath) + "')[0].dispatchEvent(new MouseEvent(\"click\",{\"button\": 1, \"which\": 1}));";
                } else {
                    code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0].click();";
                }
            }
            break;
        case 'focusin':
            if (bgSettings.simulatefocusin) {
                code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').focus();";
            }
            break;
        case 'focusout':
            if (bgSettings.simulatefocusout) {
                code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').blur();";
            }
            break;
        case 'keydown':
            if (bgSettings.simulatekeydown) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'keydown', { keyCode: " +
                    resolveVariable(node.userData.evt_data.keyCode) +
                    " });";
            }
            break;
        case 'keyup':
            if (bgSettings.simulatekeyup) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'keyup', { keyCode: " +
                    resolveVariable(node.userData.evt_data.keyCode) +
                    " });";
            }
            break;
        case 'keypress':
            if (bgSettings.simulatekeypress) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'keypress', { keyCode: " +
                    resolveVariable(node.userData.evt_data.keyCode) +
                    " });";
            }
            break;
        case 'submit':
            code = "simulate(" +
                "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                ",'submit', {});";
            break;
        case 'change':
            if (bgSettings.simulatechange) {
                code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').val('" +
                    resolveVariable(node.userData.evt_data.value);
            }
            break;
        case 'input':
            if (bgSettings.simulateinput) {
                code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').val('"
                    + resolveVariable(node.userData.evt_data.value) + "');";
            }
            break;
        case 'clipboard_cut':
            code = "document.execCommand('cut');";
            break;
        case 'clipboard_copy':
            code = "document.execCommand('copy');";
            break;
        case 'clipboard_paste':
            code = "document.execCommand('paste');";
            break;
        case 'purgecookies':
            return new Promise(function(resolve, reject) {
                chrome.cookies.getAll({}, function(cookies){
                    var cookiepurgeresults = [];
                    for (var i=0; i<cookies.length; i++) {
                        if (cookies[i].domain.includes(resolveVariable(node.userData.evt_data.searchterm))) {
                            var domain = cookies[i].domain;
                            if (domain[0] == ".")
                                domain = domain.substring(0);
                            cookiepurgeresults.push(domain);
                            domain = "https://" + domain;
                            chrome.cookies.remove({url: domain, name: cookies[i].name});
                        }
                    }

                    var cookieresults = "No cookies found for the search term provided";
                    if (cookiepurgeresults.length > 0) {
                        var uniqueDomains = cookiepurgeresults.filter(function(item, pos) {
                            return cookiepurgeresults.indexOf(item) == pos;
                        })
                        cookieresults = "Domains purged: " + uniqueDomains.join(", ");
                    }
                    
                    resolve({
                        error: (cookiepurgeresults.length > 0) ? true : false,
                        results: [cookieresults],
                        id: node.id,
                        time: Date.now()
                    });
                });
            });
        case 'tabchange':
            return new Promise(function(resolve, reject) {
                var activeTab = 0;

                if (!node.userData.evt_data.url.startsWith("http"))
                    node.userData.evt_data.url = "http://" + node.userData.evt_data.url;

                function changeActiveTab(tabs) {
                    for (var i=0; i<tabs.length; i++) {
                        if (tabs[i].active)
                            activeTab = i;
                    }
                    chrome.tabs.update(tabs[activeTab].id, {
                        url: resolveVariable(node.userData.evt_data.url)
                    });
                    
                    resolve({
                        error: false,
                        results: null,
                        id: node.id,
                        time: Date.now()
                    });
                }

                if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                    chrome.tabs.query({windowId: new_window.id}, function(tabs){
                        changeActiveTab(tabs);
                    });
                } else {
                    browser.tabs.query({windowId: new_window.id}).then(function(tabs){
                        changeActiveTab(tabs);
                    });
                }
            });
        case 'select':
            if (bgSettings.simulateselect) {
                code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').select();";
            }
            break;
        case 'setproxy':
            return new Promise(function(resolve, reject) {
                chrome.storage.local.set({proxy: {
                    username: resolveVariable(node.userData.evt_data.username),
                    password: resolveVariable(node.userData.evt_data.password),
                    scheme: resolveVariable(node.userData.evt_data.scheme),
                    host: resolveVariable(node.userData.evt_data.host),
                    port: resolveVariable(node.userData.evt_data.port),
                    ignore: [],
                    clear: false
                }},function(){
                    resolve({
                        error: false,
                        results: null,
                        id: node.id,
                        time: Date.now()
                    });
                });
            });
        case 'setvar':
            return new Promise(function(resolve, reject) {
                if (node.userData.evt_data.usage === undefined) // was never initially set
                    node.userData.evt_data.usage = "expression";

                if (node.userData.evt_data.usage == "expression") {
                    try {
                        var parser = new Parser();
                        simulation_variables[node.userData.evt_data.var] = parser.evaluate(node.userData.evt_data.expr,simulation_variables);
                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    } catch(err) {
                        reject({
                            error: true,
                            results: ["Error processing expression: " + err.message],
                            id: node.id,
                            time: Date.now()
                        });
                    }
                } else if (node.userData.evt_data.usage == "innertext") {
                    runCode("$('" + node.userData.evt_data.expr + "').text()", node).then(function(result){
                        simulation_variables[node.userData.evt_data.var] = result.results[0];
                        resolve({
                            error: false,
                            results: [JSON.stringify(simulation_variables[node.userData.evt_data.var])],
                            id: node.id,
                            time: Date.now()
                        });
                    });
                } else if (node.userData.evt_data.usage == "attrval") {
                    runCode("$('" + node.userData.evt_data.expr + "').val()", node).then(function(result){
                        simulation_variables[node.userData.evt_data.var] = result.results[0];
                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                } else if (node.userData.evt_data.usage == "urlparam") {
                    runCode("QueryString." + node.userData.evt_data.expr, node).then(function(result){
                        simulation_variables[node.userData.evt_data.var] = result.results[0];
                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                } else if (node.userData.evt_data.usage == "title") {
                    runCode("document.title", node).then(function(result){
                        simulation_variables[node.userData.evt_data.var] = result.results[0];
                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                } else if (node.userData.evt_data.usage == "url") {
                    runCode("document.url", node).then(function(result){
                        simulation_variables[node.userData.evt_data.var] = result.results[0];
                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                } else {
                    reject({
                        error: true,
                        results: ["Unknown value type in Set Variable"],
                        id: node.id,
                        time: Date.now()
                    });
                }
            });
        case 'recaptcha':
            return new Promise(function(resolve, reject) {
                code = 'if ($(".g-recaptcha").length > 0) { var sitekey = $(".g-recaptcha").attr("data-sitekey"); var url = location.host; sitekey; } else { throw "NOCAPTCHAFOUND"; }';
                runCode(code, node).then(function(result){
                    var sitekey = result.results[0];
                    runCode("location.host", node).then(function(result) {
                        $.ajax({
                            method: "POST",
                            url: "https://api.wildfire.ai/v1/premium-recaptcha",
                            data: sitekey + "," + result.results[0] + "," + bgSettings.cloudapikey || ""
                        }).always(function(resp) {
                            runCode("$('#g-recaptcha-response').html('" + resp.responseText + "');", node).then(function(result){
                            var runcode = "var script = document.createElement('script');\
                                script.setAttribute(\"type\", \"application/javascript\");\
                                script.textContent = \"eval($('.g-recaptcha').attr('data-callback') + '(\\\"" + resp.responseText + "\\\")');\";\
                                document.documentElement.appendChild(script);\
                                document.documentElement.removeChild(script);";
                            runCode(runcode, node).then(function(result){
                                resolve({
                                    error: false,
                                    results: [resp.responseText],
                                    id: node.id,
                                    time: Date.now()
                                });
                            });
                            });
                        });
                    });
                }).catch(function(result){
                    reject({
                        error: true,
                        results: null,
                        id: node.id,
                        time: Date.now()
                    });
                });
            });
        default:
            terminateSimulation(false, "Unknown event type: " + node.userData.evt); // TODO - check
            break;
    }
        
    return runCode(code, node);
}

function runCode(code, node) {
    return runCodeFrameURLPrefix(code, node, null);
}

function runCodeFrameURLPrefix(code, node, urlprefix) {
    return new Promise(function(resolve, reject) {
        if (code == "" || code == ";" || code == ";;") {
            resolve({
                error: false,
                results: null,
                id: node.id,
                time: Date.now()
            });
        }

        try {
            var frameId = 0;

            var activeTab = 0;

            function runCodeInActiveTab(tabs) {
                for (var i=0; i<tabs.length; i++) {
                    if (tabs[i].active)
                        activeTab = i;
                }

                chrome.webNavigation.getAllFrames({tabId: tabs[activeTab].id}, function (frames) {
                    for (var j=0; j<frames.length; j++) {
                        if (urlprefix != null && frames[j].frameId!=0 && frames[j].url.startsWith(urlprefix)) {
                            frameId = frames[j].frameId;
                            break;
                        } else if (frames[j].frameId!=0 && frames[j].url == node.userData.evt_data.url) {
                            frameId = frames[j].frameId;
                            break;
                        }
                    }

                    code = "try { " + code + "; } catch(err) { new Object({error: err.message, errorstack: err.stack}); }";

                    chrome.tabs.executeScript(tabs[activeTab].id,{
                        code: code,
                        frameId: frameId,
                        matchAboutBlank: true
                    }, function(results){
                        if (results && results.length==1 && results[0]!==null && !results[0].error) {
                            resolve({
                                error: false,
                                results: results,
                                id: node.id,
                                time: Date.now()
                            });
                        } else {
                            reject({
                                error: true,
                                results: results,
                                id: node.id,
                                time: Date.now()
                            });
                        }
                    });
                });
            }

            if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                chrome.tabs.query({windowId: new_window.id}, function(tabs){
                    runCodeInActiveTab(tabs);
                });
            } else {
                browser.tabs.query({windowId: new_window.id}).then(function(tabs){
                    runCodeInActiveTab(tabs);
                });
            }
        } catch(err) {
            reject({
                error: true,
                results: null,
                id: node.id,
                time: Date.now()
                //event: node
            });
        }
    });
}

function waitForTitle(resolve, expected_title, returnvar) {
    waitForTitleInterval = setInterval(function(){
        var activeTab = 0;
		try {
            function waitForTitleInActiveTab(tabs) {
                try {
					for (var i=0; i<tabs.length; i++) {
						if (tabs[i].active)
							activeTab = i;
					}
					chrome.tabs.executeScript(tabs[activeTab].id,{
						code: "document.title",
						frameId: 0, // TODO - frame support
						matchAboutBlank: true
					}, function(results){
						if (results && results[0] && results[0]==expected_title)
							resolve(returnvar);
					});
				} catch(err) {
					; //TODO: Process this
				}
            }

            if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                chrome.tabs.query({windowId: new_window.id}, function(tabs){
                    waitForTitleInActiveTab(tabs);
                });
            } else {
                browser.tabs.query({windowId: new_window.id}).then(function(tabs){
                    waitForTitleInActiveTab(tabs);
                });
            }
		} catch(err) {
			; //TODO: Process this
		}
    }, 100);
}

function testExpression(resolve, expression, returnvar) {
    testExpressionInterval = setInterval(function(){
        var activeTab = 0;
        try {
            expression = expression.replace("=","==").replace("====","==");

            var parser = new Parser();
            var result = parser.evaluate(expression,simulation_variables);
            if (result === true)
                resolve(returnvar);
        } catch(err) {
            ; //TODO: Process this
        }
    }, 100);
}

function waitForElement(resolve, csspath, returnvar) {
    waitForElementInterval = setInterval(function(){
        var activeTab = 0;
		try {
            function waitForElementInActiveTab(tabs) {
                try {
					for (var i=0; i<tabs.length; i++) {
						if (tabs[i].active)
							activeTab = i;
					}
					chrome.tabs.executeScript(tabs[activeTab].id,{
						code: "$('" + csspath + "').length",
						frameId: 0, // TODO - frame support
						matchAboutBlank: true
					}, function(results){
						if (results && results[0])
							resolve(returnvar);
					});
				} catch(err) {
					; //TODO: Process this
				}
            }

            if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                chrome.tabs.query({windowId: new_window.id}, function(tabs){
                    waitForElementInActiveTab(tabs);
                });
            } else {
                browser.tabs.query({windowId: new_window.id}).then(function(tabs){
                    waitForElementInActiveTab(tabs);
                });
            }

		} catch(err) {
			; //TODO: Process this
		}
    }, 100);
}

function terminateSimulation(finished, reason) {
	if (terminated)
		return;
	terminated = true; // prevent race against close listener

    chrome.storage.local.set({simulating: false});
	
    if (!isFavSim) {
    	chrome.windows.onRemoved.removeListener(closeListenerCallback);
        clearTimeout(timeoutObject);
    }
    chrome.storage.local.set({proxy: {clear: true}});

    chrome.browserAction.setBadgeText({ text: "" });

    if (!finished)
        send_message({
            type: "nodestatus",
            nodeid: last_node.id,
            status: "stop"
        });

    if (bgSettings.clearbrowsingdata) {
        chrome.browsingData.remove({
            "since": sim_start_time
        }, {
            "appcache": true,
            "cache": true,
            "cookies": true,
            "downloads": true,
            "fileSystems": true,
            "formData": true,
            "history": true,
            "indexedDB": true,
            "localStorage": true,
            "pluginData": true,
            "passwords": true,
            "webSQL": true
        }, function() {
            ;//console.log("Finished clearing browsing history");
        });
    }
	
    simulating = false;

    setTimeout(function(){
        chrome.notifications.create("sim_complete",{
            type: "basic",
            title: "Wildfire",
            message: "Simulation completed. Click here to view the results.",
            iconUrl: "icon-128.png"
        });
    },100);

	var node_details = [];
	for (var i=0; i<nodes.length; i++) {
		nodes[i].userData['id'] = nodes[i].id;
		node_details.push(nodes[i].userData);
	}

    try {
        chrome.tabs.captureVisibleTab(new_window.id,{
            "format": "png"
        }, function(imagedata){
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
                    node_details: node_details,
                    favorite: isFavSim
                });
                chrome.storage.local.set({simulations: simulations});
                if (!bgSettings.leavesimulationopen && !isFavSim)
                    chrome.windows.remove(new_window.id,function(){});
            });
        });
    } catch(err) {
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
                node_details: node_details,
                favorite: isFavSim
            });
            chrome.storage.local.set({simulations: simulations});
            if (!bgSettings.leavesimulationopen && !isFavSim)
                chrome.windows.remove(new_window.id,function(){});
        });
    }
}
