var nodes = [];
var links = [];
var CustomTick;
var CustomCross;
var CustomPending;
var CustomStop;
var node;

var CustomTracker = [];

var CustomNode, CustomArrow, CustomSection;

var message_port = chrome.runtime.connect({name: "sim"});
send_message({action: "getstate"});
message_port.onMessage.addListener(function(msg) {
    if (msg.type == "state") {
        if (msg.state == "terminated") {
            updateNodeProcessIcon(msg.nodeid, "stop");
        }
    } else if (msg.type == "nodestatus") {
        updateNodeProcessIcon(msg.nodeid, msg.status);
    }
});

function send_message(msg) {
    try {
        message_port.postMessage(msg);
    } catch(err) {
        message_port = chrome.runtime.connect({name: "sim"});
        message_port.postMessage(msg);
    }
}

function defineCustoms() {
    CustomNode = draw2d.shape.basic.Oval.extend({
        NAME: "CustomNode",
        init: function (attr) {
            this._super(attr);

            setTimeout(function(self) { // need the timeout, some weird loss of scope issue - 31/1/16: Needed because the userData isnt set when init is called
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
        }
    });

    CustomSection = draw2d.shape.composite.Raft.extend({
        NAME: "CustomSection",
        init: function (width, height) {
            this._super(width, height);

            setTimeout(function(self) {
                self.setResizeable(true);
                if (self.userData && self.userData.section) {
                    var label = new draw2d.shape.basic.Label({
                        text: self.userData.section_name,
                        x: (window.innerWidth/2)-100,
                        y: (window.innerHeight/2)-50,
                        stroke: 0,
                        fontFamily: "'Proxima Nova',sans-serif",
                        bold: true,
                        fontSize: 14,
                        fontColor: "#888888"
                    });
                    
                    self.toBack();
                    self.add(label, new myRaftLabelLocator());
                    self.setMinWidth(label.getWidth());
                    self.setMinHeight(label.getHeight());

                    /*canvas.editPolicy.grep(function(p){
                        if(p.NAME === gridPolicy.NAME) {
                            canvas.uninstallEditPolicy( gridPolicy );
                            canvas.installEditPolicy( gridPolicy );
                        }
                    });*/
                }
            }, 1, this);
        }
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

function updateNodeProcessIcon(nodeid, status) {
    var custom, node;

    if (status == "pending") {
        custom = new CustomPending();
    } else if (status == "tick") {
        custom = new CustomTick();
    } else if (status == "cross") {
        custom = new CustomCross();
    } else if (status == "stop") {
        custom = new CustomStop();
    }
    for (var i=0; i<nodes.length; i++) {
        if (nodes[i].id == nodeid) {
            node = nodes[i];
            break;
        }
    }
    CustomTracker.push(custom);
    node.add(custom, new draw2d.layout.locator.CenterLocator(node));
}

function initWorkflowSimulation() {
    if (!events || events.length<3) { // TODO: test events?
        swal({
            title: "No events found",
            text: "You haven't recorded any actions yet!",
            type: "info",
            showCancelButton: false,
            cancelButtonClass: "btn-default",
            confirmButtonClass: "btn-info",
            confirmButtonText: "OK",
            closeOnConfirm: true
        });
        return;
    }

    defineCustoms();

    send_message({
        action: "begin_sim"
    });
}
