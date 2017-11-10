var CustomTick, CustomCross, CustomPending, CustomStop, CustomNode, CustomArrow, CustomSection;

var myRaftLabelLocator = draw2d.layout.locator.TopLocator.extend({
    NAME: "myRaftLabelLocator",
    init: function() {
        this._super();
    },
    relocate: function(index, target) {
        var parent = target.getParent();
        var boundingBox = parent.getBoundingBox();
        var offset = (parent instanceof draw2d.Port) ? boundingBox.w/2 : 0;
  
        var targetBoundingBox = target.getBoundingBox();
        if (target instanceof draw2d.Port) {
            target.setPosition(boundingBox.w/2-offset,0);
        } else {
            //target.setPosition(boundingBox.w/2-(targetBoundingBox.w/2)-offset,-(targetBoundingBox.h+2));
            target.setPosition(0,0);
        }
    }
});

function doSuper() {
    this._super();
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
        init : function(){ this._super(); this.setUserData({isProgressFigure: true}); },
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
        init : function(){ this._super(); this.setUserData({isProgressFigure: true}); },
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
        init : function(){ this._super(); this.setUserData({isProgressFigure: true}); },
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
        init : function(){ this._super(); this.setUserData({isProgressFigure: true}); },
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
