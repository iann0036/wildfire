function updateSettings() {
    chrome.storage.local.set({settings: all_settings});
}

chrome.storage.local.get('settings', function (settings) {
    all_settings = settings.settings;
    if (all_settings.recordmouseover)
        $('#setting-record-mouse-over').click();
    if (all_settings.recordmouseout)
        $('#setting-record-mouse-out').click();
    if (all_settings.simulatemouseover)
        $('#setting-simulate-mouse-over').click();
    if (all_settings.simulatemouseout)
        $('#setting-simulate-mouse-out').click();
    if (all_settings.emulatehover)
        $('#setting-emulate-hover').click();
    if (all_settings.activateeditor)
        $('#setting-activate-editor').click();
    if (all_settings.leavesimulationopen)
        $('#setting-leave-simulation-open').click();
    if (all_settings.customsubmit)
        $('#setting-custom-submit').click();
    if (all_settings.runminimized)
        $('#setting-run-minimized').click();
});

$('#setting-record-mouse-over').change(function() {
    all_settings.recordmouseover = $(this).is(":checked");
    updateSettings();
});

$('#setting-record-mouse-out').change(function() {
    all_settings.recordmouseout = $(this).is(":checked");
    updateSettings();
});

$('#setting-simulate-mouse-over').change(function() {
    all_settings.simulatemouseover = $(this).is(":checked");
    updateSettings();
});

$('#setting-simulate-mouse-out').change(function() {
    all_settings.simulatemouseout = $(this).is(":checked");
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

$('#setting-activate-editor').change(function() {
    all_settings.activateeditor = $(this).is(":checked");
    if (all_settings.activateeditor)
        $('#workflowEditorPrimaryLink').attr('style','display: inline-block;');
    else
        $('#workflowEditorPrimaryLink').attr('style','display: none;');
    updateSettings();
});

$('#setting-leave-simulation-open').change(function() {
    all_settings.leavesimulationopen = $(this).is(":checked");
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