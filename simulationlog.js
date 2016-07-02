/**
 * Created by ian on 31/05/2016.
 */

function populateSimulations() {
    chrome.storage.local.get('simulations', function (result) {
        var simulations = result.simulations.reverse();

        document.getElementById('simulationGrid').innerHTML = "";

        for (var i=0; i<simulations.length; i++) {
            var innerHTML = "<div class=\"tasks-grid-col ";
            if (simulations[i].finished)
                innerHTML += "green";
            else
                innerHTML += "red";
            innerHTML += "\">" +
                "<section class=\"box-typical task-card task\">";

            if (simulations[i].image) {
                innerHTML += "<div class=\"task-card-photo\"><a href='#'><img style=\"max-height: 120px;\" src=\"";
                innerHTML += simulations[i].image;
                innerHTML += "\" alt=\"\"></a></div>";
            }

            innerHTML += "<div class=\"task-card-in\">" +
                "<div class=\"btn-group task-card-menu\">" +
                "<button type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">" +
                "<i class=\"font-icon-dots-vert-square\"></i>" +
                "</button>" +
                "<div class=\"dropdown-menu dropdown-menu-right\">" +
                "<a class=\"dropdown-item\" href=\"#\"><i class=\"font-icon font-icon-eye\"></i>View</a>" +
                "<a class=\"dropdown-item\" href=\"#\"><i class=\"font-icon font-icon-trash\"></i>Delete</a>" +
                "</div>" +
                "</div>" +
                "<div class=\"task-card-title\">" +
                "<a href=\"#\">Simulation Log for ";
            var starttime = new Date(simulations[i].starttime);
            innerHTML += starttime.toString();
            innerHTML += "</a><br />";
            if (!simulations[i].finished)
                innerHTML += "<span class=\"task-card-title-label\">(Timed Out)</span>";
            else
                innerHTML += "<span class=\"task-card-title-label\">&nbsp;</span>";
            innerHTML += "</div>" +
                "<div class=\"progress-compact-style\">" +
                "<progress class=\"progress\" value=\"100\" max=\"100\">" +
                "<div class=\"progress\">" +
                "<span class=\"progress-bar\" style=\"width: 100%;\">100%</span>" +
                "</div>" +
                "</progress>" +
                "<div class=\"progress-compact-style-label\">100% completed</div>" +
                "</div>" +
                "<div class=\"task-card-tags\">" +
                "<a href=\"#\" class=\"label label-light-grey\">Real-time</a>" +
                "</div>" +
                "</div>" +
                "<div class=\"task-card-footer\">" +
                "<div class=\"task-card-meta-item\"><i style=\"color: #adb7be;\" class=\"font-icon font-icon-list-square\"></i>";
            var stepcount = simulations[i].events.length - 2;
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
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    populateSimulations();
});

populateSimulations();

document.getElementById('simulateButton3').addEventListener('click', function() {
    runSimulation();
});