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
        populateFavoritesTable();
        calculateUsage();
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
                        'simulating'
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

function formatDate(date) {
	var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return date.toString();
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
    chrome.storage.local.get('favorites', function (result) {
        var favorites = result.favorites;
        if (!Array.isArray(favorites)) { // for safety only
            favorites = [];
        }

        if (favorites.length < 1)
            $('#favoritesTable').html('<tr><td colspan="4" style="text-align: center;">Nothing has been favorited yet!</td></tr>');
        else
            $('#favoritesTable').html("");

        for (var i=0; i<favorites.length; i++) {
            var innerHTML = "<tr>" +
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
            "    <td>" + formatDate(favorites[i].time) + "</td>" +
            "    <td>" +
            "        <a href=\"#\" id=\"restoreFavorite" + (i+1) + "\">Restore</a>&nbsp;&nbsp;" +
            "        <a href=\"#\" id=\"deleteFavorite" + (i+1) + "\">Delete</a>" +
            "    </td>" +
            "</tr>";

            $('#favoritesTable').append(innerHTML);
        }
    });
}

populateFavoritesTable();

if (window.location.hash == "#favorites") {
    setTimeout(function(){
        $('#favoritesTab').click();
    },1);
}