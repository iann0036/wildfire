/**
 * Created by ian on 24/04/2016.
 */

function deleteEvent(i) {
    swal({
        title: "Are you sure?",
        text: "The event will be deleted.",
        type: "warning",
        showCancelButton: true,
        cancelButtonClass: "btn-default",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Delete",
        closeOnConfirm: true
    },
    function(){
        chrome.storage.local.get('events', function (result) {
            events = result.events;
            if (!Array.isArray(events)) { // for safety only
                events = [];
            }
            events.splice(i,1);
            chrome.storage.local.set({events: events}, function(){
				location.reload();
			});
        });
    });
}

function deleteMultipleEvents() {
    var toBeDeleted = [];

    $('input[name=eventCheckboxes]').each(function() {
        if (this.checked) {
            toBeDeleted.push(this.id.replace("event-",""));
        }
    });

    swal({
        title: "Are you sure?",
        text: "The selected events will be deleted.",
        type: "warning",
        showCancelButton: true,
        cancelButtonClass: "btn-default",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Delete",
        closeOnConfirm: true
    },
    function(){
        chrome.storage.local.get('events', function (result) {
            events = result.events;
            if (!Array.isArray(events)) { // for safety only
                events = [];
            }
            for (var i=0; i<toBeDeleted.length; i++) {
                events.splice(toBeDeleted[i]-i,1);
            }
            chrome.storage.local.set({events: events}, function(){
				location.reload();
			});
        });
    });
}

document.addEventListener('visibilitychange', function(){
    if (!document.hidden) {
        chrome.storage.local.get('events', function (result) {
            populateEvents(result);
        });
    }
});

//window.onload = function() {
    chrome.storage.local.get('events', function (result) {
        populateEvents(result);
    });
    document.getElementById('downloadEventLogButton').addEventListener('click', function() {
        downloadEventLog();
    });
    document.getElementById('deleteMultipleEvents').addEventListener('click', function() {
        deleteMultipleEvents();
    });
    

//}
