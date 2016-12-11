var recording = false;
var bgSettings;

function updateBgSettings() {
	chrome.storage.local.get('settings', function (settings) {
		bgSettings = settings.settings;
	});
}
updateBgSettings();

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
            chrome.browserAction.setIcon({
                path: 'icon-recording-128.png'
            });
            recording = true;
        } else if (!isRecording.recording && recording) {
            chrome.browserAction.setIcon({
                path: 'icon-128.png'
            });
            recording = false;
        }
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    updateExtIcon();
	updateBgSettings();
});

updateExtIcon();

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