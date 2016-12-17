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
$('#setting-flush-database').click(function(e) {
	e.preventDefault();
	$(this).attr('disabled','disabled');
    chrome.storage.local.set({simulations: []});
});