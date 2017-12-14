// 86929E

var mappingData = {
    begin_recording: {
        bgColor: '#56B558',
        event_type: 'Begin Recording',
        icon: 'runner.png'
    },
    end_recording: {
        bgColor: '#FF6B6B',
        event_type: 'End Recording',
        icon: 'winner-runner-arriving-to-end-line.png',
        optlabel: 'Workflow'
    },
    setvar: {
        bgColor: '#3FB8AF',
        event_type: 'Set Variable',
        icon: 'equality-sign.png'
    },
    csvimport: {
        bgColor: '#F7734F',
        event_type: 'CSV Import',
        icon: 'csv-file-format-extension.png',
        endoptlabel: true
    },
    tabchange: {
        bgColor: '#9265C6',
        event_type: 'New/Change Tab',
        icon: 'web-tabs.png',
        optlabel: 'Tabs'
    },
    tabremove: {
        bgColor: '#8937B2',
        event_type: 'Remove Tab',
        icon: 'web-tabs.png'
    },
    tabswitch: {
        bgColor: '#924FAD',
        event_type: 'Switch Tabs',
        icon: 'web-tabs.png',
        endoptlabel: true
    },
    click: {
        bgColor: '#556270',
        event_type: 'Mouse Click',
        icon: 'cursor-1.png',
        optlabel: 'Mouse'
    },
    mousedown: {
        bgColor: '#F9E666',
        event_type: 'Mouse Down',
        icon: 'mouse-pointer.png'
    },
    mouseup: {
        bgColor: '#76B8C9',
        event_type: 'Mouse Up',
        icon: 'mouse-pointer.png'
    },
    mouseover: {
        bgColor: '#E0DFB1',
        event_type: 'Mouse Over',
        icon: 'mouse-pointer.png'
    },
    mouseout: {
        bgColor: '#A5A36C',
        event_type: 'Mouse Out',
        icon: 'mouse-pointer.png',
        endoptlabel: true
    },
    keypress: {
        bgColor: '#C5E0DC',
        event_type: 'Key Press',
        icon: 'keyboard-key-a.png',
        optlabel: 'Keyboard'
    },
    keydown: {
        bgColor: '#5D97AF',
        event_type: 'Key Down',
        icon: 'key-arrow-down.png'
    },
    keyup: {
        bgColor: '#FC9D9A',
        event_type: 'Key Up',
        icon: 'square-arrow-up.png',
        endoptlabel: true
    },
    input: {
        bgColor: '#CBE86B',
        event_type: 'Data Input',
        icon: 'text-entry-box.png',
        optlabel: 'Input'
    },
    change: {
        bgColor: '#98462A',
        event_type: 'Change',
        icon: 'change.png'
    },
    submit: {
        bgColor: '#A46583',
        event_type: 'Form Submit',
        icon: 'clicking-cursor.png',
        endoptlabel: true
    },
    clipboard_copy: {
        bgColor: '#005F6B',
        event_type: 'Clipboard Copy',
        icon: 'copy-document.png',
        optlabel: 'Clipboard'
    },
    clipboard_cut: {
        bgColor: '#008C9E',
        event_type: 'Clipboard Cut',
        icon: 'cut.png'
    },
    clipboard_paste: {
        bgColor: '#00B4CC',
        event_type: 'Clipboard Paste',
        icon: 'paste-from-clipboard.png',
        endoptlabel: true
    },
    ocr: {
        bgColor: '#99D8AB',
        event_type: 'Find Text',
        icon: 'search-circular-symbol-with-letters.png',
        optlabel: 'Visual'
    },
    subimage: {
        bgColor: '#C47280',
        event_type: 'Find Image',
        icon: 'search-image.png'
    },
    screenshot: {
        bgColor: '#7D7D7D',
        event_type: 'Take Screenshot',
        icon: 'photo-camera.png',
        endoptlabel: true
    },
    scroll: {
        bgColor: '#D9CEB2',
        event_type: 'Page Scroll',
        icon: 'scroll-bar.png',
        optlabel: 'Other'
    },
    focusin: {
        bgColor: '#4ECDC4',
        event_type: 'Element Focus',
        icon: 'focus.png'
    },
    focusout: {
        bgColor: '#F0A900',
        event_type: 'Element Unfocus',
        icon: 'unfocus-wfcustom.png'
    },
    customjs: {
        bgColor: '#D4B0D6',
        event_type: 'Custom Function',
        icon: 'js-document.png'
    },
    purgecookies: {
        bgColor: '#7D3F32',
        event_type: 'Purge Cookies',
        icon: 'christmas-cookies.png'
    },
    setproxy: {
        bgColor: '#EFA821',
        event_type: 'Set Proxy Settings',
        icon: 'cloud-computing.png'
    },
    select: {
        bgColor: '#D95B43',
        event_type: 'Text Select',
        icon: 'edit-line.png',
        endoptlabel: true
    },
    closewindow: {
        bgColor: '#688C40',
        event_type: 'Close Window',
        icon: 'window-close.png',
        optlabel: 'Desktop Automation',
        endoptlabel: true
    },
    recaptcha: {
        bgColor: '#CBD8DE',
        event_type: 'Solve reCAPTCHA',
        icon: 'tiles-view.png',
        optlabel: 'Cloud Account Required',
        endoptlabel: true
    }
};

function formatDateLong(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ', ' + year;
}

function formatDate(date) {
	var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return formatDateLong(date);
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 2) {
        return interval + " minutes ago";
    }
	if (interval > 0.85) {
		return "a minute ago";
	}
    return "just now";
}

function formatDiffDate(starttime,endtime) {
    var seconds = Math.ceil((endtime-starttime)/1000);

    if (seconds > 3600)
        return Math.floor(seconds/3600) + "h " + Math.floor(seconds%3600/60) + "m " + seconds%60 + "s";
    else if (seconds > 60)
        return Math.floor(seconds/60) + "m " + seconds%60 + "s";
    
    return seconds + "s";
}

function readableEventDetail(event, simulation_log_results) {
    /* Event Time */
    var event_time = ((event.time-recording_start_time)/1000).toFixed(2) + "s";

    /* Event Type and Details */
    var event_type = "";
    var event_data = "";
    var minorEvent = true;

    if (event.evt == "keydown" || event.evt == "keyup") {
        var event_data_prefix;
        if (event.evt == "keydown")
            event_data_prefix = "Pressed down on ";
        else if (event.evt == "keyup")
            event_data_prefix = "Released ";

        if (event.evt_data.keyCode==8)
            event_data = event_data_prefix + "the Backspace key";
        else if (event.evt_data.keyCode==9)
            event_data = event_data_prefix + "the Tab key";
        else if (event.evt_data.keyCode==13)
            event_data = event_data_prefix + "the Enter key";
        else if (event.evt_data.keyCode==16)
            event_data = event_data_prefix + "the Shift key";
        else if (event.evt_data.keyCode==17)
            event_data = event_data_prefix + "the Control key";
        else if (event.evt_data.keyCode==18)
            event_data = event_data_prefix + "the Alt key";
        else if (event.evt_data.keyCode==20)
            event_data = event_data_prefix + "the Caps Lock key";
        else if (event.evt_data.keyCode==27)
            event_data = event_data_prefix + "the Escape key";
        else if (event.evt_data.keyCode==32)
            event_data = event_data_prefix + "the Space key";
        else if (event.evt_data.keyCode==33)
            event_data = event_data_prefix + "the Page Up key";
        else if (event.evt_data.keyCode==34)
            event_data = event_data_prefix + "the Page Down key";
        else if (event.evt_data.keyCode==35)
            event_data = event_data_prefix + "the End key";
        else if (event.evt_data.keyCode==36)
            event_data = event_data_prefix + "the Home key";
        else if (event.evt_data.keyCode==37)
            event_data = event_data_prefix + "the Left Arrow key";
        else if (event.evt_data.keyCode==38)
            event_data = event_data_prefix + "the Up Arrow key";
        else if (event.evt_data.keyCode==39)
            event_data = event_data_prefix + "the Right Arrow key";
        else if (event.evt_data.keyCode==40)
            event_data = event_data_prefix + "the Down Arrow key";
        else if (event.evt_data.keyCode==45)
            event_data = event_data_prefix + "the Insert key";
        else if (event.evt_data.keyCode==46)
            event_data = event_data_prefix + "the Delete key";
        else if (event.evt_data.keyCode > 47 && event.evt_data.keyCode < 91)
            event_data = event_data_prefix + "the '" + String.fromCharCode(event.evt_data.keyCode).toLowerCase() + "' key";
        else if (event.evt_data.keyCode==106)
            event_data = event_data_prefix + "the '*' key";
        else if (event.evt_data.keyCode==107)
            event_data = event_data_prefix + "the '+' key";
        else if (event.evt_data.keyCode==109)
            event_data = event_data_prefix + "the '-' key";
        else if (event.evt_data.keyCode==110)
            event_data = event_data_prefix + "the '.' key";
        else if (event.evt_data.keyCode==111)
            event_data = event_data_prefix + "the '/' key";
        else if (event.evt_data.keyCode==186)
            event_data = event_data_prefix + "the ';' key";
        else if (event.evt_data.keyCode==187)
            event_data = event_data_prefix + "the '=' key";
        else if (event.evt_data.keyCode==188)
            event_data = event_data_prefix + "the ',' key";
        else if (event.evt_data.keyCode==189)
            event_data = event_data_prefix + "the '-' key";
        else if (event.evt_data.keyCode==190)
            event_data = event_data_prefix + "the '.' key";
        else if (event.evt_data.keyCode==191)
            event_data = event_data_prefix + "the '/' key";
        else if (event.evt_data.keyCode==192)
            event_data = event_data_prefix + "the '`' key";
        else if (event.evt_data.keyCode==219)
            event_data = event_data_prefix + "the '[' key";
        else if (event.evt_data.keyCode==220)
            event_data = event_data_prefix + "the '\\' key";
        else if (event.evt_data.keyCode==221)
            event_data = event_data_prefix + "the ']' key";
        else if (event.evt_data.keyCode==222)
            event_data = event_data_prefix + "the '\'' key";
        else
            event_data = event_data_prefix + "an unknown key";
    } else if (event.evt == "keypress") {
        var event_data_prefix = "Pressed ";
        if (event.evt_data.keyCode==8)
            event_data = event_data_prefix + "the Backspace key";
        else if (event.evt_data.keyCode==9)
            event_data = event_data_prefix + "the Tab key";
        else if (event.evt_data.keyCode==13)
            event_data = event_data_prefix + "the Enter key";
        else if (event.evt_data.keyCode==16)
            event_data = event_data_prefix + "the Shift key";
        else if (event.evt_data.keyCode==17)
            event_data = event_data_prefix + "the Control key";
        else if (event.evt_data.keyCode==18)
            event_data = event_data_prefix + "the Alt key";
        else if (event.evt_data.keyCode==20)
            event_data = event_data_prefix + "the Caps Lock key";
        else if (event.evt_data.keyCode==27)
            event_data = event_data_prefix + "the Escape key";
        else if (event.evt_data.keyCode==32)
            event_data = event_data_prefix + "the Space key";
        else if (event.evt_data.keyCode > 32 && event.evt_data.keyCode < 127)
            event_data = event_data_prefix + "the '" + String.fromCharCode(event.evt_data.keyCode).toLowerCase() + "' key";
        else
            event_data = event_data_prefix + "an unknown key";
    }

    switch (event.evt) {
        case 'begin_recording':
            if (simulation_log)
                event_type = "Begun Simulating";
            else
                event_type = "Begun Recording";
            event_time = "-";
            minorEvent = false;
            break;
        case 'end_recording':
            if (simulation_log)
                event_type = "Ended Simulating";
            else
                event_type = "Ended Recording";
            minorEvent = false;
            break;
        case 'mousedown':
            event_type = "Mouse Down";
            event_data = "Began clicking at coordinates (" + (event.evt_data.clientX || "0") + "," + (event.evt_data.clientY || "0")+ ")";
            minorEvent = false;
            break;
        case 'mouseup':
            event_type = "Mouse Up";
            event_data = "Finished clicking at coordinates (" + (event.evt_data.clientX || "0") + "," + (event.evt_data.clientY || "0") + ")";
            minorEvent = false;
            break;
        case 'mouseover':
            event_type = "Mouse Over";
            event_data = "Moused over an element at coordinates (" + (event.evt_data.clientX || "0") + "," + (event.evt_data.clientY || "0") + ")";
            minorEvent = false;
            break;
        case 'mouseout':
            event_type = "Mouse Out";
            event_data = "Moved mouse out of element at coordinates (" + (event.evt_data.clientX || "0") + "," + (event.evt_data.clientY || "0") + ")";
            minorEvent = false;
            break;
        case 'click':
            event_type = "Mouse Clicked";
            event_data = "Clicked at coordinates (" + (event.evt_data.clientX || "0") + "," + (event.evt_data.clientY || "0") + ")";
            minorEvent = false;
            break;
        case 'select':
            event_type = "Text Selected";
            break;
        case 'focusin':
            event_type = "Element Focus";
            minorEvent = false;
            break;
        case 'focusout':
            event_type = "Element Unfocus";
            minorEvent = false;
            break;
        case 'keydown':
            event_type = "Key Down";
            minorEvent = false;
            break;
        case 'keyup':
            event_type = "Key Up";
            minorEvent = false;
            break;
        case 'keypress':
            event_type = "Key Pressed";
            minorEvent = false;
            break;
        case 'purgecookies':
            event_type = "Purge Cookies";
            minorEvent = false;
            break;
        case 'input':
            if (event.evt_data.value)
                var escaped_value = event.evt_data.value.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            else
                var escaped_value = "<i>Unknown</i>";
            event_type = "Data Input";
            event_data = "Changed a";
            if (event.evt_data.type == "input")
                event_data += "n";
            event_data += " <code>&lt;" + event.evt_data.type + "&gt;</code> element to the value \"" + escaped_value + "\"";
            minorEvent = false;
            break;
        case 'change':
            if (event.evt_data.value)
                var escaped_value = event.evt_data.value.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            else
                var escaped_value = "<i>Unknown</i>";
            event_type = "Change";
            event_data = "Changed a";
            if (event.evt_data.type == "input")
                event_data += "n";
            event_data += " <code>&lt;" + event.evt_data.type + "&gt;</code> element to the value \"" + escaped_value + "\"";
            minorEvent = false;
            break;
        case 'clipboard_copy':
            event_type = "Clipboard Copy";
            event_data = "&nbsp;";
            break;
        case 'clipboard_cut':
            event_type = "Clipboard Cut";
            event_data = "&nbsp;";
            break;
        case 'clipboard_paste':
            event_type = "Clipboard Paste";
            event_data = "&nbsp;";
            break;
        case 'submit':
            event_type = "Form Submit";
            minorEvent = false;
            break;
        case 'scroll':
            event_type = "Page Scroll";
            event_data = "Scrolled for " + (event.evt_data.endtime-event.time) + " ms";
            minorEvent = false;
            break;
        case 'recaptcha':
            event_type = "reCAPTCHA Solve";
            event_data = "&nbsp;";
            minorEvent = false;
            break;
        case 'setproxy':
            event_type = "Set Proxy Settings";
            event_data = "&nbsp;";
            minorEvent = false;
            event.evt_data.url = "";
            break;
        case 'setvar':
            event_type = "Set Variable";
            event_data = "The variable <code>" + event.evt_data.var + "</code> was set";
            minorEvent = false;
            event.evt_data.url = "";
            break;
        case 'tabchange':
            event_type = "Changed Tab";
            if (event.evt_data.url=="chrome://newtab/" || event.evt_data.url=="about:newtab")
                event_type = "Opened New Tab";
            minorEvent = false;
            break;
        case 'tabremove':
            event_type = "Removed Tab";
            minorEvent = false;
            break;
        case 'tabswitch':
            event_type = "Switched Tabs";
            minorEvent = false;
            break;
        case 'customjs':
            event_type = "Ran Custom Function";
            minorEvent = false;
            break;
        case 'csvimport':
            event_type = "Imported CSV";
            minorEvent = false;
            break;
        case 'closewindow':
            event_type = "Closed Window";
            minorEvent = false;
            break;
        case 'ocr':
            event_type = "Find Text";
            minorEvent = false;
            if (simulation_log_results && simulation_log_results.length == 1)
                event_data = simulation_log_results[0];
            break;
        case 'subimage':
            event_type = "Find Image";
            minorEvent = false;
            break;
        case 'screenshot':
            event_type = "Took Screenshot";
            minorEvent = false;
            if (simulation_log_results && simulation_log_results.length == 1)
                event_data = "<a class='imageDownload' data-image='" + simulation_log_results[0] + "'>Download Screenshot</a>";
            break;
        default:
            var escaped_value = event.evt.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
            event_type = "<i>" + escaped_value + "</i>";
    }

    //if (event_data.length>57)
    //    event_data = event_data.substr(0, 57) + "...";

    if (event.evt_data) {
        if (event.evt_data.inFrame) {
            event_type += " <span class='hint-circle blue' data-toggle='tooltip' data-placement='top' title='Detected this event within a frame'>?</span>";
        }

        if (event.evt_data.csspathfull) {
            if (event.evt_data.csspathfull != "html > body") {
                event_type += " <span class='hint-circle grey' data-toggle='tooltip' data-placement='top' title='" + event.evt_data.csspathfull + "'>?</span>";
            }
        }
    }

    /* Event URL */
    var event_url = false;
    if (event.evt_data && event.evt_data.url) {
        event_url = event.evt_data.url;
        if (event_url.length>57)
            event_url = event_url.substr(0, 57) + "...";
    }

    return {
        'evt': event.evt,
        'evt_data': event.evt_data,
        'id': event.id,
        'event_time': event_time,
        'event_type': event_type,
        'event_data': event_data,
        'minorEvent': minorEvent,
        'event_url': event_url
    };
}

function populateEvents(result) {
    var events = result.events;
    var simulation_log = result.log;
    var rows_height = 0;
    document.getElementById('events').innerHTML = ""; // reset table

    if (!events || events == null || events.length<1) {
        var eventNode = document.createElement("tr");
        var eventNodeTd = document.createElement("td");
        eventNodeTd.setAttribute('style','text-align: center;');
        eventNodeTd.setAttribute('colspan','8');
        eventNodeTd.innerHTML = "No events yet!";
        eventNode.appendChild(eventNodeTd);
        document.getElementById('events').appendChild(eventNode);
    } else {
        recording_start_time = events[0].time;
    }

    for (var i=0; events!=null && i<events.length; i++) {
        if (simulation_log)
            event_details = readableEventDetail(events[i], simulation_log[i].results);
        else
            event_details = readableEventDetail(events[i], null);

        var innerHTML = "<!--" + JSON.stringify(events[i]) + "-->";
        innerHTML += "<td class=\"table-check\">";
        if (events[i].evt != "begin_recording" && events[i].evt != "end_recording")
            innerHTML += "<div class=\"checkbox checkbox-only\">" +
            "<input type=\"checkbox\" id=\"event-" + i + "\" name=\"eventCheckboxes\">" +
            "<label for=\"event-" + i + "\"></label>" +
            "</div>";
        innerHTML += "</td>";
        if (simulation_log) { // Result in simulation log
            if (simulation_log.length > i) {
                if (!simulation_log[i].results || simulation_log[i].results.length==1) {
                    if (!simulation_log[i].results || !simulation_log[i].results[0].error)
                        innerHTML += "<td><span class=\"label label-success\">Success</span></td>";
                    else {
                        var eventerror = simulation_log[i].results[0].error;
                        innerHTML += "<td><span class=\"label label-danger\">Error</span> <span class=\"hint-circle red\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + eventerror +"\">?</span></td>";
                    }
                } else
                    innerHTML += "<td><span class=\"label label-danger\">Error</span> <span class=\"hint-circle red\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"The simulation action was applied to a non-single element\">?</span></td>";
            } else
                innerHTML += "<td><span class=\"label label-default\">Not Simulated</span></td>";
        }
        innerHTML += "<td>" + event_details.event_type + "</td>" +
            "<td class=\"color-blue-grey-lighter\">" + event_details.event_data + "</td>";
        /*
        innerHTML += "<td>";
        if (minorEvent)
            innerHTML += "<span class=\"label label-default\">Not Emulated</span>";
        else
            innerHTML += "<span class=\"label label-success\">Emulated</span>";
        innerHTML += "</td>";
        */
        innerHTML += "<td>" +
            "<div class=\"font-11 color-blue-grey-lighter uppercase\">Time</div> " +
            event_details.event_time +
            "</td>";
        if (event_details.event_url)
            innerHTML += "<td>" +
            "<div class=\"font-11 color-blue-grey-lighter uppercase\">URL</div>" +
            event_details.event_url +
            "</td><td></td>";
        else
            innerHTML += "<td></td><td></td>";
        if (!simulation_log) {
            innerHTML += "<td width=\"150\">";
            if (event_details.evt!="begin_recording" && event_details.evt!="end_recording")
                innerHTML += "<a href=\"#\" id=\"deleteEvent" + i + "\">Delete</a>";
            innerHTML += "</td>";
        }

        var eventNode = document.createElement("tr");
        eventNode.innerHTML = innerHTML;
        eventNode.id = "eventRow" + i;
        document.getElementById('events').appendChild(eventNode);

        if (event_details.evt!="begin_recording" && event_details.evt!="end_recording" && !simulation_log) {
            document.getElementById("deleteEvent" + i).onclick = function(e){
                deleteEvent(e.target.id.replace("deleteEvent",""));
            }
        }

        rows_height += $(eventNode).height();
    }
    // Refresh table UI
    if (events.length>0)
        $('.jspContainer').height(rows_height + 43);
}

function populateSimulationEvents(result) {
    var events = result.events;
    var simulation_log = result.log;
    var rows_height = 0;
    document.getElementById('events').innerHTML = ""; // reset table

    recording_start_time = events[0].time;

    for (var i=0; simulation_log!=null && i<simulation_log.length; i++) {
        for (var j=0; j<result.node_details.length; j++) {
            if (result.node_details[j].id == simulation_log[i].id) {
                event_details = readableEventDetail(result.node_details[j], simulation_log[i].results);
                break;
            }
        }

        var innerHTML = "<td class=\"table-check\">" +
            "<div class=\"checkbox checkbox-only\">" +
            "<input type=\"checkbox\" id=\"event-" + i + "\" name=\"eventCheckboxes\">" +
            "<label for=\"event-" + i + "\"></label>" +
            "</div>" +
            "</td>";
        if (simulation_log) { // Result in simulation log
            if (simulation_log.length > i) {
                if (!simulation_log[i].results || simulation_log[i].results.length==1) {
                    if (!simulation_log[i].results || !simulation_log[i].results[0] || !simulation_log[i].results[0].error)
                        innerHTML += "<td><span class=\"label label-success\">Success</span></td>";
                    else {
                        var eventerror = simulation_log[i].results[0].error;
                        innerHTML += "<td><span class=\"label label-danger\">Error</span> <span class=\"hint-circle red\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + eventerror +"\">?</span></td>";
                    }
                } else
                    innerHTML += "<td><span class=\"label label-danger\">Error</span> <span class=\"hint-circle red\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"The simulation action was applied to a non-single element\">?</span></td>";
            } else
                innerHTML += "<td><span class=\"label label-default\">Not Simulated</span></td>";
        }
        innerHTML += "<td>" + event_details.event_type + "</td>" +
            "<td class=\"color-blue-grey-lighter\">" + event_details.event_data + "</td>";
        /*
        innerHTML += "<td>";
        if (minorEvent)
            innerHTML += "<span class=\"label label-default\">Not Emulated</span>";
        else
            innerHTML += "<span class=\"label label-success\">Emulated</span>";
        innerHTML += "</td>";
        */
        var simtime = ((simulation_log[i].time-simulation_log[0].time)/1000).toFixed(2) + "s";
        if (i==0)
            simtime = "-";

        innerHTML += "<td>" +
            "<div class=\"font-11 color-blue-grey-lighter uppercase\">Time</div> " +
            simtime +
            "</td>";
        if (event_details.event_url)
            innerHTML += "<td>" +
            "<div class=\"font-11 color-blue-grey-lighter uppercase\">URL</div>" +
            event_details.event_url +
            "</td><td></td>";
        else
            innerHTML += "<td></td><td></td>";
        if (!simulation_log) {
            innerHTML += "<td width=\"150\">";
            if (event_details.evt!="begin_recording" && event_details.evt!="end_recording")
                innerHTML += "<a href=\"#\" id=\"deleteEvent" + i + "\">Delete</a>";
            innerHTML += "</td>";
        }

        var eventNode = document.createElement("tr");
        eventNode.innerHTML = innerHTML;
        eventNode.id = "eventRow" + i;
        document.getElementById('events').appendChild(eventNode);

        if (event_details.evt!="begin_recording" && event_details.evt!="end_recording" && !simulation_log) {
            document.getElementById("deleteEvent" + i).onclick = function(e){
                deleteEvent(e.target.id.replace("deleteEvent",""));
            }
        }

        rows_height += $(eventNode).height();
    }
    // Refresh table UI
    if (events.length>0)
        $('.jspContainer').height(rows_height + 43);

    $('.imageDownload').click(function(e) {
        console.log(this.getAttribute('data-image'));

        var pom = document.createElement('a');
        pom.setAttribute('href', this.getAttribute('data-image'));
        pom.setAttribute('download', "screenshot.png");
        pom.style.display = 'none';
        document.body.appendChild(pom);
        pom.click();
        document.body.removeChild(pom);  
    });
}

$('#table-check-head').click(function(e) {
    if (this.checked) {
        $('input[name=eventCheckboxes]').each(function() {
            this.checked = true;
        });
    } else {
        $('input[name=eventCheckboxes]').each(function() {
            this.checked = false;
        });
    }
});
