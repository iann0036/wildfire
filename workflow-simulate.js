var nodes = [];
var links = [];
var CustomTick;
var CustomCross;
var CustomPending;
var CustomStop;
var node;

var waitForElementInterval, waitForTitleInterval;
var CustomTracker = [];

var CustomNode, CustomArrow;

function defineCustoms() {
    CustomNode = draw2d.shape.basic.Oval.extend({
        NAME: "CustomNode",
        init: function (attr) {
            this._super(attr);

            setTimeout(function(self) { // need the timeout, some weird loss of scope issue
                var event = self.userData.evt;

                if (event == "begin_recording")
                    self.setDeleteable(false);
                var CustomIcon = draw2d.SetFigure.extend({
                    init : function(){ this._super(); },
                    createSet: function(){
                        this.canvas.paper.setStart();
                        this.canvas.paper.rect(0, 0, this.getWidth(), this.getHeight()).attr({
                            stroke: 0
                        });
                        this.canvas.paper.image("icons/" + mappingData[event].icon, 12, 12, this.getWidth() - 24, this.getHeight() - 24);
                        return this.canvas.paper.setFinish();
                    }
                });
                self.add(new CustomIcon(), new draw2d.layout.locator.CenterLocator(node));
            }, 1, this);
        }/*,
        getPersistentAttributes: function () {
            var memento = this._super();

            memento.labels = [];
            memento.ports = [];

            this.getPorts().each(function(i,port){
                memento.ports.push({
                name   : port.getName(),
                port   : port.NAME,
                locator: port.getLocator().NAME
                });
            });

            this.children.each(function (i, e) {
                memento.labels.push({
                    id: e.figure.getId(),
                    label: e.figure.getText(),
                    locator: e.locator.NAME
                });
            });
            return memento;
        },
        setPersistentAttributes: function (memento) {
            this._super(memento);

            this.resetChildren();

            if(typeof memento.ports !=="undefined"){
                this.resetPorts();
                $.each(memento.ports, $.proxy(function(i,e){
                    var port    =  eval("new "+e.port+"()");
                    var locator =  eval("new "+e.locator+"()");
                    this.add(port, locator);
                    port.setName(e.name);
                },this));
            }

            $.each(memento.labels, $.proxy(function (i, e) {
                var label = new draw2d.shape.basic.Label(e.label);
                var locator = eval("new " + e.locator + "()");
                locator.setParent(this);
                this.add(label, locator);
            }, this));
        }*/
    });

    CustomArrow = draw2d.decoration.connection.ArrowDecorator.extend({
        NAME: "CustomArrow",
        init: function (width, height) {
            this._super(10, 10);

            this.color = new draw2d.util.Color("#303030");
            this.backgroundColor = new draw2d.util.Color("#888888");
        }
    });

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
        
        defineCustoms();

        beginWorkflowSimulation();
    });
}

function runCode(code) {
    return runCodeFrameURLPrefix(code, null);
}

function runCodeFrameURLPrefix(code, urlprefix) {
    return new Promise(function(resolve, reject) {
        if (code == "" || code == ";" || code == ";;") {
            resolve({
                error: false,
                results: null,
                id: node.getId(),
                time: Date.now()
                //event: node
            });
        }

        try {
            var frameId = 0;

            var activeTab = 0;
            chrome.tabs.getAllInWindow(new_window.id, function(tabs){
                for (var i=0; i<tabs.length; i++) {
                    if (tabs[i].active)
                        activeTab = i;
                }

                chrome.webNavigation.getAllFrames({tabId: tabs[activeTab].id}, function (frames) {
                    for (var j=0; j<frames.length; j++) {
                        if (urlprefix != null && frames[j].frameId!=0 && frames[j].url.startsWith(urlprefix)) {
                            frameId = frames[j].frameId;
                            break;
                        } else if (frames[j].frameId!=0 && frames[j].url == node.userData.evt_data.url) {
                            frameId = frames[j].frameId;
                            break;
                        }
                    }
                    
                    /*eventExecutionTimeoutCounter = setTimeout(function(i){
                        simulation_log.push({
                            index: i,
                            error: true
                        });
                        terminateSimulation(false, "Event timeout");
                    }, event_execution_timeout, i);*/

                    code = "try { " + code + "; } catch(err) { new Object({error: err.message, errorstack: err.stack}); }";

                    chrome.tabs.executeScript(tabs[activeTab].id,{
                        code: code,
                        frameId: frameId,
                        matchAboutBlank: true
                    }, function(results){
                        if (results && results.length==1 && results[0]!==null && !results[0].error) {
                            resolve({
                                error: false,
                                results: results,
                                id: node.getId(),
                                time: Date.now()
                                //event: node
                            });
                        } else {
                            reject({
                                error: true,
                                results: results,
                                id: node.getId(),
                                time: Date.now()
                                //event: node
                            });
                        }
                    });
                });
            });
        } catch(err) {
            reject({
                error: true,
                results: null,
                id: node.getId(),
                time: Date.now()
                //event: node
            });
        }
    });
}

function execEvent() {
    var code = ";";

    switch (node.userData.evt) {
        case 'begin_recording':
            return new Promise(function(resolve, reject) {
                resolve({
                    error: false,
                    results: null,
                    id: node.getId(),
                    time: Date.now()
                });
            });
        case 'end_recording':
            return new Promise(function(resolve, reject) {
                resolve({
                    error: false,
                    results: null,
                    id: node.getId(),
                    time: Date.now()
                });
            });
        case 'mousedown':
            if (all_settings.simulatemousedown) {
            code = "simulate(" +
                "$('" + node.userData.evt_data.csspath + "')[0]" +
                ",'mousedown', { clientX: " +
                node.userData.evt_data.clientX +
                ", clientY: " +
                node.userData.evt_data.clientY +
                " });";
            }
            break;
        case 'scroll':
            if (all_settings.simulatescroll) {
            code = "$('html, body').animate({" +
                "scrollTop: " + node.userData.evt_data.scrollTopEnd + "," +
                "scrollLeft: " + node.userData.evt_data.scrollLeftEnd +
                "}, " + (node.userData.evt_data.scrollTime || 0.1) + ");";
            }
            break;
        case 'mouseup':
            if (all_settings.simulatemouseup) {
            code = "simulate(" +
                "$('" + node.userData.evt_data.csspath + "')[0]" +
                ",'mouseup', { clientX: " +
                node.userData.evt_data.clientX +
                ", clientY: " +
                node.userData.evt_data.clientY +
                " });";
            }
            break;
        case 'mouseover':
            if (all_settings.simulatemouseover) {
                code = "simulate(" +
                    "$('" + node.userData.evt_data.csspath + "')[0]" +
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
                    "$('" + node.userData.evt_data.csspath + "')[0]" +
                    ",'mouseout', { clientX: " +
                    node.userData.evt_data.clientX +
                    ", clientY: " +
                    node.userData.evt_data.clientY +
                    " }); stopSimulateHover();";
            }
            break;
        case 'click':
            if (all_settings.simulateclick) {
            code = "$('" + node.userData.evt_data.csspath + "').click();";
            }
            break;
        case 'focusin':
            if (all_settings.simulatefocusin) {
            code = "$('" + node.userData.evt_data.csspath + "').focus();";
            }
            break;
        case 'focusout':
            if (all_settings.simulatefocusout) {
            code = "$('" + node.userData.evt_data.csspath + "').blur();";
            }
            break;
        case 'keydown':
            if (all_settings.simulatekeydown) {
            code = "simulate(" +
                "$('" + node.userData.evt_data.csspath + "')[0]" +
                ",'keydown', { keyCode: " +
                node.userData.evt_data.keyCode +
                " });";
            }
            break;
        case 'keyup':
            if (all_settings.simulatekeyup) {
            code = "simulate(" +
                "$('" + node.userData.evt_data.csspath + "')[0]" +
                ",'keyup', { keyCode: " +
                node.userData.evt_data.keyCode +
                " });";
            }
            break;
        case 'keypress':
            if (all_settings.simulatekeypress) {
            code = "simulate(" +
                "$('" + node.userData.evt_data.csspath + "')[0]" +
                ",'keypress', { keyCode: " +
                node.userData.evt_data.keyCode +
                " });";
            }
            break;
        case 'submit':
            code = "simulate(" +
                "$('" + node.userData.evt_data.csspath + "')[0]" +
                ",'submit', {});";
            break;
        case 'dataentry':
            code = "$('" + node.userData.evt_data.csspath + "').val('" +
                node.userData.evt_data.value.replace("'", "\\'") + "');";
            break;
        case 'change':
            if (all_settings.simulatechange) {
            code = "$('" + node.userData.evt_data.csspath + "').val('" +
                node.userData.evt_data.value.replace("'", "\\'") + "');";
            }
            break;
        case 'input':
            if (all_settings.simulateinput) {
            code = "$('" + node.userData.evt_data.csspath + "').val('" +
                node.userData.evt_data.value.replace("'", "\\'") + "');";
            /*code = "$('" + node.userData.evt_data.csspath + "').val('" +
                node.userData.evt_data.value.replace("'", "\\'") + "');";*/
            }
            break;
        case 'clipboard_cut':
            code = "$('" + node.userData.evt_data.csspath + "')[0]" +
                        ".value = '';";
            break;
        case 'purgecookies':
            return new Promise(function(resolve, reject) {
                chrome.cookies.getAll({}, function(cookies){
                    var cookiepurgeresults = [];
                    for (var i=0; i<cookies.length; i++) {
                        if (cookies[i].domain.includes(node.userData.evt_data.searchterm)) {
                            var domain = cookies[i].domain;
                            if (domain[0] == ".")
                                domain = domain.substring(0);
                            cookiepurgeresults.push(domain);
                            domain = "https://" + domain;
                            chrome.cookies.remove({url: domain, name: cookies[i].name});
                        }
                    }

                    var cookieresults = "No cookies found for the search term provided";
                    if (cookiepurgeresults.length > 0) {
                        var uniqueDomains = cookiepurgeresults.filter(function(item, pos) {
                            return cookiepurgeresults.indexOf(item) == pos;
                        })
                        cookieresults = "Domains purged: " + uniqueDomains.join(", ");
                    }
                    
                    resolve({
                        error: (cookiepurgeresults.length > 0) ? true : false,
                        results: [cookieresults],
                        id: node.getId(),
                        time: Date.now()
                    });
                });
            });
        case 'tabchange':
            return new Promise(function(resolve, reject) {
                var activeTab = 0;
                chrome.tabs.getAllInWindow(new_window.id, function(tabs){
                    for (var i=0; i<tabs.length; i++) {
                        if (tabs[i].active)
                            activeTab = i;
                    }
                    chrome.tabs.update(tabs[activeTab].id, {
                        url: node.userData.evt_data.url
                    });
                    
                    resolve({
                        error: false,
                        results: null,
                        id: node.getId(),
                        time: Date.now()
                    });
                });
            });
        case 'select':
            if (all_settings.simulateselect) {
            code = "$('" + node.userData.evt_data.csspath + "').select();";
            }
            break;
        case 'setproxy':
            return new Promise(function(resolve, reject) {
                chrome.storage.local.set({proxy: {
                    username: node.userData.evt_data.username,
                    password: node.userData.evt_data.password,
                    scheme: node.userData.evt_data.scheme,
                    host: node.userData.evt_data.host,
                    port: node.userData.evt_data.port,
                    ignore: [],
                    clear: false
                }},function(){
                    resolve({
                        error: false,
                        results: null,
                        id: node.getId(),
                        time: Date.now()
                    });
                });
            });
        case 'recaptcha':
            return new Promise(function(resolve, reject) {
                code = 'if ($(".g-recaptcha").length > 0) { var sitekey = $(".g-recaptcha").attr("data-sitekey"); var url = location.host; sitekey; } else { throw "NOCAPTCHAFOUND"; }';
                runCode(code).then(function(result){
                    var sitekey = result.results[0];
                    runCode("location.host").then(function(result) {
                        $.ajax({
                            method: "POST",
                            url: "https://api.wildfire.ai/v1/premium-recaptcha",
                            data: sitekey + "," + result.results[0] + "," + all_settings.cloudapikey || ""
                        }).always(function(resp) {
                            runCode("$('#g-recaptcha-response').html('" + resp.responseText + "');").then(function(result){
                            var runcode = "var script = document.createElement('script');\
                                script.setAttribute(\"type\", \"application/javascript\");\
                                script.textContent = \"eval($('.g-recaptcha').attr('data-callback') + '(\\\"" + resp.responseText + "\\\")');\";\
                                document.documentElement.appendChild(script);\
                                document.documentElement.removeChild(script);";
                            runCode(runcode).then(function(result){
                                resolve({
                                    error: false,
                                    results: [resp.responseText],
                                    id: node.getId(),
                                    time: Date.now()
                                });
                            });
                            });
                        });
                    });
                }).catch(function(result){
                    reject({
                        error: true,
                        results: null,
                        id: node.getId(),
                        time: Date.now()
                    });
                });
            });
        default:
            terminateSimulation(false, "Unknown event type: " + node.userData.evt); // TODO - check
            break;
    }
        
    return runCode(code);
}

function waitForTitle(resolve, expected_title, returnvar) {
    waitForTitleInterval = setInterval(function(){
        var activeTab = 0;
        chrome.tabs.getAllInWindow(new_window.id, function(tabs){
            for (var i=0; i<tabs.length; i++) {
                if (tabs[i].active)
                    activeTab = i;
            }
            chrome.tabs.executeScript(tabs[activeTab].id,{
                code: "document.title",
                frameId: 0, // TODO - frame support
                matchAboutBlank: true
            }, function(results){
                if (results[0] && results[0]==expected_title)
                    resolve(returnvar);
            });
        });
    }, 100);
}

function waitForElement(resolve, csspath, returnvar) {
    waitForElementInterval = setInterval(function(){
        var activeTab = 0;
        chrome.tabs.getAllInWindow(new_window.id, function(tabs){
            for (var i=0; i<tabs.length; i++) {
                if (tabs[i].active)
                    activeTab = i;
            }
            chrome.tabs.executeScript(tabs[activeTab].id,{
                code: "$('" + csspath + "').length",
                frameId: 0, // TODO - frame support
                matchAboutBlank: true
            }, function(results){
                if (results[0])
                    resolve(returnvar);
            });
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
                        } else if (nodeConnections[i].userData.evt == "wait_for_title") {
                            waitForTitle(resolve, nodeConnections[i].userData.title, nodeConnections[i]);
                        } else {
                            reject();
                        }
                    })
                );
            }
        }
        if (nodeConnectionPromises.length == 0) {
            //node.setBackgroundColor("#000000");
            var custom = new CustomTick();
            CustomTracker.push(custom);
            node.add(custom, new draw2d.layout.locator.CenterLocator(node));
            terminateSimulation(false, "No links from event");
            return;
        }

        Promise.race(nodeConnectionPromises)
        .then(function(winning_link) {
            clearInterval(waitForElementInterval);
            clearInterval(waitForTitleInterval);
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
                        } else if (nodeConnections[i].userData.evt == "wait_for_title") {
                            waitForTitle(resolve, nodeConnections[i].userData.title, nodeConnections[i]);
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
            clearInterval(waitForTitleInterval);
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
    terminated = false;

    chrome.windows.getCurrent(null, function(wildfirewindow){
        chrome.windows.create({
            "url":"chrome-extension://" + chrome.runtime.id + "/new.html",
            "focused":true,
            "left":0,
            "top":0,
            "width":1920,
            "height":1080
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

            // Bring the wildfire window to the foreground
            chrome.windows.update(wildfirewindow.id,{"focused":true});

            timeoutObject = setTimeout(function() {
                var custom = new CustomStop();
                CustomTracker.push(custom);
                node.add(custom, new draw2d.layout.locator.CenterLocator(node));
                terminateSimulation(false, "Global run timeout"); // TODO: Check
            }, 3600000); // 1 hour
            
            chrome.windows.onRemoved.addListener(closeListenerCallbackWorkflow); // TODO: Check

            //////// START ////////
            for (var i=0; i<nodes.length; i++) {
                if (nodes[i].userData.evt == "begin_recording") {
                    node = nodes[i];
                    break;
                }
            }

            setTimeout(function(){ // allow time for simulation window to open
                processEvent();
            }, 1000);
        });
    });
}