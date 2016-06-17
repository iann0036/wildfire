var recording = false;

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
                                    active: tab.active
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
});

updateExtIcon();
