document.getElementById('simulateButton4').addEventListener('click', function() {
    window.location.href = "/workfloweditor.html#launch";
});

var manifest = chrome.runtime.getManifest();
$('#versionText').text("Version " + manifest.version);
