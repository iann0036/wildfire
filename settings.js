function updateSettings() {
    chrome.storage.local.set({settings: all_settings});
}

chrome.storage.local.get('settings', function (settings) {
    all_settings = settings.settings;
    if (all_settings.recordmousedown)
        $('#setting-record-mousedown').click();
    if (all_settings.recordmouseout)
        $('#setting-record-mouseup').click();
    if (all_settings.recordmouseover)
        $('#setting-record-mouseover').click();
    if (all_settings.recordmouseout)
        $('#setting-record-mouseout').click();
    if (all_settings.recordselect)
        $('#setting-record-select').click();
    if (all_settings.recordfocusin)
        $('#setting-record-focusin').click();
    if (all_settings.recordfocusout)
        $('#setting-record-focusout').click();
    if (all_settings.recordclick)
        $('#setting-record-click').click();
    if (all_settings.recordkeydown)
        $('#setting-record-keydown').click();
    if (all_settings.recordkeypress)
        $('#setting-record-keypress').click();
    if (all_settings.recordkeyup)
        $('#setting-record-keyup').click();
    if (all_settings.recordinput)
        $('#setting-record-input').click();
    if (all_settings.recordchange)
        $('#setting-record-change').click();
    if (all_settings.recordscroll)
        $('#setting-record-scroll').click();
    
    if (all_settings.simulatemousedown)
        $('#setting-simulate-mousedown').click();
    if (all_settings.simulatemouseout)
        $('#setting-simulate-mouseup').click();
    if (all_settings.simulatemouseover)
        $('#setting-simulate-mouseover').click();
    if (all_settings.simulatemouseout)
        $('#setting-simulate-mouseout').click();
    if (all_settings.simulateselect)
        $('#setting-simulate-select').click();
    if (all_settings.simulatefocusin)
        $('#setting-simulate-focusin').click();
    if (all_settings.simulatefocusout)
        $('#setting-simulate-focusout').click();
    if (all_settings.simulateclick)
        $('#setting-simulate-click').click();
    if (all_settings.simulatekeydown)
        $('#setting-simulate-keydown').click();
    if (all_settings.simulatekeypress)
        $('#setting-simulate-keypress').click();
    if (all_settings.simulatekeyup)
        $('#setting-simulate-keyup').click();
    if (all_settings.simulateinput)
        $('#setting-simulate-input').click();
    if (all_settings.simulatechange)
        $('#setting-simulate-change').click();
    if (all_settings.simulatescroll)
        $('#setting-simulate-scroll').click();
    
    if (all_settings.emulatehover)
        $('#setting-emulate-hover').click();
    if (all_settings.leavesimulationopen)
        $('#setting-leave-simulation-open').click();
    if (all_settings.clearbrowsingdata)
        $('#setting-clear-browsing-data').click();
    if (all_settings.customsubmit)
        $('#setting-custom-submit').click();
    if (all_settings.runminimized)
        $('#setting-run-minimized').click();
    if (all_settings.incognito)
        $('#setting-incognito').click();
    if (all_settings.rightclick)
        $('#setting-rightclick').click();
    if (all_settings.suppressalerts)
        $('#setting-suppressalerts').click();
    if (all_settings.directinputdefault)
        $('#setting-directinputdefault').click();
    if (all_settings.recordnative)
        $('#setting-recordnative').click();
    if (all_settings.account != "" && all_settings.account !== undefined) {
        $('#setting-account').html(all_settings.account);
        $('#setting-account').parent().append("&nbsp;&nbsp;<a id='unlinkButton' href='#'>Unlink</a>");
        $('#unlinkButton').click(unlinkAccount);
    }
});

function unlinkAccount() {
    chrome.storage.local.get('settings', function (settings) {
        all_settings = settings.settings;
        all_settings.account = "";
        all_settings.cloudapikey = "";
        chrome.storage.local.set({settings: all_settings},function(){
            location.reload();
        });
    });
}

$('#setting-record-mousedown').change(function() {
    all_settings.recordmousedown = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-mouseup').change(function() {
    all_settings.recordmouseup = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-mouseover').change(function() {
    all_settings.recordmouseover = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-mouseout').change(function() {
    all_settings.recordmouseout = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-select').change(function() {
    all_settings.recordselect = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-focusin').change(function() {
    all_settings.recordfocusin = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-focusout').change(function() {
    all_settings.recordfocusout = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-click').change(function() {
    all_settings.recordclick = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-keydown').change(function() {
    all_settings.recordkeydown = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-keypress').change(function() {
    all_settings.recordkeypress = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-keyup').change(function() {
    all_settings.recordkeyup = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-input').change(function() {
    all_settings.recordinput = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-change').change(function() {
    all_settings.recordchange = $(this).is(":checked");
    updateSettings();
});
$('#setting-record-scroll').change(function() {
    all_settings.recordscroll = $(this).is(":checked");
    updateSettings();
});

$('#setting-simulate-mousedown').change(function() {
    all_settings.simulatemousedown = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-mouseup').change(function() {
    all_settings.simulatemouseup = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-mouseover').change(function() {
    all_settings.simulatemouseover = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-mouseout').change(function() {
    all_settings.simulatemouseout = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-select').change(function() {
    all_settings.simulateselect = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-focusin').change(function() {
    all_settings.simulatefocusin = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-focusout').change(function() {
    all_settings.simulatefocusout = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-click').change(function() {
    all_settings.simulateclick = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-keydown').change(function() {
    all_settings.simulatekeydown = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-keypress').change(function() {
    all_settings.simulatekeypress = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-keyup').change(function() {
    all_settings.simulatekeyup = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-input').change(function() {
    all_settings.simulateinput = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-change').change(function() {
    all_settings.simulatechange = $(this).is(":checked");
    updateSettings();
});
$('#setting-simulate-scroll').change(function() {
    all_settings.simulatescroll = $(this).is(":checked");
    updateSettings();
});

$('#setting-emulate-hover').change(function() {
    all_settings.emulatehover = $(this).is(":checked");
    updateSettings();
});
$('#setting-custom-submit').change(function() {
    all_settings.customsubmit = $(this).is(":checked");
    updateSettings();
});
$('#setting-leave-simulation-open').change(function() {
    all_settings.leavesimulationopen = $(this).is(":checked");
    updateSettings();
});
$('#setting-clear-browsing-data').change(function() {
    all_settings.clearbrowsingdata = $(this).is(":checked");
    updateSettings();
});
$('#setting-run-minimized').change(function() {
    all_settings.runminimized = $(this).is(":checked");
    updateSettings();
});
$('#setting-incognito').change(function() {
    all_settings.incognito = $(this).is(":checked");
    updateSettings();
});
$('#setting-rightclick').change(function() {
    all_settings.rightclick = $(this).is(":checked");
    updateSettings();
});
$('#setting-suppressalerts').change(function() {
    all_settings.suppressalerts = $(this).is(":checked");
    updateSettings();
});
$('#setting-directinputdefault').change(function() {
    all_settings.directinputdefault = $(this).is(":checked");
    updateSettings();
});
$('#setting-recordnative').change(function() {
    all_settings.recordnative = $(this).is(":checked");
    updateSettings();
});
$('#setting-flush-simulation-log').click(function(e) {
	e.preventDefault();
	$(this).attr('disabled','disabled');
    chrome.storage.local.set({simulations: []},function(){
        calculateUsage();
    });
});
$('#setting-flush-favorites').click(function(e) {
	e.preventDefault();
	$(this).attr('disabled','disabled');
    chrome.storage.local.set({favorites: []},function(){
        chrome.storage.local.get('scheduled', function (result) {
            var scheduled = result.scheduled;
            if (!Array.isArray(scheduled)) { // for safety only
                scheduled = [];
            }
            for (var i=0; i<scheduled.length; i++) {
                if (scheduled[i].workflow != -1) {
                    scheduled.splice(i, 1);
                    i--;
                }
            }
            chrome.storage.local.set({scheduled: scheduled},function(){
                populateFavoritesTable();
                populateScheduledTable();
                calculateUsage();
            });
        });
    });
});
$('#setting-flush-event-log-workflow').click(function(e) {
	e.preventDefault();
	$(this).attr('disabled','disabled');
    chrome.storage.local.remove('workflow',function(){
        chrome.storage.local.remove('events',function(){
            calculateUsage();
        });
    });
});
$('#setting-reset-wildfire').click(function(e) {
	e.preventDefault();
    chrome.storage.local.clear(function(){
        chrome.runtime.reload();
    });
});

chrome.extension.isAllowedIncognitoAccess(function(isAllowedIncognito) {
    if (!isAllowedIncognito) {
        $('#setting-incognito').attr('disabled','disabled');
        $('#incognito-warning').attr('style','');
    }
});

chrome.runtime.sendMessage(null, {
    'action': 'getHelperStatus'
}, null, function(response) {
    if (response.helperversion && response.native_port)
        helperisforsureinstalled = true; // do nothing
    else {
        $('#setting-recordnative').attr('disabled','disabled');
        $('#recordnative-warning').attr('style','');
    }
});

function bytesReadable(bytes) {
    if (bytes > 1024*1024*1024)
        return (bytes/(1024*1024*1024)).toFixed(2) + " GB";
    if (bytes > 1024*1024)
        return (bytes/(1024*1024)).toFixed(2) + " MB";
    if (bytes > 1024)
        return (bytes/1024).toFixed(2) + " KB";
    return bytes + " B";
}

function calculateUsage() {
    chrome.storage.local.getBytesInUse('workflow',function(workflow_usage){
        $('#workflow-editor-usage').text(bytesReadable(workflow_usage));
        chrome.storage.local.getBytesInUse('events',function(events_usage){
            $('#event-log-usage').text(bytesReadable(events_usage));
            chrome.storage.local.getBytesInUse('simulations',function(simulations_usage){
                $('#simulation-log-usage').text(bytesReadable(simulations_usage));
                chrome.storage.local.getBytesInUse('favorites',function(favorites_usage){
                    $('#favorites-usage').text(bytesReadable(favorites_usage));
                    chrome.storage.local.getBytesInUse([
                        'settings',
                        'recording',
                        'simulating',
                        'scheduled'
                    ],function(metadata_usage){
                        $('#metadata-usage').text(bytesReadable(metadata_usage));

                        $('#total-usage').text(bytesReadable(
                            workflow_usage +
                            events_usage +
                            simulations_usage +
                            favorites_usage +
                            metadata_usage
                        ));

                        $('#usage-chart').html(""); // clear chart if already exists

                        c3.generate({
                            bindto: '#usage-chart',
                            data: {
                                columns: [
                                    ['Workflow', workflow_usage],
                                    ['Events', events_usage],
                                    ['Simulations', simulations_usage],
                                    ['Favorites', favorites_usage],
                                    ['Metadata', metadata_usage],
                                ],
                                colors: {
                                    Workflow: '#fa424a',
                                    Events: '#46c35f',
                                    Simulations: '#fdad2a',
                                    Favorites: '#00a8ff',
                                    Metadata: '#ac6bec'
                                },
                                type : 'donut'
                            },
                            size: {
                                width: 156,
                                height: 180
                            },
                            label: {
                                show: false
                            },
                            legend: {
                                hide: true
                            },
                            tooltip: {
                                show: false
                            }
                        });
                        d3.selectAll("text").text("")
                    });
                });
            });
        });
    });
}

calculateUsage();

function formatDateLong(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  try {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ', ' + year;
  } catch(e) {
    return 'Err';
  }
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

function populateFavoritesTable() {
    chrome.commands.getAll(function (setcommands) {
        chrome.storage.local.get('favorites', function (result) {
            var favorites = result.favorites;
            if (!Array.isArray(favorites)) { // for safety only
                favorites = [];
            }

            if (favorites.length < 1)
                $('#favoritesTable').html("<tr><td colspan='4' style='text-align: center;'>Nothing has been favorited yet!</td></tr>");
            else
                $('#favoritesTable').html("");

            // Schedule modal
            $('#scheduleWorkflow').html("");
            var default_opt = document.createElement("option");
            default_opt.setAttribute("value", "-1");
            default_opt.innerHTML = "Current Workflow";
            $('#scheduleWorkflow').append(default_opt);

            for (var i=0; i<favorites.length; i++) {
                var innerHTML = "<tr id=\"favoriteRow" + (i+1) + "\">" +
                "    <td>" + favorites[i].name + "</td>" +
                "    <td>" +
                "        <div class=\"checkbox-toggle\" style=\"margin-top: 8px; margin-bottom: 4px; margin-left: 36px;\">" +
                "            <input type=\"checkbox\" id=\"check-toggle-" + (i+1) + "\"";
                if (favorites[i].rightclick)
                    innerHTML += " checked";
                innerHTML += ">" +
                "            <label for=\"check-toggle-" + (i+1) + "\"></label>" +
                "        </div>" +
                "    </td>" +
                "    <td>";
                if (favorites[i].shortcut) {

                    innerHTML += "<button style='margin: 0;' type='button' class='btn btn-sm btn-inline btn-secondary-outline'>" + setcommands[favorites[i].shortcut].shortcut.replace(/\+/g, "</button>&nbsp;&nbsp;<b class='color-blue-grey'>+</b>&nbsp;&nbsp;<button style='margin: 0;' type='button' class='btn btn-sm btn-inline btn-secondary-outline'>") + "</button>";
                } else
                    innerHTML += "&nbsp;<b class='color-blue-grey'>-</b>";
                innerHTML += "</td>" +
                "    <td>" + formatDate(favorites[i].time) + "</td>" +
                "    <td>" +
                "        <a href=\"#\" id=\"renameFavorite" + (i+1) + "\">Rename</a>&nbsp;&nbsp;" +
                "        <a href=\"#\" id=\"restoreFavorite" + (i+1) + "\">Restore</a>&nbsp;&nbsp;" +
                "        <a href=\"#\" id=\"shortcutFavorite" + (i+1) + "\">Set Shortcut</a>&nbsp;&nbsp;" +
                "        <a href=\"#\" id=\"deleteFavorite" + (i+1) + "\">Delete</a>" +
                "    </td>" +
                "</tr>";

                $('#favoritesTable').append(innerHTML);
                $('#check-toggle-' + (i+1)).change(i, function(evt){
                    var checked = this.checked;
                    chrome.storage.local.get('favorites', function (result) {
                        var favorites = result.favorites;
                        favorites[evt.data].rightclick = checked;
                        chrome.storage.local.set({favorites: favorites});
                    });
                });
                $('#shortcutFavorite' + (i+1)).click(i, function(evt){
                    chrome.commands.getAll(function(commands){
                        var htmlmodal = "Pick a key combination for your workflow:<br /><br /><select id='keyCombo'><option value='none'>(No Assignment)</option>";
                        if (commands[1].shortcut != "")
                            htmlmodal += "<option value='1'>" + commands[1].shortcut.replace(/\+/g, " + ") + "</option>";
                        if (commands[2].shortcut != "")
                            htmlmodal += "<option value='2'>" + commands[2].shortcut.replace(/\+/g, " + ") + "</option>";
                        if (commands[3].shortcut != "")
                            htmlmodal += "<option value='3'>" + commands[3].shortcut.replace(/\+/g, " + ") + "</option>";
                        htmlmodal += "</select><br /><br />";
                        swal({
                            title: "Set Shortcut",
                            text: htmlmodal,
                            html: true,
                            showCancelButton: true,
                            closeOnConfirm: false
                        }, function () {
                            var inputValue = $('#keyCombo').val();
                            if (inputValue === false || inputValue === "") {
                                swal("Error", "You need to select a key combination", "error");
                                return false;
                            }
                            chrome.storage.local.get('favorites', function (result) {
                                var favorites = result.favorites;

                                for (var j=0; j<favorites.length; j++) {
                                    if (favorites[j].shortcut == inputValue)
                                        favorites[j].shortcut = false;
                                }
        
                                favorites[evt.data].shortcut = inputValue;
                                if (inputValue == "none")
                                    favorites[evt.data].shortcut = false;
        
                                chrome.storage.local.set({favorites: favorites});
        
                                swal({
                                    title: "Done",
                                    text: "Your workflow shortcut key has been assigned.",
                                    type: "success",
                                    html: true
                                }, function(){
                                    populateFavoritesTable();
                                });
                            });
                        });
                    });
                });
                $('#renameFavorite' + (i+1)).click(i, function(evt){
                    swal({
                        title: "Rename Favorited Workflow",
                        text: "Enter your new workflow name:",
                        type: "input",
                        showCancelButton: true,
                        closeOnConfirm: false,
                        inputPlaceholder: ""
                    }, function (inputValue) {
                        if (inputValue === false || inputValue.trim() === "") {
                            swal("Error", "You need to enter a workflow name", "error");
                            return false;
                        }
                        chrome.storage.local.get('favorites', function (result) {
                            var favorites = result.favorites;

                            favorites[evt.data].name = inputValue.trim();

                            chrome.storage.local.set({favorites: favorites});

                            swal({
                                title: "Done",
                                text: "Your favorited workflow has been renamed.",
                                type: "success",
                                html: true
                            }, function(){
                                populateFavoritesTable();
                            });
                        });
                    });
                });
                $('#restoreFavorite' + (i+1)).click(i, function(evt){
                    chrome.storage.local.get('favorites', function (result) {
                        var favorites = result.favorites;
                        var importedjson = JSON.parse(decrypt(favorites[evt.data].workflow));
                        chrome.storage.local.set({events: importedjson.events});
                        chrome.storage.local.set({workflow: favorites[evt.data].workflow});

                        swal({
                            title: "Done",
                            text: "Your workflow has been restored.",
                            type: "success",
                            html: true
                        });
                    });
                });
                $('#deleteFavorite' + (i+1)).click(i, function(evt){
                    swal({
                        title: "Are you sure?",
                        text: "This workflow will be deleted.",
                        type: "warning",
                        showCancelButton: true,
                        cancelButtonClass: "btn-default",
                        confirmButtonClass: "btn-danger",
                        confirmButtonText: "Delete",
                        closeOnConfirm: true
                    }, function(resp) {
                        if (!resp)
                            return;
                        chrome.storage.local.get('favorites', function (result) {
                            var favorites = result.favorites;
                            favorites.splice(evt.data, 1);
                            chrome.storage.local.set({favorites: favorites});

                            chrome.storage.local.get('scheduled', function (result) {
                                var scheduled = result.scheduled;
                                if (!Array.isArray(scheduled)) { // for safety only
                                    scheduled = [];
                                }
                                for (var j=0; j<scheduled.length; j++) {
                                    if (scheduled[j].workflow == evt.data) {
                                        scheduled.splice(j, 1);
                                        j--;
                                    } else if (scheduled[j].workflow > evt.data) {
                                        scheduled[j].workflow = scheduled[j].workflow - 1;
                                    }
                                }
                                chrome.storage.local.set({scheduled: scheduled},function(){
                                    calculateUsage();
                                });
                            });

                            populateFavoritesTable();
                            populateScheduledTable();
                        });
                    });
                });

                // Also populate the schedule create modal option
                var opt = document.createElement("option");
                opt.setAttribute("value", i);
                opt.innerHTML = favorites[i].name;
                $('#scheduleWorkflow').append(opt);
            }
        });
    });
}

populateFavoritesTable();

function populateScheduledTable() {
    chrome.storage.local.get('favorites', function (result) {
        var favorites = result.favorites;
        if (!Array.isArray(favorites)) { // for safety only
            favorites = [];
        }
        chrome.storage.local.get('scheduled', function (result) {
            var scheduled = result.scheduled;
            if (!Array.isArray(scheduled)) { // for safety only
                scheduled = [];
            }

            if (scheduled.length < 1)
                $('#scheduledTable').html("<tr><td colspan='5' style='text-align: center;'>Nothing has been scheduled yet!</td></tr>");
            else
                $('#scheduledTable').html("");

            for (var i=0; i<scheduled.length; i++) {
                var repeat = "Never";
                if (scheduled[i].repeat==1) repeat = "Every Minute";
                if (scheduled[i].repeat==5) repeat = "Every 5 Minutes";
                if (scheduled[i].repeat==15) repeat = "Every 15 Minutes";
                if (scheduled[i].repeat==30) repeat = "Every 30 Minutes";
                if (scheduled[i].repeat==60) repeat = "Every Hour";
                if (scheduled[i].repeat==240) repeat = "Every 4 Hours";
                if (scheduled[i].repeat==1440) repeat = "Every 24 Hours";
                
                var workflowname = "<a href='/workfloweditor.html'>Current Workflow</a>";
                if (scheduled[i].workflow > -1)
                    workflowname = favorites[scheduled[i].workflow].name;

                var monthNames = [ "January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December" ];
                var schDate = new Date(scheduled[i].date);
                schDate = monthNames[schDate.getMonth()] + " " + schDate.getDate() + ", " + schDate.getFullYear() + " @ " + ((schDate.getHours() + 11) % 12 + 1) + ":" + (schDate.getMinutes() > 9 ? schDate.getMinutes() : "0" + schDate.getMinutes()) + " " + (schDate.getHours() >= 12 ? "PM" : "AM");

                if (scheduled[i].sunday === false || scheduled[i].monday === false || scheduled[i].tuesday === false || scheduled[i].wednesday === false || scheduled[i].thursday === false || scheduled[i].friday === false || scheduled[i].saturday === false) {
                    var runOnDays = [];
                    if (scheduled[i].sunday)
                        runOnDays.push("Sunday");
                    if (scheduled[i].monday)
                        runOnDays.push("Monday");
                    if (scheduled[i].tuesday)
                        runOnDays.push("Tuesday");
                    if (scheduled[i].wednesday)
                        runOnDays.push("Wednesday");
                    if (scheduled[i].thursday)
                        runOnDays.push("Thursday");
                    if (scheduled[i].friday)
                        runOnDays.push("Friday");
                    if (scheduled[i].saturday)
                        runOnDays.push("Saturday");
                    
                    schDate += ' <span class="hint-circle grey" data-toggle="tooltip" data-placement="top" title="" data-original-title="Only run on ' + runOnDays.join(", ") + '">?</span>';
                }

                var innerHTML = "<tr id=\"scheduledRow" + (i+1) + "\">" +
                "    <td>" + workflowname + "</td>" +
                "    <td>" + schDate + "</td>" +
                "    <td>" + repeat + "</td>" +
                "    <td>Local Machine</td>" +
                "    <td>" +
                "        <a href=\"#\" id=\"deleteschedule" + (i+1) + "\">Delete</a>" +
                "    </td>" +
                "</tr>";

                $('#scheduledTable').append(innerHTML);
                $('#deleteschedule' + (i+1)).click(i, function(evt){
                    swal({
                        title: "Are you sure?",
                        text: "This schedule will be deleted.",
                        type: "warning",
                        showCancelButton: true,
                        cancelButtonClass: "btn-default",
                        confirmButtonClass: "btn-danger",
                        confirmButtonText: "Delete",
                        closeOnConfirm: true
                    }, function(resp) {
                        if (!resp)
                            return;
                        chrome.storage.local.get('scheduled', function (result) {
                            var scheduled = result.scheduled;
                            scheduled.splice(evt.data, 1);
                            chrome.storage.local.set({scheduled: scheduled},function(){
                                populateScheduledTable();
                                calculateUsage();
                            });
                        });
                    });
                });
            }
        });
    });
}

populateScheduledTable();

if (window.location.hash == "#favorites") {
    setTimeout(function(){
        $('#favoritesTab').click();
    },1);
}

$('.datetimepicker-1').datetimepicker({
    widgetPositioning: {
        horizontal: 'right'
    },
    debug: false
});

$('#addScheduledSim').click(function(){
    $('#sundaySchedule').attr("checked","");
    $('#sundaySchedule').parent().addClass("active");
    $('#mondaySchedule').attr("checked","");
    $('#mondaySchedule').parent().addClass("active");
    $('#tuesdaySchedule').attr("checked","");
    $('#tuesdaySchedule').parent().addClass("active");
    $('#wednesdaySchedule').attr("checked","");
    $('#wednesdaySchedule').parent().addClass("active");
    $('#thursdaySchedule').attr("checked","");
    $('#thursdaySchedule').parent().addClass("active");
    $('#fridaySchedule').attr("checked","");
    $('#fridaySchedule').parent().addClass("active");
    $('#saturdaySchedule').attr("checked","");
    $('#saturdaySchedule').parent().addClass("active");
});

$('#addScheduleSubmitButton').click(function(){
    if ($('#scheduleDateTime').val()=="") {
        swal("Error", "You must set the Date / Time of Simulation field", "error");
        return;
    }

    // TODO - Validate this
    var date_split_1 = $('#scheduleDateTime').val().split(" ");
    var date_split_2 = date_split_1[0].split("/");
    var date_split_3 = date_split_1[1].split(":");
    var hours = date_split_3[0]%12;
    if (date_split_1[2]=="PM")
        hours += 12;
    var date = new Date(parseInt(date_split_2[2]),parseInt(date_split_2[0])-1,parseInt(date_split_2[1]),parseInt(hours),parseInt(date_split_3[1]));

    chrome.storage.local.get('scheduled', function (result) {
        var scheduled = result.scheduled;
        if (!Array.isArray(scheduled)) { // for safety only
            scheduled = [];
        }

        scheduled.push({
            workflow: $('#scheduleWorkflow').val(),
            date: date.getTime(),
            repeat: $('#scheduleRepeat').val(),
            created: Date.now(),
            sunday: $('#sundaySchedule').prop("checked"),
            monday: $('#mondaySchedule').prop("checked"),
            tuesday: $('#tuesdaySchedule').prop("checked"),
            wednesday: $('#wednesdaySchedule').prop("checked"),
            thursday: $('#thursdaySchedule').prop("checked"),
            friday: $('#fridaySchedule').prop("checked"),
            saturday: $('#saturdaySchedule').prop("checked")
        });
        chrome.storage.local.set({scheduled: scheduled},function(){
            $('#scheduleWorkflow').val("-1");
            $('#scheduleDateTime').val("");
            $('#scheduleRepeat').val("0");
            $('.modal').modal('toggle');

            swal("Success", "You have successfully added a schedule", "success");

            populateScheduledTable();
        });
    });
});
