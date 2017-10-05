document.getElementById('simulateButton4').addEventListener('click', function() {
    window.location.href = "/workfloweditor.html#launch";
});

var manifest = chrome.runtime.getManifest();
$('#versionText').text("Version " + manifest.version);

function updateHelperStatus() {
    chrome.runtime.sendMessage(null, {
        'action': 'getHelperStatus'
    }, null, function(response) {
        if (response.helperversion && response.native_port)
            $('#helperText').html("<font style=\"color: #5fba7d;\">&#9679;</font>&nbsp;&nbsp;Helper Version " + response.helperversion);
        else
            $('#helperText').html("<font style=\"color: #ed4337;\">&#9679;</font>&nbsp;&nbsp;Helper Unavailable");
    });
}

updateHelperStatus();

setInterval(function(){
    updateHelperStatus();
}, 5000);