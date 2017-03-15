/**
 * Created by ian on 31/05/2016.
 */

var simulationId = window.location.hash.split("#")[1];
if (simulationId === undefined)
    window.location.href = "/simulationlog.html";

function populateSimulation() {
    chrome.storage.local.get('simulations', function (result) {
        var simulations = result.simulations.reverse();
		if (!Array.isArray(simulations))
			simulations = [];

        var i = parseInt(simulationId);
        
        var stepcount;
        if (simulations[i].node_details !== undefined && simulations[i].node_details.length > 0) // is it a workflow?
            stepcount = simulations[i].node_details.length - 2;
        else
            stepcount = simulations[i].events.length - 2;
        var logcount = simulations[i].log.length - 2;

        var percentile = Math.floor(logcount*100/stepcount);
        percentile = Math.max(0,Math.min(percentile, 100)); // bounded for safety

        for (var j=0; j<simulations[i].node_details.length; j++) {
            if (simulations[i].node_details[j].id == simulations[i].log[simulations[i].log.length-1].id &&
                simulations[i].node_details[j].evt == "end_recording") {
                percentile = 100;
                simulations[i].finished = true;
            }
        }

        $('#noScreenshotText').remove();
        
        if (simulations[i].image !== undefined)
            $('#screenshot').attr('src',simulations[i].image);
        else {
            $('#screenshot').attr('style','margin-top: 50px; margin-bottom: 20px; width: 125px; height: 125px;');
            $('#screenshot').attr('src','/unavailable.png');
            $('#screenshot').parent().append("<h5 id='noScreenshotText' style='margin-bottom: 80px;'>No Screenshot Available</h5>");
        }
        $('#progressBar').val(Math.min(percentile, 100));
        $('#progressBar').html(percentile + "%");
        if (percentile != 100) {
            $('#progressBar').removeClass('progress-success');
            $('#progressBar').addClass('progress-danger');
        }
        $('#recordDate').html(formatDate(new Date(simulations[i].events[1].time)));
        $('#simulationDate').html(formatDate(new Date(simulations[i].starttime)));
        $('#recordTime').html(formatDiffDate(simulations[i].events[1].time,simulations[i].events[simulations[i].events.length-1].time));
        $('#simulationTime').html(formatDiffDate(simulations[i].starttime+1000,simulations[i].endtime));

        if (simulations[i].favorite)
            $('#tags').html("<a href=\"#\" class=\"label label-light-grey\">Favorite</a>");
        else
            $('#tags').html("<a href=\"#\" class=\"label label-light-grey\">Workflow</a>");
            

        if (!simulations[i].finished) {
            $('#terminationReason').html(simulations[i].terminate_reason);
            $('#terminationReason').attr('style','');
            $('#terminationReason').attr('class','color-red');
        }

        //$('#simDetails').html(JSON.stringify(simulations[i].log, null, 2));
        if (simulations[i].node_details !== undefined && simulations[i].node_details.length > 0)
            populateSimulationEvents(simulations[i]);
    });
}

function deleteSimulation() {
    swal({
        title: "Are you sure?",
        text: "The simulation will be deleted.",
        type: "warning",
        showCancelButton: true,
        cancelButtonClass: "btn-default",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Delete",
        closeOnConfirm: true
    },
    function(){
        chrome.storage.local.get('simulations', function (result) {
            var i = parseInt(simulationId);

            simulations = result.simulations.reverse();
            if (!Array.isArray(events)) { // for safety only
                events = [];
            }
            simulations.splice(i,1);
            simulations = result.simulations.reverse();
            chrome.storage.local.set({simulations: simulations}, function(){
                window.location.href = "simulationlog.html";
            });
        });
    });
}

$('#deleteSimulationLink').click(deleteSimulation);

chrome.storage.onChanged.addListener(function(changes, namespace) {
    populateSimulation();
});

document.addEventListener('visibilitychange', function(){
    if (!document.hidden) {
        populateSimulation();
    }
});

populateSimulation();
