/**
 * Created by ian on 24/04/2016.
 */

var recording = false;
var simulating = false;

function toggleRecording() {
    chrome.storage.local.set({workflow: null},function(){
        if (simulating) {
            var message_port = chrome.runtime.connect({name: "sim"});
            message_port.postMessage({action: "stop_sim"});
            window.close();
        } else if (recording) {
            chrome.storage.local.set({recording: false});
            chrome.storage.local.get('events', function (result) {
                var events = result.events;
                events.push({
                    evt: 'end_recording',
                    time: Date.now(),
                    evt_data: {}
                });
                chrome.storage.local.set({events: events}, function() {
                    if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                        chrome.tabs.query({
                            windowType: "popup"
                        },function(tabs){
                            /* Guide */
                            chrome.tabs.query({
                                active: true,
                                currentWindow: true
                            }, function(tabs) {
                                if (tabs[0].url.startsWith("https://wildfire.ai/tour1_1")) {
                                    chrome.tabs.executeScript(tabs[0].id,{
                                        code: "var s = document.createElement('script');s.textContent = 'stoppedRecording();';document.head.appendChild(s);"
                                    },function(){
                                        chrome.windows.create({
                                            url: chrome.extension.getURL("workfloweditor.html#tour1_1"),
                                            type: "popup",
                                            width: windowWidth,
                                            height: windowHeight,
                                            left: Math.round(screen.width/2-(windowWidth/2)),
                                            top: Math.round(screen.height/2-(windowHeight/2))
                                        });
                                        window.close();
                                    });
                                } else {
                                    chrome.windows.create({
                                        url: chrome.extension.getURL("workfloweditor.html"),
                                        type: "popup",
                                        width: windowWidth,
                                        height: windowHeight,
                                        left: Math.round(screen.width/2-(windowWidth/2)),
                                        top: Math.round(screen.height/2-(windowHeight/2))
                                    });
                                    window.close();
                                }
                            });
                        });
                    } else {
                        chrome.windows.create({
                            url: chrome.extension.getURL("workfloweditor.html"),
                            width: windowWidth,
                            height: windowHeight,
                            left: Math.round(screen.width/2-(windowWidth/2)),
                            top: Math.round(screen.height/2-(windowHeight/2))
                        });
                        window.close();
                    }
                });
            });
        } else {
            chrome.storage.local.set({recording: true},function(){
                var events = [];
                events.push({
                    evt: 'begin_recording',
                    time: Date.now(),
                    evt_data: {}
                });
                chrome.storage.local.set({events: events},function(){
                    /* Guide */
                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function(tabs) {
                        if (tabs[0].url.startsWith("https://wildfire.ai/tour1_1")) {
                            chrome.tabs.executeScript(tabs[0].id,{
                                code: "var s = document.createElement('script');s.textContent = 'startedRecording();';document.head.appendChild(s);"
                            },function(){
                                window.close();
                            });
                        } else
                            window.close();
                    });
                });
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('recordButton').addEventListener('click', toggleRecording);

    updatePopupUI();
});

function updatePopupUI() {
    chrome.storage.local.get('simulating', function (simulating_result) {
        chrome.storage.local.get('recording', function (result) {
            recording = result.recording;
            simulating = simulating_result.simulating;

            if (simulating) {
                document.getElementById('recordButton').innerHTML = "Stop Simulating";
                document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-danger btn-block');
            } else if (recording) {
                document.getElementById('recordButton').innerHTML = "Stop Recording";
                document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-danger btn-block');
            } else {
                document.getElementById('recordButton').innerHTML = "Start Recording";
                document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-success btn-block');
            }
        });
    });
};

var triggerLoopClicked = false;
var windowWidth = 1280;
var windowHeight = 800;
if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) { // Opera
    windowWidth*=window.devicePixelRatio;
    windowHeight*=window.devicePixelRatio;
}

window.onload = function() {
    document.getElementById('dashLink').onclick = function () {
        if (typeof InstallTrigger === 'undefined') { // NOT Firefox
            chrome.tabs.query({
                windowType: "popup"
            },function(tabs){
                chrome.windows.create({
                    url: chrome.extension.getURL("dashboard.html"),
                    type: "popup",
                    width: windowWidth,
                    height: windowHeight,
                    left: Math.round(screen.width/2-(windowWidth/2)),
                    top: Math.round(screen.height/2-(windowHeight/2))
                });
                window.close();
            });
        } else {
            chrome.windows.create({
                url: chrome.extension.getURL("dashboard.html"),
                width: windowWidth,
                height: windowHeight,
                left: Math.round(screen.width/2-(windowWidth/2)),
                top: Math.round(screen.height/2-(windowHeight/2))
            });
            
            window.close();
        }
    };
}
