/**
 * Created by ian on 24/04/2016.
 */

var events = [];
var recording_start_time = 0;
var recording_end_time = 0;

document.addEventListener('visibilitychange', function(){
    if (!document.hidden) {
        populateEvents();
    }
});

function populateEvents() {
    chrome.runtime.sendMessage({evt: "query_events",time: Date.now(),evt_data: {}}, function(response) {
        events = response.events;
        document.getElementById('events').innerHTML = "";

        recording_start_time = events[0].time;
        for (var i=0; i<events.length; i++) {
            /* Event Time */
            var event_time = ((events[i].time-recording_start_time)/1000).toFixed(1) + "s";

            /* Event Type */
            var event_type = "";
            switch (events[i].evt) {
                case 'begin_recording':
                    event_type = "Begun Recording";
                    event_time = "-";
                    break;
                case 'end_recording':
                    event_type = "Ended Recording";
                    break;
                case 'mousedown':
                    event_type = "Mouse Down";
                    break;
                case 'mouseup':
                    event_type = "Mouse Up";
                    break;
                case 'click':
                    event_type = "Mouse Clicked";
                    break;
                case 'keydown':
                    event_type = "Key Down";
                    break;
                case 'keyup':
                    event_type = "Key Up";
                    break;
                case 'keypress':
                    event_type = "Key Pressed";
                    break;
                case 'tabchange':
                    event_type = "Changed Tabs";
                    if (events[i].evt_data.url=="chrome://newtab/")
                        event_type = "Opened New Tab";
                    break;
                default:
                    event_type = events[i].evt;
            }

            /* Event URL */
            var event_url = "&nbsp;";
            if (events[i].evt_data.url) {
                event_url = events[i].evt_data.url;
                if (event_url.length>57)
                    event_url = event_url.substr(0, 57) + "...";
            }

            /* Event Details */
            var event_data = "";
            if (events[i].evt=="keydown") {
                event_data = "Pressed down on the '" + String.fromCharCode(events[i].evt_data.keyCode).toLowerCase() + "' key";
            } else if (events[i].evt=="keyup") {
                event_data = "Released the '" + String.fromCharCode(events[i].evt_data.keyCode).toLowerCase() + "' key";
            } else if (events[i].evt=="keypress") {
                event_data = "Pressed the '" + String.fromCharCode(events[i].evt_data.keyCode).toLowerCase() + "' key";
            } else if (events[i].evt=="mousedown") {
                event_data = "Began clicking at coordinates (" + events[i].evt_data.clientX + "," + events[i].evt_data.clientY + ")";
            } else if (events[i].evt=="mouseup") {
                event_data = "Finished clicking at coordinates (" + events[i].evt_data.clientX + "," + events[i].evt_data.clientY + ")";
            } else if (events[i].evt=="click") {
                event_data = "Clicked at coordinates (" + events[i].evt_data.clientX + "," + events[i].evt_data.clientY + ")";
            }

            var innerHTML = "<td class=\"fs15 fw600\">" + event_time + "</td>" +
                "<td class=\"hidden-xs\">" + event_type + "</td>" +
                "<td class=\"hidden-xs\">" + event_url + "</td>" +
                "<td class=\"hidden-xs\">" + event_data + "</td>" +
                "<td class=\"text-right\">" +
                "<button type=\"button\" class=\"btn btn-xs btn-danger\"><i class=\"fa fa-times\"></i></button>" +
                "</td>";

            var eventNode = document.createElement("tr");
            eventNode.innerHTML = innerHTML;
            document.getElementById('events').appendChild(eventNode);
        }
    });
}

window.onload = populateEvents();
