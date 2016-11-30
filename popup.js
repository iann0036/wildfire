/**
 * Created by ian on 24/04/2016.
 */

var recording = false;

function toggleRecording() {
    chrome.storage.local.set({workflow: null});
    if (recording) {
        chrome.storage.local.set({recording: false});
        chrome.storage.local.get('events', function (result) {
            var events = result.events;
            events.push({
                evt: 'end_recording',
                time: Date.now(),
                evt_data: {}
            });
            chrome.storage.local.set({events: events}, function() {
                chrome.windows.create({
                    url: "eventlog.html",
                    type: "popup",
                    width: 1280,
                    height: 800,
                    left: screen.width/2-640,
                    top: screen.height/2-400
                });
                window.close();
            });
        });
    } else {
        chrome.storage.local.set({recording: true},function(){
            chrome.storage.local.set({inloop: false},function(){
                var events = [];
                events.push({
                    evt: 'begin_recording',
                    time: Date.now(),
                    evt_data: {}
                });
                chrome.storage.local.set({events: events});
                window.close();
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('recordButton').addEventListener('click', toggleRecording);
    updatePopupUI();
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        updateButton(); // changes could be used to improve performance
    });
});

function updatePopupUI() {
    chrome.storage.local.get('recording', function (result) {
        recording = result.recording;

        if (recording) {
            document.getElementById('recordButton').innerHTML = "Stop Recording";
            document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-danger btn-block');
        } else {
            document.getElementById('recordButton').innerHTML = "Start Recording";
            document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-success btn-block');
        }
    });
};

var triggerLoopClicked = false;
var windowWidth = 1280;
var windowHeight = 800;

window.onload = function() {
    document.getElementById('dashLink').onclick = function () {
        chrome.windows.create({
            url: "dashboard.html",
            type: "popup",
            width: windowWidth,
            height: windowHeight,
            left: screen.width/2-(windowWidth/2),
            top: screen.height/2-(windowHeight/2)
        });
        window.close();
    };
}