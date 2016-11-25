var nodes = [];
var links = [];
var CustomTick;
var CustomCross;
var CustomPending;
var CustomStop;
var node;

var waitForElementInterval;
var CustomTracker = [];

$(window).load(function () {
    defineCustoms();
});

function defineCustoms() {
    CustomTick = draw2d.SetFigure.extend({
        init : function(){ this._super(); },
        createSet: function(){
            this.canvas.paper.setStart();
            this.canvas.paper.rect(0, 0, this.getWidth(), this.getHeight()).attr({
                stroke: 0
            });
            this.canvas.paper.image("icons/success.png", this.getWidth() - 16, -8, this.getWidth() - 24, this.getHeight() - 24);
            return this.canvas.paper.setFinish();
        }
    });
    CustomCross = draw2d.SetFigure.extend({
        init : function(){ this._super(); },
        createSet: function(){
            this.canvas.paper.setStart();
            this.canvas.paper.rect(0, 0, this.getWidth(), this.getHeight()).attr({
                stroke: 0
            });
            this.canvas.paper.image("icons/error.png", this.getWidth() - 16, -8, this.getWidth() - 24, this.getHeight() - 24);
            return this.canvas.paper.setFinish();
        }
    });
    CustomPending = draw2d.SetFigure.extend({
        init : function(){ this._super(); },
        createSet: function(){
            this.canvas.paper.setStart();
            this.canvas.paper.rect(0, 0, this.getWidth(), this.getHeight()).attr({
                stroke: 0
            });
            this.canvas.paper.image("icons/play-button.png", this.getWidth() - 16, -8, this.getWidth() - 24, this.getHeight() - 24);
            return this.canvas.paper.setFinish();
        }
    });
    CustomStop = draw2d.SetFigure.extend({
        init : function(){ this._super(); },
        createSet: function(){
            this.canvas.paper.setStart();
            this.canvas.paper.rect(0, 0, this.getWidth(), this.getHeight()).attr({
                stroke: 0
            });
            this.canvas.paper.image("icons/stop.png", this.getWidth() - 16, -8, this.getWidth() - 24, this.getHeight() - 24);
            return this.canvas.paper.setFinish();
        }
    });
}

function initWorkflowSimulation() {
    var writer = new draw2d.io.json.Writer();
    writer.marshal(canvas, function(canvas_elements) {
        for (var i=0; i<canvas_elements.length; i++) {
            if (canvas_elements[i].type == "draw2d.Connection")
                links.push(canvas_elements[i]);
            else if (canvas_elements[i].type == "draw2d.shape.basic.Oval" && typeof canvas_elements[i].type === 'object') {
                nodes.push(canvas_elements[i]);
            }
        }
        console.log(nodes);

        beginWorkflowSimulation();

        // Populate node_details
        node_details = [];
        for (var i=0; i<nodes.length; i++) {
            nodes[i].userData['id'] = nodes[i].getId();
            node_details.push(nodes[i].userData);
        }

        for (var i=0; i<CustomTracker.length; i++) { // TODO BROKEN
            canvas.remove(CustomTracker[i]);
        }
        CustomTracker = [];
        //defineCustoms();
    });
}

function execEvent() {
    return new Promise(function(resolve, reject) {
        try {
            var code = ";";

            switch (node.userData.evt) {
                case 'begin_recording':
                    resolve({
                        error: false,
                        results: null,
                        id: node.getId()
                    });
                    break;
                case 'end_recording':
                    resolve({
                        error: false,
                        results: null,
                        id: node.getId()
                    });
                    break;
                case 'mousedown':
                    code = "simulate(" +
                        constructElementIdentifier(node.userData.evt_data.path) +
                        ",'mousedown', { clientX: " +
                        node.userData.evt_data.clientX +
                        ", clientY: " +
                        node.userData.evt_data.clientY +
                        " });";
                    break;
                case 'scroll':
                    code = "$('html, body').animate({" +
                        "scrollTop: " + node.userData.evt_data.scrollTopEnd + "," +
                        "scrollLeft: " + node.userData.evt_data.scrollLeftEnd +
                        "}, " + (node.userData.evt_data.endtime-node.userData.time) + ");";
                    break;
                case 'mouseup':
                    code = "simulate(" +
                        constructElementIdentifier(node.userData.evt_data.path) +
                        ",'mouseup', { clientX: " +
                        node.userData.evt_data.clientX +
                        ", clientY: " +
                        node.userData.evt_data.clientY +
                        " });";
                    break;
                case 'mouseover':
                    if (all_settings.simulatemouseover) {
                        code = "simulate(" +
                            constructElementIdentifier(node.userData.evt_data.path) +
                            ",'mouseover', { clientX: " +
                            node.userData.evt_data.clientX +
                            ", clientY: " +
                            node.userData.evt_data.clientY +
                            " }); simulateHoverElement('" + node.userData.evt_data.csspath + "');";
                    }
                    break;
                case 'mouseout':
                    if (all_settings.simulatemouseout) {
                        code = "simulate(" +
                            constructElementIdentifier(node.userData.evt_data.path) +
                            ",'mouseout', { clientX: " +
                            node.userData.evt_data.clientX +
                            ", clientY: " +
                            node.userData.evt_data.clientY +
                            " }); stopSimulateHover();";
                    }
                    break;
                case 'click':
                    code = "$('" + node.userData.evt_data.csspath + "').click();";
                    break;
                case 'focusin':
                    code = "$('" + node.userData.evt_data.csspath + "').focus();";
                    break;
                case 'focusout':
                    code = "$('" + node.userData.evt_data.csspath + "').blur();";
                    break;
                case 'keydown':
                    code = "simulate(" +
                        constructElementIdentifier(node.userData.evt_data.path) +
                        ",'keydown', { keyCode: " +
                        node.userData.evt_data.keyCode +
                        " });";
                    break;
                case 'keyup':
                    code = "simulate(" +
                        constructElementIdentifier(node.userData.evt_data.path) +
                        ",'keyup', { keyCode: " +
                        node.userData.evt_data.keyCode +
                        " });";
                    break;
                case 'keypress':
                    code = "simulate(" +
                        constructElementIdentifier(node.userData.evt_data.path) +
                        ",'keypress', { keyCode: " +
                        node.userData.evt_data.keyCode +
                        " });";
                    break;
                case 'submit':
                    code = "simulate(" +
                        constructElementIdentifier(node.userData.evt_data.path) +
                        ",'submit', {});";
                    break;
                case 'dataentry':
                    code = "$('" + node.userData.evt_data.csspath + "').val('" +
                        node.userData.evt_data.value.replace("'", "\\'") + "');";
                    break;
                case 'input':
                    code = "$('" + node.userData.evt_data.csspath + "').val('" +
                        node.userData.evt_data.value.replace("'", "\\'") + "');";
                    /*code = "$('" + node.userData.evt_data.csspath + "').val('" +
                        node.userData.evt_data.value.replace("'", "\\'") + "');";*/
                    break;
                case 'clipboard_cut':
                    code = constructElementIdentifier(node.userData.evt_data.path) +
                                ".value = '';";
                    break;
                case 'tabchange':
                    chrome.tabs.update(new_window.tabs[0].id, {
                        url: node.userData.evt_data.url
                    });
                    resolve({
                        error: false,
                        results: null,
                        id: node.getId()
                    });
                    break;
                case 'select':
                    code = ";"; // TODO - emulate Text Select
                    break;
                default:
                    terminateSimulation(false, "Unknown event type: " + node.userData.evt); // TODO - check
                    break;
            }
        
            var frameId = 0;

            chrome.webNavigation.getAllFrames({tabId: new_window.tabs[0].id}, function (frames) {
                for (var j=0; j<frames.length; j++) {
                    if (frames[j].frameId!=0 && frames[j].url == node.userData.evt_data.url) {
                        frameId = frames[j].frameId;
                    }
                }
                
                /*eventExecutionTimeoutCounter = setTimeout(function(i){
                    simulation_log.push({
                        index: i,
                        error: true
                    });
                    terminateSimulation(false, "Event timeout");
                }, event_execution_timeout, i);*/

                code = "try { " + code + "; } catch(err) { new Object({error: err.message}); }";

                chrome.tabs.executeScript(new_window.tabs[0].id,{
                    code: code,
                    frameId: frameId,
                    matchAboutBlank: true
                }, function(results){
                    if (results && results.length==1 && results[0]!==null && !results[0].error) {
                        resolve({
                            error: false,
                            results: results,
                            id: node.getId()
                            //event: node
                        });
                    } else {
                        reject({
                            error: true,
                            results: results,
                            id: node.getId()
                            //event: node
                        });
                    }
                });
            });
        } catch(err) {
            reject({
                error: true,
                results: null,
                id: node.getId()
                //event: node
            });
        }
    });
}

function closeListenerCallbackWorkflow(closed_window_id) {
	if (closed_window_id == new_window.id) {
        var custom = new CustomStop();
        CustomTracker.push(custom);
        node.add(custom, new draw2d.layout.locator.CenterLocator(node));
		terminateSimulation(false, "Simulation terminated");
	}
}

function waitForElement(resolve, csspath, returnvar) {
    waitForElementInterval = setInterval(function(){
        chrome.tabs.executeScript(new_window.tabs[0].id,{
            code: "$('" + csspath + "').length",
            frameId: 0, // TODO - frame support
            matchAboutBlank: true
        }, function(results){
            if (results[0])
                resolve(returnvar);
        });
    }, 100);
}

function processEvent() {
    if (!terminated) {
        var custom = new CustomPending();
        CustomTracker.push(custom);
        node.add(custom, new draw2d.layout.locator.CenterLocator(node));
    }

    execEvent().then(function(result){
        // Process result
        simulation_log.push(result);

        if (node.userData.evt == "end_recording") {
            var custom = new CustomTick();
            CustomTracker.push(custom);
            node.add(custom, new draw2d.layout.locator.CenterLocator(node));
            terminateSimulation(true, "");
            return;
        }

        var nodeConnections = node.getConnections().data;
        var nodeConnectionPromises = [];

        for (var i=0; i<nodeConnections.length; i++) {
            if (node.getPorts().indexOf(nodeConnections[i].getSource()) != -1) { // ignore inbound connections
                nodeConnectionPromises.push(
                    new Promise(function(resolve, reject) {
                        if (nodeConnections[i].userData.evt == "timer") {
                            setTimeout(resolve, nodeConnections[i].userData.wait_time, nodeConnections[i]);
                        } else if (nodeConnections[i].userData.evt == "wait_for_element") {
                            waitForElement(resolve, nodeConnections[i].userData.csspath, nodeConnections[i]);
                        } else {
                            reject();
                        }
                    })
                );
            }
        }
        if (nodeConnectionPromises.length == 0) {
            var custom = new CustomTick();
            CustomTracker.push(custom);
            node.add(custom, new draw2d.layout.locator.CenterLocator(node));
            terminateSimulation(false, "No links from event");
            return;
        }

        Promise.race(nodeConnectionPromises)
        .then(function(winning_link) {
            clearInterval(waitForElementInterval);
            if (!terminated) {
                var custom = new CustomTick();
                CustomTracker.push(custom);
                node.add(custom, new draw2d.layout.locator.CenterLocator(node));
            }

            node = winning_link.getTarget().getParent();
            processEvent();
        });
    }).catch(function(result){
        // Process result
        simulation_log.push(result);

        if (node.userData.evt == "end_recording") {
            var custom = new CustomTick();
            CustomTracker.push(custom);
            node.add(custom, new draw2d.layout.locator.CenterLocator(node));
            terminateSimulation(true, "");
            return;
        }

        var nodeConnections = node.getConnections().data;
        var nodeConnectionPromises = [];

        for (var i=0; i<nodeConnections.length; i++) {
            if (node.getPorts().indexOf(nodeConnections[i].getSource()) != -1) { // ignore inbound connections
                nodeConnectionPromises.push(
                    new Promise(function(resolve, reject) {
                        if (nodeConnections[i].userData.evt == "timer") {
                            setTimeout(resolve, nodeConnections[i].userData.wait_time, nodeConnections[i]);
                        } else if (nodeConnections[i].userData.evt == "wait_for_element") {
                            waitForElement(resolve, nodeConnections[i].userData.csspath, nodeConnections[i]);
                        } else {
                            reject();
                        }
                    })
                );
            }
        }
        if (nodeConnectionPromises.length == 0) {
            var custom = new CustomCross();
            CustomTracker.push(custom);
            node.add(custom, new draw2d.layout.locator.CenterLocator(node));
            terminateSimulation(false, "No links from event");
            return;
        }

        Promise.race(nodeConnectionPromises)
        .then(function(winning_link) {
            clearInterval(waitForElementInterval);
            if (!terminated) {
                var custom = new CustomCross();
                CustomTracker.push(custom);
                node.add(custom, new draw2d.layout.locator.CenterLocator(node));
            }

            node = winning_link.getTarget().getParent();
            processEvent();
        });
    });
}

function beginWorkflowSimulation() {
    sim_start_time = Date.now();

    chrome.windows.create({
        "url":"chrome-extension://" + chrome.runtime.id + "/new.html",
        //"url":"https://wildfire.ai/",
        "focused":true,
        "left":0,
        "top":0,
        "width":1920,
        "height":1080
        //"type":"popup"
    }, function(simulation_window) {
        new_window = simulation_window;
        if (all_settings.runminimized) {
            chrome.windows.update(new_window.id, { // https://bugs.chromium.org/p/chromium/issues/detail?id=459841
                state: "minimized"
            });
        }
        
        chrome.tabs.getAllInWindow(new_window.id, function(tabs){
            for (var i=1; i<tabs.length; i++) {
                chrome.tabs.remove(tabs[i].id);
            }
        });

        timeoutObject = setTimeout(function() {
            var custom = new CustomStop();
            CustomTracker.push(custom);
            node.add(custom, new draw2d.layout.locator.CenterLocator(node));
            terminateSimulation(false, "Global run timeout"); // TODO: Check
        }, 600000); // 10 minutes
        
        chrome.windows.onRemoved.addListener(closeListenerCallbackWorkflow); // TODO: Check

        //////// START ////////
        for (var i=0; i<nodes.length; i++) {
            if (nodes[i].userData.evt == "begin_recording") {
                node = nodes[i];
                break;
            }
        }

        processEvent();
    });
}