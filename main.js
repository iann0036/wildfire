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
var waitForElementInterval, waitForTitleInterval, testExpressionInterval, waitForTimeInterval, nativeInterval;
var simulating = false;
var last_node;
var isFavSim = false;
var simulation_variables = [];
var tracked_tabs = [];
var native_port = null;
var nativeRetries = 0;
var helperversion = null;
var latestNativeScreenshot = null;
var latestNativeScreenshotParts = [];

if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) { // Opera
    windowWidth*=window.devicePixelRatio;
    windowHeight*=window.devicePixelRatio;
}

// Commands

chrome.commands.onCommand.addListener(function(command) {
    if (command == "stop-simulation")
        terminateSimulation(false, "User terminated");
    else if (command == "run-current-workflow") {
        chrome.windows.getCurrent({populate: true}, function(curr_window) {
            begin_fav_sim(-1, curr_window);
        });
    } else {
        chrome.storage.local.get('favorites', function (result) {
            var favorites = result.favorites;
            var index = false;
            for (var i=0; i<favorites.length; i++) {
                if (command == "play-workflow-1" && favorites[i].shortcut == "1") {
                    index = i;
                    chrome.windows.getCurrent({populate: true}, function(curr_window) {
                        begin_fav_sim(index, curr_window);
                    });
                } else if (command == "play-workflow-2" && favorites[i].shortcut == "2") {
                    index = i;
                    chrome.windows.getCurrent({populate: true}, function(curr_window) {
                        begin_fav_sim(index, curr_window);
                    });
                } else if (command == "play-workflow-3" && favorites[i].shortcut == "3") {
                    index = i;
                    chrome.windows.getCurrent({populate: true}, function(curr_window) {
                        begin_fav_sim(index, curr_window);
                    });
                }
            }
        });
    }
});

// Native

function sendNativeMessage(message) {
    native_port.postMessage(message);
}

function onNativeMessage(message) {
    nativeRetries = 0;
    if (message['action'] == "init") {
        helperversion = message['response']['helperversion'];
    } else if (message['action'] == "screenshot") {
        latestNativeScreenshotParts.push(message['response']['image']);
        if (message['response']['lastpart']) {
            latestNativeScreenshot = new Image();
            latestNativeScreenshot.src = "data:image/png;base64," + latestNativeScreenshotParts.join("");
            latestNativeScreenshotParts = [];
        }
    }
}

function onNativeDisconnected() {
    console.warn("Native Disconnect");
    native_port = null;
    if (nativeRetries < 5) {
        nativeRetries+=1;
        nativeConnect();
    } else {
        helperversion = null;
    }
}

function nativeConnect() {
    native_port = chrome.runtime.connectNative("ai.wildfire");
    native_port.onMessage.addListener(onNativeMessage);
    native_port.onDisconnect.addListener(onNativeDisconnected);
    var manifest = chrome.runtime.getManifest();
    sendNativeMessage({
        'action': 'init',
        'version': manifest.version.toString()
    });
}

setInterval(function(){
    if (native_port == null)
        nativeConnect();
}, 30000);

nativeConnect();

// Alarms

chrome.alarms.onAlarm.addListener(function(alarm){
    var name = alarm.name;
    var name_parts = name.split("_");
    if (name.startsWith("scheduled_") && (name_parts.length == 2 || name_parts[2].includes(String(new Date().getDay())))) {
        chrome.notifications.create("beginning_scheduled_sim",{
            type: "basic",
            title: "Wildfire",
            message: "A scheduled simulation is about to start.",
            iconUrl: "icon-128.png"
        });
        setTimeout(function(){
            begin_sim_with_option(name_parts[1]);
            configureAlarms();
        },5000);
    }
});

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
                    var days = "";
                    if (scheduled[i].sunday!==false)
                        days += "0";
                    if (scheduled[i].monday!==false)
                        days += "1";
                    if (scheduled[i].tuesday!==false)
                        days += "2";
                    if (scheduled[i].wednesday!==false)
                        days += "3";
                    if (scheduled[i].thursday!==false)
                        days += "4";
                    if (scheduled[i].friday!==false)
                        days += "5";
                    if (scheduled[i].saturday!==false)
                        days += "6";
                    chrome.alarms.create("scheduled_" + scheduled[i].workflow + "_" + days, options);
                }
            }
        });
    });
}

////

function updateTrackedTabs() {
    chrome.tabs.query({}, function (tabs) {
        tracked_tabs = tabs;
    });
}

function resolveChar(str) {
    var charInt = parseInt(resolveVariable(str));

    if (charInt == 190)
        return ".";
    
    return String.fromCharCode(charInt);
}

function resolveVariable(str) {
    var ret = eresolveVariable(String(str).replace("\\","\\\\").replace("\`","\\\`"));
    //console.log("Resolved " + str + " to " + ret);
    return ret;
}

function eresolveVariable(str) {
    try {
        String.prototype.isAlNumUnderscore = function() {
            var regExp = /^[A-Za-z0-9_]+$/;
            return (this.match(regExp));
        };

        str = String(str);

        if (str.length < 2)
            return String(str);

        if (str.length > 1024)
            return "";

        if (str[0] != '$')
            return String(str[0]) + eresolveVariable(str.substring(1));
        if (str[1] == '$')
            return "$" + eresolveVariable(str.substring(2));
        
        var i = 2;
        var varname = false;
        while (!varname) {
            if (i > str.length)
                varname = str.substring(1,i-1);
            else if (str.substring(1,i).isAlNumUnderscore())
                i+=1;
            else
                varname = str.substring(1,i-1)
        }

        if (simulation_variables[varname] === undefined) {
            return eresolveVariable(str.substring(i-1));
        }

        return String(simulation_variables[varname]) + eresolveVariable(str.substring(i-1));
    } catch (e) {
        return "";
    }
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

function openUI(url) {
    if (typeof InstallTrigger === 'undefined') { // NOT Firefox
        chrome.tabs.query({
            windowType: "popup"
        }, function(tabs){
            chrome.windows.create({
                url: chrome.extension.getURL(url),
                type: "popup",
                width: windowWidth,
                height: windowHeight,
                left: Math.round(screen.width/2-(windowWidth/2)),
                top: Math.round(screen.height/2-(windowHeight/2))
            });
        });
    } else {
        chrome.windows.create({
            url: chrome.extension.getURL(url),
            width: windowWidth,
            height: windowHeight,
            left: Math.round(screen.width/2-(windowWidth/2)),
            top: Math.round(screen.height/2-(windowHeight/2))
        });
    }
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
        openUI("workfloweditor.html");
    } else if (notificationId == "sim_complete") {
        openUI("simulations.html#0");
    } else if (notificationId == "no_recorded_events") {
        openUI("docs/getting_started.html");
    } else if (notificationId == "event_log_imported") {
        openUI("eventlog.html");
    }
});

chrome.tabs.onActivated.addListener(
    function (activeInfo) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                setTimeout(function() { // delay to ensure tabremove goes first
                    if (events[events.length-1].evt == "tabremove" || (events[events.length-1].evt == "tabchange" && events[events.length-1].evt_data.id == activeInfo.tabId)) // ignore double events
                        return;

                    var tab_index = -1;
                    var tab_url = "";
                    for (var i=0; i<tracked_tabs.length; i++) {
                        if (tracked_tabs[i].id == activeInfo.tabId) {
                            tab_index = tracked_tabs[i].index;
                            tab_url = tracked_tabs[i].url;
                        }
                    }
                    events.push({
                        tab: tracked_tabs[i],
                        evt: 'tabswitch',
                        evt_data: {
                            id: activeInfo.tabId,
                            index: tab_index,
                            url: tab_url,
                            active: 0,
                            method: "url"
                        },
                        time: Date.now()
                    });
                    chrome.storage.local.set({events: events});
                    updateTrackedTabs();
                }, 500);
            }
        });
    }
);

chrome.tabs.onRemoved.addListener(
    function (tabId, removeInfo) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                var tab_index = -1;
                var tab_url = "";
                var tab_active = 0;

                for (var i=0; i<tracked_tabs.length; i++) {
                    if (tracked_tabs[i].id == tabId) {
                        tab_index = tracked_tabs[i].index;
                        tab_url = tracked_tabs[i].url;
                        tab_active = tracked_tabs[i].active;
                    }
                }
                events.push({
                    tab: tracked_tabs[i],
                    evt: 'tabremove',
                    evt_data: {
                        id: tabId,
                        index: tab_index,
                        url: tab_url,
                        active: tab_active,
                        method: (tab_active ? "active" : "url")
                    },
                    time: Date.now()
                });
                chrome.storage.local.set({events: events});
                updateTrackedTabs();
            }
        });
    }
);

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
                                newtab: (tab.url == "chrome://newtab/" || tab.url == "about:newtab" || tab.url == "chrome://startpage/"),
                                openerTabId: changeInfo.openerTabId,
                                url: tab.url,
                                active: tab.active,
                                prerender: false
                            },
                            time: Date.now()
                        });
                        chrome.storage.local.set({events: events});
					}
                    updateTrackedTabs();
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
                                newtab: (tab.url == "chrome://newtab/"),
                                openerTabId: tab.id,
                                url: tab.url,
                                active: tab.active,
                                prerender: true
                            },
                            time: Date.now()
                        });
                        chrome.storage.local.set({events: events});
                        updateTrackedTabs();
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

function updateNativeRecordingStatus() {
    if (bgSettings.recordnative) {
        chrome.storage.local.get('recording', function (isRecording) {
            /*
            if (isRecording.recording) {
                sendNativeMessage({
                    'action': 'start_recording'
                });
            } else {
                sendNativeMessage({
                    'action': 'stop_recording'
                });
            }
            */
            ;
        });
    }
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
	if (changes.recording != undefined) {
    	updateExtIcon();
        updateTrackedTabs();
        updateNativeRecordingStatus();
	}
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
    } else if (request.action == "loadCloudWorkflow") {
        chrome.storage.local.set({events: '{"events":[{"evt":"begin_recording","evt_data":{},"time":0},{"evt":"end_recording","evt_data":{},"time":1}]}'},function(){
            chrome.storage.local.set({workflow: request.workflow},function(){
                chrome.windows.getCurrent({populate: true}, function(curr_window) {
                    begin_fav_sim(-1, curr_window);
                });
            });
        });
    } else if (request.action == "getHelperStatus") {
        sendResponse({
            'native_port': native_port,
            'helperversion': helperversion,
            'retries': nativeRetries
        });
    }
});

/*
(function(history){
    var pushState = history.pushState;
    history.pushState = function(state) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate({state: state});
        }
        events.push({
            evt: "historypush",
            evt_data: state,
            time: Date.now()
        });
        chrome.storage.local.set({events: events});
        return pushState.apply(history, arguments);
    }
})(window.history);
*/

if (typeof InstallTrigger === 'undefined') { // NOT Firefox
    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if (request.action == "registrationStatus") {
            if (bgSettings != null) {
                sendResponse({
                    "success": true,
                    "account": bgSettings.account,
                    "cloudapikey": bgSettings.cloudapikey,
                    "version": chrome.runtime.getManifest().version
                });
            } else {
                sendResponse({
                    "success": false,
                    "version": chrome.runtime.getManifest().version
                });
            }
        } else if (request.action == "openExtension") {
            var windowWidth = 1280;
            var windowHeight = 800;
            chrome.windows.create({
                url: chrome.extension.getURL(request.url),
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
                "success": true,
                "version": chrome.runtime.getManifest().version
            });
        }
    });
}

chrome.runtime.onInstalled !== undefined && chrome.runtime.onInstalled.addListener(function(details){ // special handling - not present in FF
    chrome.storage.local.set({simulating: false});    
    if (details.reason == "install") {
        if (navigator.userAgent.includes("Wildfire")) {
            if (typeof InstallTrigger !== 'undefined') { // Firefox
                setTimeout(function(){
                    browser.windows.getCurrent({populate: true}).then(function(curr_window){
                        browser.tabs.update(curr_window.tabs[0].id, {url: browser.extension.getURL("new.html")});
                    });
                }, 1000);
            } else {
                chrome.windows.getCurrent({populate: true}, function(curr_window) {
                    chrome.tabs.update(curr_window.tabs[0].id, {url: chrome.extension.getURL("new.html")});
                });
            }
        } else {
            openUI("docs/getting_started.html");
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
	chrome.storage.local.get('favorites', function (result) {
        var favorites = result.favorites;
        if (!Array.isArray(favorites)) { // for safety only
            favorites = [];
        }
        if (typeof InstallTrigger !== 'undefined') // Firefox
            browser.contextMenus.removeAll().then(function(){
                if (bgSettings.rightclick) {
                    browser.contextMenus.create({
                        "title": "Run the current workflow",
                        "id": "wildfire-currentwf",
                        "contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"],
                        "onclick": function(info, tab){
                            browser.windows.get(tab.windowId, null).then(function(curr_window) {
                                begin_fav_sim(-1, curr_window);
                            });
                        }
                    });
                    for (var i=0; i<favorites.length; i++) {
                        if (favorites[i].rightclick)
                            browser.contextMenus.create({
                                "title": "Run '" + favorites[i].name + "'",
                                "id": "wildfire-favorite-" + i,
                                "contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"], // ignore chrome-extension://
                                "documentUrlPatterns": ["http://*/*","https://*/*"],
                                "onclick": function(info, tab){
                                    browser.windows.get(tab.windowId, null).then(function(curr_window) {
                                        begin_fav_sim(info.menuItemId.replace("wildfire-favorite-",""), curr_window);
                                    });
                                }
                            });
                    }
                    browser.contextMenus.create({
                        "type": "separator",
                        "id": "mf-sep",
                        "documentUrlPatterns": ["http://*/*","https://*/*"],
                        "contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"]
                    });
                    browser.contextMenus.create({
                        "title": "Manage Favorites",
                        "id": "mf",
                        "contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"],
                        "documentUrlPatterns": ["http://*/*","https://*/*"],
                        "onclick": function(){
                            openUI("settings.html#favorites");
                        }
                    });
                }
            });
        else {
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
                            openUI("settings.html#favorites");
                        }
                    });
                }
            });
        }
	});
}

setTimeout(function(){
    setContextMenus();
},5000);

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

if (typeof InstallTrigger !== 'undefined') { // Firefox
    browser.runtime.onConnect.addListener(function(new_port) {
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
} else {
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

function setDefaultSimulationVariables() {
    simulation_variables['_BROWSER'] = "unknown";
    if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
        simulation_variables['_BROWSER'] = "opera";
    else if (typeof InstallTrigger !== 'undefined')
        simulation_variables['_BROWSER'] = "firefox";
    else if (!!window.chrome)
        simulation_variables['_BROWSER'] = "chrome";

    simulation_variables['_OS'] = "unknown";
    if (['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].indexOf(window.navigator.platform) !== -1) {
        simulation_variables['_OS'] = 'mac';
    } else if (['Win32', 'Win64', 'Windows', 'WinCE'].indexOf(window.navigator.platform) !== -1) {
        simulation_variables['_OS'] = 'windows';
    }

    simulation_variables['_WINDOW_WIDTH'] = new_window.width;
    simulation_variables['_WINDOW_HEIGHT'] = new_window.height;
}

function begin_fav_sim(fav_index, curr_window) {
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
        }, 200, node);
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
            }, 60*60*1000*24); // 24 hours
			
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
                        if (events[1].evt != "tabchange" && events[1].evt_data.url && events[1].evt_data.url.length > 8) {
                            var initurl = events[1].evt_data.url;
                            if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                                chrome.tabs.query({windowId: new_window.id}, function(tabs){
                                    chrome.tabs.update(tabs[0].id,{url: initurl});
                                });
                            } else {
                                browser.tabs.query({windowId: new_window.id}).then(function(tabs){
                                    chrome.tabs.update(tabs[0].id,{url: initurl});
                                });
                            }
                            setTimeout(function(node){
                                processEvent(node);
                            }, 2000, node);
                        } else                    
                            processEvent(node);
                    }, 200, node);
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
                        if (events[1].evt != "tabchange" && events[1].evt_data.url && events[1].evt_data.url.length > 8) {
                            var initurl = events[1].evt_data.url;
                            if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                                chrome.tabs.query({windowId: new_window.id}, function(tabs){
                                    chrome.tabs.update(tabs[0].id,{url: initurl});
                                });
                            } else {
                                browser.tabs.query({windowId: new_window.id}).then(function(tabs){
                                    chrome.tabs.update(tabs[0].id,{url: initurl});
                                });
                            }
                            setTimeout(function(node){
                                processEvent(node);
                            }, 2000, node);
                        } else                    
                            processEvent(node);
                    }, 200, node);
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
    
    setDefaultSimulationVariables();

    execEvent(node).then(function(result){
        logResultAndRaceLinks(result, false, node);
    }).catch(function(result){
        logResultAndRaceLinks(result, true, node);
    });
}

function processOCR(imagedata, node, resolve, reject) {
    Tesseract.recognize(imagedata, {
        lang: 'eng'
    }).then(function(tessaresult){
        console.log(tessaresult);

        var fuzz = FuzzySet();
        var bestmatch = null;
        if (node.userData.evt_data.useFuzzyMatch) {
            for (var i=0; i<tessaresult.words.length; i++) {
                fuzz.add(tessaresult.words[i].text);
            }
            bestmatch = fuzz.get(node.userData.evt_data.ocrsearchterm, null, 0.3);
        }

        var word_matches = [];
        for (var i=0; i<tessaresult.words.length; i++) {
            if (node.userData.evt_data.useFuzzyMatch) {
                if (bestmatch && bestmatch[0][1] == tessaresult.words[i].text) {
                    word_matches.push(tessaresult.words[i]);
                    break;
                }
            } else if (tessaresult.words[i].text.includes(node.userData.evt_data.ocrsearchterm)) {
                word_matches.push(tessaresult.words[i]);
            }
        }
        
        if (word_matches.length > 0) {
            var matchtext = "";
            if (node.userData.evt_data.useFuzzyMatch) {
                matchtext = "\"" + bestmatch[0][1] + "\" (" + parseInt(bestmatch[0][0]*100) + "% match)";
            } else {
                matchtext = "\"" + node.userData.evt_data.ocrsearchterm + "\"";
            }

            if (node.userData.useOSInput) {
                simulation_variables['_FINDTEXT_X'] = parseInt((word_matches[0].bbox.x0 + (word_matches[0].bbox.x1 - word_matches[0].bbox.x0)/2)/window.devicePixelRatio);
                simulation_variables['_FINDTEXT_Y'] = parseInt((word_matches[0].bbox.y0 + (word_matches[0].bbox.y1 - word_matches[0].bbox.y0)/2)/window.devicePixelRatio);
                resolve({
                    error: false,
                    results: ["Matched " + matchtext + " at (" + simulation_variables['_FINDTEXT_X'] + "," + simulation_variables['_FINDTEXT_Y'] + ") in relation to the screen"],
                    id: node.id,
                    time: Date.now()
                });
            } else {
                simulation_variables['_FINDTEXT_X'] = parseInt((word_matches[0].bbox.x0 + (word_matches[0].bbox.x1 - word_matches[0].bbox.x0)/2)/window.devicePixelRatio);
                simulation_variables['_FINDTEXT_Y'] = parseInt((word_matches[0].bbox.y0 + (word_matches[0].bbox.y1 - word_matches[0].bbox.y0)/2)/window.devicePixelRatio);
                runCode("getCSSPath(document.elementFromPoint(" + simulation_variables['_FINDTEXT_X'] + ", " + simulation_variables['_FINDTEXT_Y'] + "), false)", node).then(function(result){
                    simulation_variables['_FINDTEXT_SELECTOR'] = result.results[0];
                    resolve({
                        error: false,
                        results: ["Matched " + matchtext + " at (" + simulation_variables['_FINDTEXT_X'] + "," + simulation_variables['_FINDTEXT_Y'] + ") with element selector " + simulation_variables['_FINDTEXT_SELECTOR']],
                        id: node.id,
                        time: Date.now()
                    });
                }).catch(function(result){
                    reject({
                        error: true,
                        results: ["Matched " + matchtext + " at (" + simulation_variables['_FINDTEXT_X'] + "," + simulation_variables['_FINDTEXT_Y'] + ") but could not identify element at that position"],
                        id: node.id,
                        time: Date.now()
                    });
                });
            }
        } else {
            resolve({
                error: true,
                results: ["Could not find a match for the search term"],
                id: node.id,
                time: Date.now()
            });
        }
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
        setTimeout(function(){
		    terminateSimulation(true, "");
        }, 100);
		return;
	}

	var nodeConnectionPromises = [];
	for (var i=0; i<links.length; i++) {
		if (links[i].source.node == node.id) {
			nodeConnectionPromises.push(
				new Promise(function(resolve, reject) {
					if (links[i].userData.evt == "timer") {
                        var wait_time = 0;
                        if (isNaN(parseFloat(links[i].userData.wait_time)))
                            wait_time = Number(resolveVariable(links[i].userData.wait_time)) * 1000;
                        else
                            wait_time = links[i].userData.wait_time;
						setTimeout(resolve, wait_time, links[i]);
					} else if (links[i].userData.evt == "wait_for_element") {
						waitForElement(resolve, resolveVariable(links[i].userData.csspath), links[i]);
					} else if (links[i].userData.evt == "wait_for_title") {
						waitForTitle(resolve, resolveVariable(links[i].userData.title), links[i]);
                    } else if (links[i].userData.evt == "test_expression") {
						testExpression(resolve, links[i].userData.expr, links[i]);
					} else if (links[i].userData.evt == "wait_for_time") {
						waitForTime(resolve, links[i].userData.waittilltime, links[i]);
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
			clearInterval(waitForTimeInterval);
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
        case 'closewindow':
            return new Promise(function(resolve, reject) {
                sendNativeMessage({
                    'action': 'closewindow'
                });
                resolve({
                    error: false,
                    results: null,
                    id: node.id,
                    time: Date.now()
                });
            });
        case 'mousedown':
            if (bgSettings.simulatemousedown) {
                if (node.userData.useOSInput) {
                    return new Promise(function(resolve, reject) {
                        var clickx = parseInt(resolveVariable(node.userData.evt_data.clientX)) || 0;
                        var clicky = parseInt(resolveVariable(node.userData.evt_data.clientY)) || 0;
                        
                        sendNativeMessage({
                            'action': 'mousedown',
                            'x': clickx.toString(),
                            'y': clicky.toString(),
                            'button': 'left'
                        });

                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                }

                if (node.userData.useDirectInput) {
                    return new Promise(function(resolve, reject) {
                        var clickx = parseInt(resolveVariable(node.userData.evt_data.clientX)) || 0;
                        var clicky = parseInt(resolveVariable(node.userData.evt_data.clientY)) || 0;
                        if (node.userData.evt_data.clientX==0 && node.userData.evt_data.clientY==0 && node.userData.evt_data.csspath!="") {
                            code = "$.extend($('" + resolveVariable(node.userData.evt_data.csspath) + "').offset(),{width: $('" + resolveVariable(node.userData.evt_data.csspath) + "').width(), height: $('" + resolveVariable(node.userData.evt_data.csspath) + "').height()});";
                        } else {
                            code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').focus();";
                        }
                        runCode(code, node).then(function(result){
                            chrome.tabs.query({windowId: new_window.id, active: true}, function(tabs) {
                                if ($.isNumeric(result.results[0].left) && $.isNumeric(result.results[0].top) && $.isNumeric(result.results[0].width) && $.isNumeric(result.results[0].height)) {
                                    clickx = parseInt(result.results[0].left) + parseInt(result.results[0].width/2);
                                    clicky = parseInt(result.results[0].top) + parseInt(result.results[0].height/2);
                                }
                                chrome.debugger.attach({ tabId: tabs[0].id }, "1.2");
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchMouseEvent', { type: 'mousePressed', x: clickx, y: clicky, button: "left"  });
                                chrome.debugger.detach({ tabId: tabs[0].id });

                                resolve({
                                    error: false,
                                    results: null,
                                    id: node.id,
                                    time: Date.now()
                                });
                            });
                        });
                    });
                }

                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'mousedown', { clientX: " +
                    parseInt(resolveVariable(node.userData.evt_data.clientX)) +
                    ", clientY: " +
                    parseInt(resolveVariable(node.userData.evt_data.clientY)) +
                    " });";
            }
            break;
        case 'scroll':
            if (bgSettings.simulatescroll) {
                code = "$('html, body').animate({" +
                    "scrollTop: " + parseInt(resolveVariable(node.userData.evt_data.scrollTopEnd)) + "," +
                    "scrollLeft: " + parseInt(resolveVariable(node.userData.evt_data.scrollLeftEnd)) +
                    "}, " + (resolveVariable(node.userData.evt_data.scrollTime) || 0.1) + ");true;";
            }
            break;
        case 'mouseup':
            if (bgSettings.simulatemouseup) {
                if (node.userData.useOSInput) {
                    return new Promise(function(resolve, reject) {
                        var clickx = parseInt(resolveVariable(node.userData.evt_data.clientX)) || 0;
                        var clicky = parseInt(resolveVariable(node.userData.evt_data.clientY)) || 0;
                        
                        sendNativeMessage({
                            'action': 'mouseup',
                            'x': clickx.toString(),
                            'y': clicky.toString(),
                            'button': 'left'
                        });

                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                }

                if (node.userData.useDirectInput) {
                    return new Promise(function(resolve, reject) {
                        var clickx = parseInt(resolveVariable(node.userData.evt_data.clientX)) || 0;
                        var clicky = parseInt(resolveVariable(node.userData.evt_data.clientY)) || 0;
                        if (node.userData.evt_data.clientX==0 && node.userData.evt_data.clientY==0 && node.userData.evt_data.csspath!="") {
                            code = "$.extend($('" + resolveVariable(node.userData.evt_data.csspath) + "').offset(),{width: $('" + resolveVariable(node.userData.evt_data.csspath) + "').width(), height: $('" + resolveVariable(node.userData.evt_data.csspath) + "').height()});";
                        } else {
                            code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').focus();";
                        }
                        runCode(code, node).then(function(result){
                            chrome.tabs.query({windowId: new_window.id, active: true}, function(tabs) {
                                if ($.isNumeric(result.results[0].left) && $.isNumeric(result.results[0].top) && $.isNumeric(result.results[0].width) && $.isNumeric(result.results[0].height)) {
                                    clickx = parseInt(result.results[0].left) + parseInt(result.results[0].width/2);
                                    clicky = parseInt(result.results[0].top) + parseInt(result.results[0].height/2);
                                }
                                chrome.debugger.attach({ tabId: tabs[0].id }, "1.2");
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x: clickx, y: clicky, button: "left"  });
                                chrome.debugger.detach({ tabId: tabs[0].id });

                                resolve({
                                    error: false,
                                    results: null,
                                    id: node.id,
                                    time: Date.now()
                                });
                            });
                        });
                    });
                }
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'mouseup', { clientX: " +
                    parseInt(resolveVariable(node.userData.evt_data.clientX)) +
                    ", clientY: " +
                    parseInt(resolveVariable(node.userData.evt_data.clientY)) +
                    " });";
            }
            break;
        case 'mouseover':
            if (bgSettings.simulatemouseover) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'mouseover', { clientX: " +
                    parseInt(resolveVariable(node.userData.evt_data.clientX)) +
                    ", clientY: " +
                    parseInt(resolveVariable(node.userData.evt_data.clientY)) +
                    " }); simulateHoverElement('" + resolveVariable(node.userData.evt_data.csspath) + "');";
            }
            break;
        case 'mouseout':
            if (bgSettings.simulatemouseout) {
                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'mouseout', { clientX: " +
                    parseInt(resolveVariable(node.userData.evt_data.clientX)) +
                    ", clientY: " +
                    parseInt(resolveVariable(node.userData.evt_data.clientY)) +
                    " }); stopSimulateHover();";
            }
            break;
        case 'click':
            if (bgSettings.simulateclick) {
                if (node.userData.useOSInput) {
                    return new Promise(function(resolve, reject) {
                        var clickx = parseInt(resolveVariable(node.userData.evt_data.clientX)) || 0;
                        var clicky = parseInt(resolveVariable(node.userData.evt_data.clientY)) || 0;
                        
                        sendNativeMessage({
                            'action': 'click',
                            'x': clickx.toString(),
                            'y': clicky.toString(),
                            'button': 'left',
                            'double': 'false'
                        });

                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                }

                if (node.userData.useDirectInput) {
                    return new Promise(function(resolve, reject) {
                        var clickx = parseInt(resolveVariable(node.userData.evt_data.clientX)) || 0;
                        var clicky = parseInt(resolveVariable(node.userData.evt_data.clientY)) || 0;
                        if (node.userData.evt_data.clientX==0 && node.userData.evt_data.clientY==0 && node.userData.evt_data.csspath!="") {
                            code = "$.extend($('" + resolveVariable(node.userData.evt_data.csspath) + "').offset(),{width: $('" + resolveVariable(node.userData.evt_data.csspath) + "').width(), height: $('" + resolveVariable(node.userData.evt_data.csspath) + "').height()});";
                        } else {
                            code = "{};";
                        }
                        runCode(code, node).then(function(result){
                            chrome.tabs.query({windowId: new_window.id, active: true}, function(tabs) {
                                if (result.results[0]!=null && $.isNumeric(result.results[0].left) && $.isNumeric(result.results[0].top) && $.isNumeric(result.results[0].width) && $.isNumeric(result.results[0].height)) {
                                    clickx = parseInt(result.results[0].left) + parseInt(result.results[0].width/2);
                                    clicky = parseInt(result.results[0].top) + parseInt(result.results[0].height/2);
                                }
                                chrome.debugger.attach({ tabId: tabs[0].id }, "1.2");
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchMouseEvent', { type: 'mousePressed', x: clickx, y: clicky, button: "left", clickCount: 1  });
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x: clickx, y: clicky, button: "left"  });
                                chrome.debugger.detach({ tabId: tabs[0].id });

                                resolve({
                                    error: false,
                                    results: null,
                                    id: node.id,
                                    time: Date.now()
                                });
                            });
                        });
                    });
                }

                code = "";

                if (node.userData.evt_data.downloadlinks)
                    code += "if ($('" + resolveVariable(node.userData.evt_data.csspath) + "').prop('tagName') == 'A'){ var downloadattrstatus = $('" + resolveVariable(node.userData.evt_data.csspath) + "').attr('download'); $('" + resolveVariable(node.userData.evt_data.csspath) + "').attr('download',''); };"

                if (node.userData.evt_data.button == 1) { // middle click
                    code += "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0].dispatchEvent(new MouseEvent(\"click\",{\"button\": 1, \"which\": 1}));";
                } else {
                    code += "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0].click();";
                }

                if (node.userData.evt_data.downloadlinks)
                    code += "if ($('" + resolveVariable(node.userData.evt_data.csspath) + "').prop('tagName') == 'A'){ if (downloadattrstatus===undefined) { $('" + resolveVariable(node.userData.evt_data.csspath) + "').removeAttr('download'); }; };";
                code += "true;";
            }
            break;
        case 'focusin':
            if (bgSettings.simulatefocusin) {
                code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').focus();true;";
            }
            break;
        case 'focusout':
            if (bgSettings.simulatefocusout) {
                code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').blur();true;";
            }
            break;
        case 'keydown':
            if (bgSettings.simulatekeydown) {
                if (node.userData.useOSInput) {
                    return new Promise(function(resolve, reject) {
                        sendNativeMessage({
                            'action': 'keydown',
                            'key': String(parseInt(resolveVariable(node.userData.evt_data.keyCode))),
                            'keystr': String.fromCharCode(parseInt(resolveVariable(node.userData.evt_data.keyCode)))
                        });

                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                }

                if (node.userData.useDirectInput) {
                    return new Promise(function(resolve, reject) {
                        code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').focus();";
                        runCode(code, node).then(function(result){
                            chrome.tabs.query({windowId: new_window.id, active: true}, function(tabs) {
                                chrome.debugger.attach({ tabId: tabs[0].id }, "1.0");
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: String.fromCharCode(parseInt(resolveVariable(node.userData.evt_data.keyCode))), text: String.fromCharCode(parseInt(resolveVariable(node.userData.evt_data.keyCode))), type: 'rawKeyDown', windowsVirtualKeyCode: parseInt(resolveVariable(node.userData.evt_data.keyCode)), nativeVirtualKeyCode : parseInt(resolveVariable(node.userData.evt_data.keyCode)), macCharCode: parseInt(resolveVariable(node.userData.evt_data.keyCode))  });
                                chrome.debugger.detach({ tabId: tabs[0].id });
                                resolve({
                                    error: false,
                                    results: null,
                                    id: node.id,
                                    time: Date.now()
                                });
                            });
                        }).catch(function(result){
                            resolve({
                                error: true,
                                results: [JSON.stringify(result)],
                                id: node.id,
                                time: Date.now()
                            });
                        });
                    });
                }

                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'keydown', { keyCode: " +
                    resolveVariable(node.userData.evt_data.keyCode) +
                    " });";
            }
            break;
        case 'keyup':
            if (bgSettings.simulatekeyup) {
                if (node.userData.useOSInput) {
                    return new Promise(function(resolve, reject) {
                        sendNativeMessage({
                            'action': 'keyup',
                            'key': String(parseInt(resolveVariable(node.userData.evt_data.keyCode))),
                            'keystr': String.fromCharCode(parseInt(resolveVariable(node.userData.evt_data.keyCode)))
                        });

                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                }

                if (node.userData.useDirectInput) {
                    return new Promise(function(resolve, reject) {
                        code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').focus();";
                        runCode(code, node).then(function(result){
                            chrome.tabs.query({windowId: new_window.id, active: true}, function(tabs) {
                                chrome.debugger.attach({ tabId: tabs[0].id }, "1.0");
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: String.fromCharCode(parseInt(resolveVariable(node.userData.evt_data.keyCode))), text: String.fromCharCode(parseInt(resolveVariable(node.userData.evt_data.keyCode))), type: 'keyUp', windowsVirtualKeyCode: parseInt(resolveVariable(node.userData.evt_data.keyCode)), nativeVirtualKeyCode : parseInt(resolveVariable(node.userData.evt_data.keyCode)), macCharCode: parseInt(resolveVariable(node.userData.evt_data.keyCode))  });
                                chrome.debugger.detach({ tabId: tabs[0].id });
                                resolve({
                                    error: false,
                                    results: null,
                                    id: node.id,
                                    time: Date.now()
                                });
                            });
                        }).catch(function(result){
                            resolve({
                                error: true,
                                results: [JSON.stringify(result)],
                                id: node.id,
                                time: Date.now()
                            });
                        });
                    });
                }

                code = "simulate(" +
                    "$('" + resolveVariable(node.userData.evt_data.csspath) + "')[0]" +
                    ",'keyup', { keyCode: " +
                    resolveVariable(node.userData.evt_data.keyCode) +
                    " });";
            }
            break;
        case 'keypress':
            if (bgSettings.simulatekeypress) {
                if (node.userData.useOSInput) {
                    return new Promise(function(resolve, reject) { 
                        sendNativeMessage({
                            'action': 'keypress',
                            'key': String(parseInt(resolveVariable(node.userData.evt_data.keyCode))),
                            'keystr': String.fromCharCode(parseInt(resolveVariable(node.userData.evt_data.keyCode)))
                        });

                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                }
                
                if (node.userData.useDirectInput) {
                    return new Promise(function(resolve, reject) {
                        code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').focus();";
                        runCode(code, node).then(function(result){
                            chrome.tabs.query({windowId: new_window.id, active: true}, function(tabs) {
                                chrome.debugger.attach({ tabId: tabs[0].id }, "1.0");
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: resolveChar(node.userData.evt_data.keyCode), text: resolveChar(node.userData.evt_data.keyCode), type: 'rawKeyDown', windowsVirtualKeyCode: parseInt(resolveVariable(node.userData.evt_data.keyCode)), nativeVirtualKeyCode : parseInt(resolveVariable(node.userData.evt_data.keyCode)), macCharCode: parseInt(resolveVariable(node.userData.evt_data.keyCode))  });
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: resolveChar(node.userData.evt_data.keyCode), text: resolveChar(node.userData.evt_data.keyCode), type: 'char', windowsVirtualKeyCode: parseInt(resolveVariable(node.userData.evt_data.keyCode)), nativeVirtualKeyCode : parseInt(resolveVariable(node.userData.evt_data.keyCode)), macCharCode: parseInt(resolveVariable(node.userData.evt_data.keyCode))  });
                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: resolveChar(node.userData.evt_data.keyCode), text: resolveChar(node.userData.evt_data.keyCode), type: 'keyUp', windowsVirtualKeyCode: parseInt(resolveVariable(node.userData.evt_data.keyCode)), nativeVirtualKeyCode : parseInt(resolveVariable(node.userData.evt_data.keyCode)), macCharCode: parseInt(resolveVariable(node.userData.evt_data.keyCode))  });
                                chrome.debugger.detach({ tabId: tabs[0].id });
                                resolve({
                                    error: false,
                                    results: null,
                                    id: node.id,
                                    time: Date.now()
                                });
                            });
                        }).catch(function(result){
                            resolve({
                                error: true,
                                results: [JSON.stringify(result)],
                                id: node.id,
                                time: Date.now()
                            });
                        });
                    });
                }

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
                    resolveVariable(node.userData.evt_data.value) + "');true;";
            }
            break;
        case 'input':
            if (bgSettings.simulateinput) {
                if (node.userData.useOSInput) {
                    return new Promise(function(resolve, reject) {
                        sendNativeMessage({
                            'action': 'input',
                            'string': resolveVariable(node.userData.evt_data.value)
                        });

                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                }

                if (node.userData.useDirectInput) {
                    return new Promise(function(resolve, reject) {
                        try {
                            code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').focus();$('" + resolveVariable(node.userData.evt_data.csspath) + "').val();";
                            
                            runCode(code, node).then(function(result){
                                chrome.tabs.query({windowId: new_window.id, active: true}, function(tabs) {
                                    // TODO - deal with period char
                                    if (result.results[0] == resolveVariable(node.userData.evt_data.value).slice(0, -1)) {
                                        chrome.debugger.attach({ tabId: tabs[0].id }, "1.0");
                                        chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: node.userData.evt_data.value[node.userData.evt_data.value.length-1], text: node.userData.evt_data.value[node.userData.evt_data.value.length-1], type: 'rawKeyDown', windowsVirtualKeyCode: (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)), nativeVirtualKeyCode : (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)), macCharCode: (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0))  });
                                        chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: node.userData.evt_data.value[node.userData.evt_data.value.length-1], text: node.userData.evt_data.value[node.userData.evt_data.value.length-1], type: 'char', windowsVirtualKeyCode: (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)), nativeVirtualKeyCode : (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)), macCharCode: (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0))  });
                                        chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: node.userData.evt_data.value[node.userData.evt_data.value.length-1], text: node.userData.evt_data.value[node.userData.evt_data.value.length-1], type: 'keyUp', windowsVirtualKeyCode: (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)), nativeVirtualKeyCode : (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)), macCharCode: (node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0)=="." ? 190 : node.userData.evt_data.value[node.userData.evt_data.value.length-1].charCodeAt(0))  });
                                        chrome.debugger.detach({ tabId: tabs[0].id });     
                                        resolve({
                                            error: false,
                                            results: null,
                                            id: node.id,
                                            time: Date.now()
                                        });
                                    } else if (result.results[0] == node.userData.evt_data.value) {
                                        resolve({
                                            error: false,
                                            results: null,
                                            id: node.id,
                                            time: Date.now()
                                        });
                                    } else {
                                        code = "$('" + resolveVariable(node.userData.evt_data.csspath) + "').val('');";
                                        
                                        runCode(code, node).then(function(result){
                                            for (var j=0; j<resolveVariable(node.userData.evt_data.value).length; j++) {
                                                chrome.debugger.attach({ tabId: tabs[0].id }, "1.0");
                                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: resolveVariable(node.userData.evt_data.value)[j], text: resolveVariable(node.userData.evt_data.value)[j], type: 'rawKeyDown', windowsVirtualKeyCode: (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0)), nativeVirtualKeyCode : (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0)), macCharCode: (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0))  });
                                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: resolveVariable(node.userData.evt_data.value)[j], text: resolveVariable(node.userData.evt_data.value)[j], type: 'char', windowsVirtualKeyCode: (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0)), nativeVirtualKeyCode : (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0)), macCharCode: (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0))  });
                                                chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { unmodifiedText: resolveVariable(node.userData.evt_data.value)[j], text: resolveVariable(node.userData.evt_data.value)[j], type: 'keyUp', windowsVirtualKeyCode: (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0)), nativeVirtualKeyCode : (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0)), macCharCode: (resolveVariable(node.userData.evt_data.value)[j]=="." ? 190 : resolveVariable(node.userData.evt_data.value)[j].charCodeAt(0))  });
                                                chrome.debugger.detach({ tabId: tabs[0].id });
                                            }
                                            resolve({
                                                error: false,
                                                results: null,
                                                id: node.id,
                                                time: Date.now()
                                            });
                                        });
                                    } 
                                });
                            }).catch(function(result){
                                resolve({
                                    error: true,
                                    results: [JSON.stringify(result)],
                                    id: node.id,
                                    time: Date.now()
                                });
                            });
                        } catch(e) {
                            resolve({
                                error: true,
                                results: [e.message],
                                id: node.id,
                                time: Date.now()
                            });
                        }
                    });
                }

                code = "var tmp_input = '" +
                    resolveVariable(node.userData.evt_data.value) +
                    "';$('" + resolveVariable(node.userData.evt_data.csspath) + "').val(tmp_input);true;";
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
        case 'tabremove':
            return new Promise(function(resolve, reject) {
                function removeTab(tabs) {
                    var removedTab = null;

                    for (var i=0; i<tabs.length; i++) {
                        if (resolveVariable(node.userData.evt_data.method) == "active") {
                            if (tabs[i].active) {
                                removedTab = i;
                                chrome.tabs.remove(tabs[removedTab].id); // wrap it so it can remove multiple tabs
                            }
                        } else if (resolveVariable(node.userData.evt_data.method) == "url") {
                            if (tabs[i].url == resolveVariable(node.userData.evt_data.url)) {
                                removedTab = i;
                                chrome.tabs.remove(tabs[removedTab].id);
                            }
                        } else if (resolveVariable(node.userData.evt_data.method) == "index") {
                            if (tabs[i].index == resolveVariable(node.userData.evt_data.index)) {
                                removedTab = i;
                                chrome.tabs.remove(tabs[removedTab].id);
                            }
                        } else if (resolveVariable(node.userData.evt_data.method) == "id") {
                            if (tabs[i].id == resolveVariable(node.userData.evt_data.id)) {
                                removedTab = i;
                                chrome.tabs.remove(tabs[removedTab].id);
                            }
                        }
                    }

                    if (removedTab==null)
                        reject({
                            error: true,
                            results: ["Could not find the tab to remove"],
                            id: node.id,
                            time: Date.now()
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
                        removeTab(tabs);
                    });
                } else {
                    browser.tabs.query({windowId: new_window.id}).then(function(tabs){
                        removeTab(tabs);
                    });
                }
            });
        case 'tabswitch':
            return new Promise(function(resolve, reject) {
                function switchTabs(tabs) {
                    var newActiveTab = null;

                    for (var i=0; i<tabs.length; i++) {
                        if (resolveVariable(node.userData.evt_data.method) == "active") {
                            if (tabs[i].active)
                                newActiveTab = i;
                        } else if (resolveVariable(node.userData.evt_data.method) == "url") {
                            if (tabs[i].url == resolveVariable(node.userData.evt_data.url))
                                newActiveTab = i;
                        } else if (resolveVariable(node.userData.evt_data.method) == "index") {
                            if (tabs[i].index == resolveVariable(node.userData.evt_data.index))
                                newActiveTab = i;
                        } else if (resolveVariable(node.userData.evt_data.method) == "id") {
                            if (tabs[i].id == resolveVariable(node.userData.evt_data.id))
                                newActiveTab = i;
                        }
                    }

                    if (newActiveTab==null)
                        reject({
                            error: true,
                            results: ["Could not find the tab to switch to"],
                            id: node.id,
                            time: Date.now()
                        });

                    chrome.tabs.update(tabs[newActiveTab].id, {
                        active: true
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
                        switchTabs(tabs);
                    });
                } else {
                    browser.tabs.query({windowId: new_window.id}).then(function(tabs){
                        switchTabs(tabs);
                    });
                }
            });
        case 'tabchange':
            return new Promise(function(resolve, reject) {
                var activeTab = 0;

                var resolvedURL = resolveVariable(node.userData.evt_data.url);

                if (!resolvedURL.startsWith("http") && !resolvedURL.startsWith("about") && !resolvedURL.startsWith("chrome") && !resolvedURL.startsWith("moz"))
                    resolvedURL = "http://" + resolvedURL;

                function changeActiveTab(tabs) {
                    for (var i=0; i<tabs.length; i++) {
                        if (tabs[i].active)
                            activeTab = i;
                    }
                    if (node.userData.evt_data.newtab && tabs[activeTab].url != chrome.extension.getURL("new.html")) {
                        chrome.tabs.create({
                            windowId: new_window.id,
                            url: resolvedURL
                        });
                    } else {
                        chrome.tabs.update(tabs[activeTab].id, {
                            url: resolvedURL
                        });
                    }
                    
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
        case 'customjs':
            code = resolveVariable(node.userData.evt_data.code);
            break;
        case 'setproxy':
            return new Promise(function(resolve, reject) {
                chrome.storage.local.set({proxy: {
                    username: resolveVariable(node.userData.evt_data.username),
                    password: resolveVariable(node.userData.evt_data.password),
                    scheme: resolveVariable(node.userData.evt_data.scheme),
                    host: resolveVariable(node.userData.evt_data.host),
                    port: Math.round(resolveVariable(node.userData.evt_data.port)),
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
        case 'ocr':
            return new Promise(function(resolve, reject) {
                if (node.userData.useOSInput) {
                    latestNativeScreenshot = null;
                    sendNativeMessage({
                        'action': 'screenshot'
                    });
                    nativeInterval = setInterval(function(node, resolve, reject){
                        if (latestNativeScreenshot) {
                            clearInterval(nativeInterval);
                            processOCR(latestNativeScreenshot, node, resolve, reject);
                        }
                    }, 100, node, resolve, reject);
                } else {
                    chrome.tabs.captureVisibleTab(new_window.id,{
                        "format": "png"
                    }, function(imagedata){
                        processOCR(imagedata, node, resolve, reject);
                    });
                }
            });
        case 'subimage':
            return new Promise(function(resolve, reject) {
                if (node.userData.useOSInput) {
                    latestNativeScreenshot = null;
                    sendNativeMessage({
                        'action': 'screenshot'
                    });
                    nativeInterval = setInterval(function(node, resolve, reject){
                        if (latestNativeScreenshot) {
                            clearInterval(nativeInterval);
                            findSubimage(latestNativeScreenshot.src, node.userData.evt_data.subimgresults, node.userData.evt_data.colorvariance, node, resolve, reject);
                        }
                    }, 100, node, resolve, reject);
                } else {
                    chrome.tabs.captureVisibleTab(new_window.id,{
                        "format": "png"
                    }, function(imagedata){
                        findSubimage(imagedata, node.userData.evt_data.subimgresults, node.userData.evt_data.colorvariance, node, resolve, reject);
                    });
                }
            });
        case 'screenshot':
            return new Promise(function(resolve, reject) {
                latestNativeScreenshot = null;
                if (node.userData.useOSInput) {
                    sendNativeMessage({
                        'action': 'screenshot'
                    });
                    nativeInterval = setInterval(function(node, resolve, reject){
                        if (latestNativeScreenshot) {
                            clearInterval(nativeInterval);
                            resolve({
                                error: false,
                                results: [latestNativeScreenshot.src],
                                id: node.id,
                                time: Date.now()
                            });
                        }
                    }, 100, node, resolve, reject);
                } else {
                    chrome.tabs.captureVisibleTab(new_window.id,{
                        "format": "png"
                    }, function(imagedata){
                        resolve({
                            error: false,
                            results: [imagedata],
                            id: node.id,
                            time: Date.now()
                        });
                    });
                }
            });
        case 'csvimport':
            return new Promise(function(resolve, reject) {
                try {
                    var rows = node.userData.evt_data.csvresults.data;
                    for (var j=1; j<rows.length; j++) {
                        for (var k=0; k<rows[j].length; k++) {
                            if (rows[0][k][0] != '_')
                                simulation_variables[rows[0][k] + "." + j] = rows[j][k];
                        }
                    }

                    resolve({
                        error: false,
                        results: ["Processed " + (rows.length-1) + " lines of data"],
                        id: node.id,
                        time: Date.now()
                    });
                } catch(err) {
                    reject({
                        error: true,
                        results: ["Error processing CSV file"],
                        id: node.id,
                        time: Date.now()
                    });
                }
            });
        case 'setvar':
            return new Promise(function(resolve, reject) {
                if (node.userData.evt_data.var[0] == '_')
                    reject({
                        error: true,
                        results: ["Error processing expression: " + err.message],
                        id: node.id,
                        time: Date.now()
                    });

                if (node.userData.evt_data.usage === undefined) // was never initially set
                    node.userData.evt_data.usage = "expression";

                if (node.userData.evt_data.usage == "expression") {
                    try {
                        var parser = new Parser();
                        try {
                            simulation_variables[node.userData.evt_data.var] = parser.evaluate(node.userData.evt_data.expr,simulation_variables);
                        } catch(err) {
                            simulation_variables[node.userData.evt_data.var] = parser.evaluate('"' + node.userData.evt_data.expr + '"',simulation_variables);
                        }
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
                    }).catch(function(result){
                        reject({
                            error: true,
                            results: null,
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
                    }).catch(function(result){
                        reject({
                            error: true,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                } else if (node.userData.evt_data.usage == "outerhtml") {
                    runCode("$('" + node.userData.evt_data.expr + "')[0].outerHTML", node).then(function(result){
                        simulation_variables[node.userData.evt_data.var] = result.results[0];
                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    }).catch(function(result){
                        reject({
                            error: true,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    });
                } else if (node.userData.evt_data.usage == "elemattr") {
                    runCode("$('" + node.userData.evt_data.expr + "')[0].getAttribute('" + node.userData.evt_data.attribute + "')", node).then(function(result){
                        simulation_variables[node.userData.evt_data.var] = result.results[0];
                        resolve({
                            error: false,
                            results: null,
                            id: node.id,
                            time: Date.now()
                        });
                    }).catch(function(result){
                        reject({
                            error: true,
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
                    }).catch(function(result){
                        reject({
                            error: true,
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
                    }).catch(function(result){
                        reject({
                            error: true,
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
                    }).catch(function(result){
                        reject({
                            error: true,
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
                code = 'if ($(".g-recaptcha").length > 0 || document.location.href.includes("k=")) { var end = document.location.href.indexOf("&",document.location.href.indexOf("k=")); if(end==-1) end = document.location.href.indexOf("#",document.location.href.indexOf("k=")); if(end==-1) end = 9999; var sitekey = $(".g-recaptcha").attr("data-sitekey") || document.location.href.substring(document.location.href.indexOf("k=")+2,end);sitekey; } else { throw "NOCAPTCHAFOUND"; }';
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
                                    script.textContent = \"window['___grecaptcha_cfg']['clients'][0]['T']['Rk']['callback']('" + resp.responseText + "');\";\
                                    document.documentElement.appendChild(script);\
                                    document.documentElement.removeChild(script);";
                                runCode(runcode, node).then(function(result){
                                    setTimeout(function(){
                                        resolve({
                                            error: false,
                                            results: [resp.responseText],
                                            id: node.id,
                                            time: Date.now()
                                        });
                                    },3000);
                                }).catch(function(result){
                                    setTimeout(function(){
                                        resolve({
                                            error: false,
                                            results: [resp.responseText],
                                            id: node.id,
                                            time: Date.now()
                                        });
                                    },3000);
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
                        if (code.includes("NOCAPTCHAFOUND") && frames[j].url.includes("www.google.com/recaptcha/api2")) {
                            frameId = frames[j].frameId;
                            break;
                        }
                        if (urlprefix != null && frames[j].frameId!=0 && frames[j].url.startsWith(urlprefix)) {
                            frameId = frames[j].frameId;
                            break;
                        } else if (frames[j].frameId!=0 && frames[j].url == node.userData.evt_data.url) {
                            frameId = frames[j].frameId;
                            break;
                        }
                    }

                    code = "try { " + code + "; } catch(err) { new Object({error: err.message, errorstack: err.stack}); }";

                    if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                        chrome.tabs.executeScript(tabs[activeTab].id,{
                            code: code,
                            frameId: frameId,
                            //allFrames: true,
                            matchAboutBlank: true
                        }, function(results){
                            if (results && results.length==1 && ((results[0]!==null && !results[0].error) || results[0]===null)) {
                                resolve({
                                    error: false,
                                    results: results,
                                    id: node.id,
                                    time: Date.now()
                                });
                            } else {
                                // Check for and handle special errors here
                                reject({
                                    error: true,
                                    results: results,
                                    id: node.id,
                                    time: Date.now()
                                });
                            }
                        });
                    } else {
                        browser.tabs.executeScript(tabs[activeTab].id,{
                            code: code,
                            frameId: frameId,
                            //allFrames: true,
                            matchAboutBlank: true
                        }).then(function(results){
                            if (results && results.length==1 && ((results[0]!==null && !results[0].error) || results[0]===null))
                                resolve({
                                    error: false,
                                    results: results,
                                    id: node.id,
                                    time: Date.now()
                                });
                            else
                                reject({
                                    error: true,
                                    results: results,
                                    id: node.id,
                                    time: Date.now()
                                });
                        },function(results){
                            // Check for and handle special errors here
                            reject({
                                error: true,
                                results: results,
                                id: node.id,
                                time: Date.now()
                            });
                        });
                    }
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

function waitForTime(resolve, time, returnvar) {
    waitForTimeInterval = setInterval(function(){
        if (time === undefined)
            time = "12:00:00 AM";
        
        var b = time.match(/\d+/g);
        if (!b) return;

        var d = new Date();
        d.setHours(b[0]>12? b[0] : b[0]%12 + (/p/i.test(time)? 12 : 0), // hours
             /\d/.test(b[1])? b[1] : 0,     // minutes
             /\d/.test(b[2])? b[2] : 0);    // seconds
        
        if (d.toTimeString() == new Date().toTimeString())
            resolve(returnvar);
    }, 100);
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
				} catch(err) {;}
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
		} catch(err) {;}
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
        } catch(err) {;}
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
                        //allFrames: true,
						matchAboutBlank: true
					}, function(results){
						if (results && results[0])
							resolve(returnvar);
					});
				} catch(err) {;}
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

		} catch(err) {;}
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
                if (simulations.length > 4)
                    simulations.splice(0, simulations.length - 4);
                chrome.storage.local.set({simulations: simulations});
                if (navigator.userAgent.includes("Wildfire")) {
                    chrome.tabs.query({windowId: new_window.id}, function(tabs){
                        chrome.tabs.update(tabs[0].id,{
                            url: chrome.extension.getURL("blank.html")
                        });
                    });
                } else if (!bgSettings.leavesimulationopen && !isFavSim)
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
            if (simulations.length > 4)
                simulations.splice(0, simulations.length - 4);
            chrome.storage.local.set({simulations: simulations});
            if (!bgSettings.leavesimulationopen && !isFavSim)
                chrome.windows.remove(new_window.id,function(){});
        });
    }
}

function pixelMatch(px1, px2, variance) {
    return (Math.abs(px1[0]-px2[0])<variance && Math.abs(px1[1]-px2[1])<variance && Math.abs(px1[2]-px2[2])<variance && Math.abs(px1[3]-px2[3])<variance);
}

function findSubimage(haystackSrc, needleSrc, color_variance, node, resolve, reject) {
    var haystackCanvas = document.createElement('canvas');
    var needleCanvas = document.createElement('canvas');
    var needleContext, haystackContext;
    
    var haystackImg = new Image();
    var needleImg = new Image();
    var needlePixel, haystackPixel;
    var breakloop = false;
    
    needleImg.onload = function () {
        needleCanvas.width = needleImg.width;
        needleCanvas.height = needleImg.height;
        needleContext = needleCanvas.getContext('2d');

        haystackImg.onload = function () {
            haystackCanvas.width = haystackImg.width;
            haystackCanvas.height = haystackImg.height;
            haystackContext = haystackCanvas.getContext('2d');

            haystackContext.drawImage(haystackImg, 0, 0, haystackCanvas.width, haystackCanvas.height);
            needleContext.drawImage(needleImg, 0, 0, needleCanvas.width, needleCanvas.height);
    
            needlePixels = needleContext.getImageData(0, 0, needleCanvas.width, needleCanvas.height).data;
            haystackPixels = haystackContext.getImageData(0, 0, haystackCanvas.width, haystackCanvas.height).data;

            for (var y=0; y<haystackCanvas.height-needleCanvas.height; y++) {
                for (var x=0; x<haystackCanvas.width-needleCanvas.width; x++) {
                    haystackPixel = [haystackPixels[4*((haystackCanvas.width*y)+x)],haystackPixels[4*((haystackCanvas.width*y)+x)+1],haystackPixels[4*((haystackCanvas.width*y)+x)+2],haystackPixels[4*((haystackCanvas.width*y)+x)+3]];
                    
                    breakloop = false;
                    for (var ny=0; ny<needleCanvas.height; ny++) {
                        for (var nx=0; nx<needleCanvas.width; nx++) {
                            needlePixel = [needlePixels[4*((needleCanvas.width*ny)+nx)],needlePixels[4*((needleCanvas.width*ny)+nx)+1],needlePixels[4*((needleCanvas.width*ny)+nx)+2],needlePixels[4*((needleCanvas.width*ny)+nx)+3]];
                            haystackPixel = [haystackPixels[4*((haystackCanvas.width*(ny+y))+(nx+x))],haystackPixels[4*((haystackCanvas.width*(ny+y))+(nx+x))+1],haystackPixels[4*((haystackCanvas.width*(ny+y))+(nx+x))+2],haystackPixels[4*((haystackCanvas.width*(ny+y))+(nx+x))+3]];
                            if (!pixelMatch(needlePixel, haystackPixel, color_variance)) {
                                breakloop = true;
                            }
                            if (breakloop) break;
                        }
                        if (breakloop) break;
                    }
                    if (!breakloop) {
                        var scalingFactor = window.devicePixelRatio;

                        simulation_variables['_FINDIMAGE_X'] = parseInt((x + parseInt(needleCanvas.width/2))/scalingFactor);
                        simulation_variables['_FINDIMAGE_Y'] = parseInt((y + parseInt(needleCanvas.height/2))/scalingFactor);
                        simulation_variables['_FINDIMAGE_X1'] = parseInt(x/scalingFactor);
                        simulation_variables['_FINDIMAGE_X2'] = parseInt((x + needleCanvas.width)/scalingFactor);
                        simulation_variables['_FINDIMAGE_Y1'] = parseInt(y/scalingFactor);
                        simulation_variables['_FINDIMAGE_Y2'] = parseInt((y + needleCanvas.height)/scalingFactor);

                        resolve({
                            error: false,
                            results: ["Found image at (" + simulation_variables['_FINDIMAGE_X'] + "," + simulation_variables['_FINDIMAGE_Y'] + ")"],
                            id: node.id,
                            time: Date.now()
                        });
                        return;
                    }
                }
            }
            
            resolve({
                error: true,
                results: ["Could not find a matching image"],
                id: node.id,
                time: Date.now()
            });
        };
        haystackImg.crossOrigin = "Anonymous";
        haystackImg.src = haystackSrc;
    };
    needleImg.crossOrigin = "Anonymous";
    needleImg.src = needleSrc;
}

/* Start Tesseract */
window.Tesseract = Tesseract.create({
    workerPath: chrome.extension.getURL('tesseract/worker.js'),
    langPath: chrome.extension.getURL('tesseract/'),
    corePath: chrome.extension.getURL('tesseract/index.js'),
});
