/**
 * Created by ian.mckay on 24/04/2016.
 */

var events = [];
var recording_start_time = 0;
var recording_end_time = 0;
var all_settings;
var timeoutObject;
var stepIterator = 0;
var event_execution_timeout = 10000;
var eventExecutionTimeoutCounter;
var simulation_log = [];
var node_details = [];

chrome.storage.local.get('settings', function (settings) {
    all_settings = {
        "account": "",
        "cloudapikey": "",
        "emulatehover": false,
        "leavesimulationopen": false,
        "clearbrowsingdata": false,
        "recordmousedown": false,
        "recordmouseup": false,
        "recordmouseover": false,
        "recordmouseout": false,
        "recordselect": true,
        "recordfocusin": false,
        "recordfocusout": false,
        "recordclick": true,
        "recordkeydown": false,
        "recordkeypress": true,
        "recordkeyup": false,
        "recordinput": true,
        "recordchange": true,
        "recordscroll": true,
        "simulatemousedown": false,
        "simulatemouseup": false,
        "simulatemouseover": false,
        "simulatemouseout": false,
        "simulateselect": true,
        "simulatefocusin": true,
        "simulatefocusout": true,
        "simulateclick": true,
        "simulatekeydown": true,
        "simulatekeypress": true,
        "simulatekeyup": true,
        "simulateinput": true,
        "simulatechange": true,
        "simulatescroll": true,
        "customsubmit": true,
        "runminimized": false,
        "incognito": false,
        "rightclick": true,
        "suppressalerts": false,
        "directinputdefault": false,
        "recordnative": true
    };
    if (settings.settings != null)
        all_settings = $.extend(all_settings,settings.settings);
    chrome.storage.local.set({settings: all_settings});
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    updateEvents();
});

function updateEvents() {
    chrome.storage.local.get('events', function (result) {
        events = result.events;
    });
}

updateEvents();

function downloadEventLog() {
    var text = encrypt(JSON.stringify(events));
    swal({
        title: "Export Event Log",
        text: "Enter your filename:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputValue: "WildfireExport_" + Math.floor(Date.now() / 1000) + ".wfire"
    }, function (filename) {
        if (filename === false) return false;
        if (filename === "") {
            swal("Error", "You need to specify a filename.", "error");
            return false;
        }
        if (!filename.endsWith(".wfire") && !filename.endsWith(".WFIRE")) {
            swal("Error", "The extension must be .wfire", "error");
            return false;
        }

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
        return true;
    });
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

if (document.getElementById('downloadEventLogButton2')) {
    document.getElementById('downloadEventLogButton2').addEventListener('click', function() {
        downloadEventLog();
    });
}
if (document.getElementById('importEventLogButton')) {
    document.getElementById('importEventLogButton').addEventListener('click', function() {
        $('#eventfileContainer').click();
    });
}
if (document.getElementById('eventfileContainer')) {
    document.getElementById('eventfileContainer').addEventListener('change', function() {
        var reader = new FileReader();

        reader.onload = function(e) {
            var new_events = JSON.parse(decrypt(e.target.result));
            chrome.storage.local.set({events: new_events},function(){
                chrome.storage.local.set({recording: false});
                chrome.notifications.create("event_log_imported",{
                    type: "basic",
                    title: "Wildfire",
                    message: "Event Log Imported",
                    iconUrl: "icon-128.png"
                });
                chrome.storage.local.remove('workflow',function(){
                    if (window.location.href.includes("eventlog.html")) {
                        setTimeout(function(){
                            location.reload();
                        },1);
                    }
                    if (window.location.href.includes("workfloweditor.html")) {
                        setTimeout(function(){
                            $(window).unbind('beforeunload');
                            $(window).unbind('unload');
                            location.reload();
                        },1);
                    }
                });
            });

        }

        var file = document.getElementById('eventfileContainer').files[0];
        reader.readAsText(file);
    });
}
