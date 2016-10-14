document.getElementById('simulateButton4').addEventListener('click', function() {
    runSimulation();
});

var manifest = chrome.runtime.getManifest();
$('#versionText').text("Version " + manifest.version);
