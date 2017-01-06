var recording = false;
var bgSettings;
var proxyAuthEnable = false;
var proxyUsername;
var proxyPassword;
var windowWidth = 1280;
var windowHeight = 800;

function updateBgSettings() {
	chrome.storage.local.get('settings', function (settings) {
		bgSettings = settings.settings;
	});
}

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
		if (tab.url.substring(0,51) != "chrome-extension://" + chrome.runtime.id) {
			chrome.storage.local.get('recording', function (isRecording) {
				if (isRecording.recording) {
					if (changeInfo.status == 'loading') {
						chrome.storage.local.get('events', function (result) {
							var events = result.events;
							if (!Array.isArray(events)) {
								events = [];
							}
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
						});
					}
				}
			});
		}
	}
);

chrome.tabs.onReplaced.addListener( // Pre-rendered
    function (addedTabId, removedTabId) {
		chrome.tabs.get(addedTabId, function (tab) {
			if (tab.url.substring(0,51) != "chrome-extension://" + chrome.runtime.id) {
				chrome.storage.local.get('recording', function (isRecording) {
					if (isRecording.recording) {
						chrome.storage.local.get('events', function (result) {
							var events = result.events;
							if (!Array.isArray(events)) {
								events = [];
							}
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
						});
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

function updateProxy() {
    chrome.storage.local.get('proxy', function (proxy) {
		if (proxy && proxy.proxy) {
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

chrome.webRequest.onAuthRequired.addListener(
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
});

updateExtIcon();
updateBgSettings();
updateProxy();

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
			url: "dashboard.html",
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

chrome.runtime.onInstalled.addListener(function(details){
    if (details.reason == "install") {
        chrome.windows.create({
			url: "docs/getting_started.html",
			type: "popup",
			width: windowWidth,
			height: windowHeight,
			left: screen.width/2-(windowWidth/2),
			top: screen.height/2-(windowHeight/2)
		});
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
		console.log(bgSettings.rightclick);
		chrome.contextMenus.removeAll(function(){
			if (bgSettings.rightclick) {
				chrome.contextMenus.create({
					"title": "Run the current workflow",
					"contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"],
					"documentUrlPatterns": ["http://*/*","https://*/*"],
					"onclick": function(){
						chrome.windows.create({
							url: "/workfloweditor.html#launch",
							type: "popup",
							width: windowWidth,
							height: windowHeight,
							left: screen.width/2-(windowWidth/2),
							top: screen.height/2-(windowHeight/2)
						});
					}
				});
				for (var i=0; i<favorites.length; i++) {
					if (favorites[i].rightclick)
						chrome.contextMenus.create({
							"title": "Run '" + favorites[i].name + "'",
							"contexts": ["page", "frame", "selection", "link", "editable", "image", "video", "audio"], // ignore chrome-extension://
							"documentUrlPatterns": ["http://*/*","https://*/*"],
							"onclick": function(info, tab){
								;
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
						chrome.windows.create({
							url: "/settings.html#favorites",
							type: "popup",
							width: windowWidth,
							height: windowHeight,
							left: screen.width/2-(windowWidth/2),
							top: screen.height/2-(windowHeight/2)
						});
					}
				});
			}
		});
	});
}

setContextMenus();
