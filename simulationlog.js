/**
 * Created by ian on 31/05/2016.
 */

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

function populateSimulations() {
    chrome.storage.local.get('simulations', function (result) {
        if (result.simulations !== undefined)
            var simulations = result.simulations.reverse();
        else
			simulations = [];

        document.getElementById('simulationGrid').innerHTML = "";

        for (var i=0; i<simulations.length && i<3; i++) {
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

            var innerHTML = "<div class=\"tasks-grid-col ";
            if (simulations[i].finished)
                innerHTML += "green";
            else
                innerHTML += "red";
            innerHTML += "\">" +
                "<section class=\"box-typical task-card task\">";

            if (simulations[i].image) {
                innerHTML += "<div class=\"task-card-photo\"><a href='simulations.html#" + i + "'><img style=\"max-height: 120px;\" src=\"";
                innerHTML += simulations[i].image;
                innerHTML += "\" alt=\"\"></a></div>";
            }

            innerHTML += "<div class=\"task-card-in\">" +
                "<div class=\"btn-group task-card-menu\">" +
                "<button type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">" +
                "<i class=\"font-icon-dots-vert-square\"></i>" +
                "</button>" +
                "<div class=\"dropdown-menu dropdown-menu-right\">" +
                "<a class=\"dropdown-item\" href=\"simulations.html#" + i + "\"><i class=\"font-icon font-icon-eye\"></i>View</a>" +
                "<a id=\"deleteSimulationButton" + i + "\" class=\"dropdown-item\" href=\"#\"><i class=\"font-icon font-icon-trash\"></i>Delete</a>" +
                "</div>" +
                "</div>" +
                "<div class=\"task-card-title\">" +
                "<a href=\"simulations.html#" + i + "\">Simulation Log from ";
            var starttime = new Date(simulations[i].starttime);
            innerHTML += formatDate(starttime);
            innerHTML += "</a><br />";
            if (!simulations[i].finished)
                innerHTML += "<span class=\"task-card-title-label\">(" + simulations[i].terminate_reason + ")</span>";
            else
                innerHTML += "<span class=\"task-card-title-label\">&nbsp;</span>";
            innerHTML += "</div>" +
                "<div class=\"progress-compact-style\">" +
                "<progress class=\"progress\" value=\"" + percentile + "\" max=\"100\">" +
                "<div class=\"progress\">" +
                "<span class=\"progress-bar\" style=\"width: 100%;\">" + percentile + "%</span>" +
                "</div>" +
                "</progress>" +
                "<div class=\"progress-compact-style-label\">" + percentile + "% completed</div>" +
                "</div>" +
                "<div class=\"task-card-tags\">";
            if (simulations[i].favorite)
                innerHTML += "<a href=\"#\" class=\"label label-light-grey\">Favorite</a>";
            else
                innerHTML += "<a href=\"#\" class=\"label label-light-grey\">Workflow</a>";
            innerHTML += "</div>" +
                "</div>" +
                "<div class=\"task-card-footer\">" +
                "<div class=\"task-card-meta-item\"><i style=\"color: #adb7be;\" class=\"font-icon font-icon-list-square\"></i>";
            if (stepcount<2)
                innerHTML += "1 step";
            else
                innerHTML += stepcount + " steps";
            innerHTML += "</div>" +
                "<div class=\"task-card-meta-item\"><i style=\"color: #adb7be;\" class=\"fa fa-clock-o\"></i> ";
            innerHTML += Math.floor((simulations[i].endtime - simulations[i].starttime)/1024);
            innerHTML += " secs</div>" +
                "</div>" +
                "</section>" +
                "</div>";
            document.getElementById('simulationGrid').innerHTML += innerHTML;
        }
        for (var i=0; i<simulations.length && i<3; i++)
            $('#deleteSimulationButton' + i).click(deleteSimulation);
    });
}

function deleteSimulation() {
    var i = parseInt($(this).attr('id').replace("deleteSimulationButton",""));

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
            simulations = result.simulations.reverse();
            if (!Array.isArray(events)) { // for safety only
                events = [];
            }
            simulations.splice(i,1);
            simulations = result.simulations.reverse();
            chrome.storage.local.set({simulations: simulations}, function(){
                location.reload();
            });
        });
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    populateSimulations();
});

populateSimulations();

document.getElementById('simulateButton3').addEventListener('click', function() {
    window.location.href = "/workfloweditor.html#launch";
});