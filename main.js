chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        chrome.storage.local.get('recording', function (isRecording) {
            if (isRecording.recording) {
                if (changeInfo.status == 'complete') {
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
);
