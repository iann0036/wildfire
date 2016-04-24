/**
 * Created by ian on 24/04/2016.
 */

var isRecording = false;

function toggleRecording() {
    if (isRecording) {
        chrome.runtime.sendMessage({
            evt: 'end_recording',
            time: Date.now(),
            evt_data: {}
        });
        chrome.tabs.query({
            url: "chrome-extension://" + chrome.runtime.id + "/app.html"
        }, function(tabs) {
            if (tabs.length < 1)
                chrome.tabs.create({ url: "app.html" });
            else
                chrome.tabs.update(tabs[0].id, {active: true});
        });
    } else {
        chrome.runtime.sendMessage({
            evt: 'begin_recording',
            time: Date.now(),
            evt_data: {}
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({evt: "query_recording_status",time: Date.now(),evt_data: {}}, function(response) {
        isRecording = response.recording;
        if (response.recording) {
            document.getElementById('recordButton').innerHTML = "Stop Recording";
            document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-danger btn-block');
        } else {
            document.getElementById('recordButton').innerHTML = "Start Recording";
            document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-info btn-block');
        }
    });
    document.getElementById('recordButton').addEventListener('click', toggleRecording);
});