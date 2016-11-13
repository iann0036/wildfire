var canvas;
var conn;
var nodes = [];

function getEventOptionsHtml(userdata) {
  if (userdata.evt == "click" || userdata.evt == "mouseup" || userdata.evt == "mousedown") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_x\">Position</label>" +
    "    <div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">x</div>" +
    "        <input type=\"text\" class=\"form-control\" id=\"event_x\" value=\"" + userdata.evt_data.clientX + "\">" +
    "    </div>" +
    "    <div style=\"margin-top: 2px;\" class=\"input-group\">" +
    "        <div class=\"input-group-addon\">y</div>" +
    "        <input type=\"text\" class=\"form-control\" id=\"event_y\" value=\"" + userdata.evt_data.clientY + "\">" +
    "    </div><br />" +
    "    <label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control\" id=\"event_css_selector\" value=\"" + userdata.evt_data.csspath + "\">" +
    "</div>";
  } else if (userdata.evt == "tabchange") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"url\">URL</label>" +
    "    <input type=\"text\" class=\"form-control\" id=\"url\" value=\"" + userdata.evt_data.url + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "begin_recording" || userdata.evt == "end_recording") {
    return "";
  } else if (userdata.evt === undefined) {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"timer\">Timer</label>" +
    "    <div class=\"input-group\">" +
    "        <input type=\"text\" class=\"form-control\" id=\"timer\" value=\"" + (userdata.wait_time/1000) + "\">" +
    "        <div class=\"input-group-addon\">secs</div>" +
    "    </div><br />" +
    "</div>";
  }

  return "<i>Event Properties Unavailable</i><br /><br />";
}

function selectedFigure(figure) {
  $('#workflowsidepanel').attr('style','');
  if (figure.userData.evt !== undefined) {
    $('#sidePanelTitle').text("Event Properties");
    $('#sidePanelTypeSelect').removeAttr('disabled');
    if (figure.userData.evt == "begin_recording") {
      $('#sidePanelTypeSelect').attr('disabled','disabled');
      $('#sidePanelTypeSelect').html(
        '<option value="begin_recording" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-runner.png"/>Begin Recording</span>\'>Begin Recording</option>'
      ).selectpicker('refresh');
      $('#sidePanelTypeSelect').attr('disabled','disabled');
    } else {
      var selecthtml = "";
      for (event in mappingData) {
        if (event != "begin_recording")
          selecthtml += '<option ';
          if (figure.userData.evt == event)
            selecthtml += 'selected="selected" ';
          selecthtml += 'value="' + event + '" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-' + mappingData[event].icon + '"/>' + mappingData[event].event_type + '</span>\'>' + mappingData[event].event_type + '</option>';
      }
      $('#sidePanelTypeSelect').html(selecthtml).selectpicker('refresh');
      $('#sidePanelEventDetails').html(getEventOptionsHtml(figure.userData));
    }
  } else {
    $('#sidePanelTitle').text("Link Properties");
    $('#sidePanelTypeSelect').removeAttr('disabled');
    $('#sidePanelTypeSelect').html(
      '<option value="timer" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-timer-clock.png"/>Timer</span>\'>Timer</option>' +
      '<option value="wait_for_element" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/page-view.png"/>Wait For Element</span>\'>Wait For Element</option>'
    ).selectpicker('refresh');
    $('#sidePanelEventDetails').html(getEventOptionsHtml(figure.userData));
  }
}

function addNode(event) {
  var bgColor = "#999999";
  if (mappingData[event.evt] !== undefined)
    bgColor = mappingData[event.evt].bgColor;
  var rect = new draw2d.shape.basic.Oval({ // can change Oval to Rectangle
    radius: 10,
    stroke:3,
    color: "#888888",
    resizeable: false,
    bgColor: bgColor,
    userData: event
  });
  var CustomIcon = draw2d.SetFigure.extend({
    init : function(){ this._super(); },
    createSet: function(){
        this.canvas.paper.setStart();
        this.canvas.paper.rect(0, 0, this.getWidth(), this.getHeight()).attr({
            stroke: 0
        });
        this.canvas.paper.image("icons/" + mappingData[event.evt].icon, 12, 12, this.getWidth() - 24, this.getHeight() - 24);
        return this.canvas.paper.setFinish();
    }
  })
  rect.add(new CustomIcon(), new draw2d.layout.locator.CenterLocator(rect));
  var portConfig = {
    diameter: 7,
    bgColor: "#1E90FF"
  };
  /* Order is important */
  rect.addPort(new draw2d.HybridPort(portConfig),new draw2d.layout.locator.RightLocator());
  rect.addPort(new draw2d.HybridPort(portConfig),new draw2d.layout.locator.BottomLocator());
  rect.addPort(new draw2d.HybridPort(portConfig),new draw2d.layout.locator.LeftLocator());
  rect.addPort(new draw2d.HybridPort(portConfig),new draw2d.layout.locator.TopLocator());
  
  return rect;
}

function deselectedFigure(figure) {
  $('#workflowsidepanel').attr('style','display: none;');
}

function exportCanvasImage() {
    var xCoords = [];
    var yCoords = [];
    canvas.getFigures().each(function(i,f){
        var b = f.getBoundingBox();
        xCoords.push(b.x, b.x+b.w);
        yCoords.push(b.y, b.y+b.h);
    });
    var minX   = Math.min.apply(Math, xCoords) - 10;
    var minY   = Math.min.apply(Math, yCoords) - 10;
    var width  = Math.max.apply(Math, xCoords)-minX + 10;
    var height = Math.max.apply(Math, yCoords)-minY + 10;
    console.log(canvas);
    
    var writer = new draw2d.io.png.Writer();
    writer.marshal(canvas,function(png){
      var filename = "WildfireWorkflowImage_" + Math.floor(Date.now() / 1000) + ".png";

      var element = document.createElement('a');
      element.setAttribute('href', png);
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, new draw2d.geo.Rectangle(minX,minY,width,height));
}
$('#workflowToolbarExportImage').click(function(){exportCanvasImage();});

function importJSON(json) {
  canvas.clear();
  var reader = new draw2d.io.json.Reader();
  reader.unmarshal(canvas, decrypt(json));
}

function exportJSON() {
  var writer = new draw2d.io.json.Writer();
  writer.marshal(canvas, function(json){
      var jsonTxt = JSON.stringify(json);
      var text = encrypt(jsonTxt);
      var filename = "WildfireSimulationExport_" + Math.floor(Date.now() / 1000) + ".wfsim";

      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  });
}

$('#workflowToolbarNew').click(function(){location.reload();});
$('#workflowToolbarSave').click(function(){exportJSON();});
$('#workflowToolbarImport').click(function() {
    $('#simfileContainer').click();
});
$('#simfileContainer').bind('change', function() {
    var reader = new FileReader();

    reader.onload = function(e) {
        importJSON(e.target.result);
        chrome.notifications.create("",{
            type: "basic",
            title: "Wildfire",
            message: "Simulation Imported",
            iconUrl: "icon-128.png"
        });
    }

    var file = document.getElementById('simfileContainer').files[0];
    reader.readAsText(file);
});

function connCreate(sourcePort, targetPort, userData) {
    if (userData === undefined)
      userData = {};

    var router = new draw2d.layout.connection.ManhattanBridgedConnectionRouter();
    conn = new draw2d.Connection({
        router: router,
        outlineStroke: 0,
        outlineColor: "#303030",
        stroke: 4,
        color: "#888888",
        radius: 8,
        source: sourcePort,
        target: targetPort,
        userData: userData
    });
    var arrow = new draw2d.decoration.connection.ArrowDecorator(10,10);
    arrow.setBackgroundColor("#888888");
    arrow.setColor("#303030");
    conn.setTargetDecorator(arrow);
    conn.on("dragEnter", function(emitter, event){
        conn.attr({outlineColor:"#30ff30"});
    });
    conn.on("dragLeave", function(emitter, event){
        conn.attr({outlineColor:"#303030"});
    });

    return conn;
}

$(window).load(function () {

  chrome.storage.local.get('events', function (result) {
      /* Init Page */
      var width = window.innerWidth;
      var height = window.innerHeight-136 + Math.max(0,Math.floor((result.events.length-60)/12)*80);

      if (result.events.length>60)
        $('body').attr('style','overflow-y: scroll; overflow-x: hidden;');

      $('#graph').attr('style','width: ' + width + 'px; height: ' + height + 'px; background-color: #ffffff;');
      window.addEventListener("contextmenu", function(e) { e.preventDefault(); });

      canvas = new draw2d.Canvas("graph");
      canvas.installEditPolicy( new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: connCreate
      }));
      canvas.installEditPolicy( new draw2d.policy.canvas.CoronaDecorationPolicy());
      
      canvas.on("select", function(emitter,event) {
        if (event.figure!==null) {
            selectedFigure(event.figure);
        } else {
            deselectedFigure(event.figure);
        }
      });

      for (var i=0; i<result.events.length; i++) {
        var node = addNode(result.events[i]);
        var nodex = 296 + Math.min(80*(i%24), 80*12);
        var nodey = 80 + 160*Math.floor(i/24);
        if (i%24 > 11) {
          nodey += 80;
          nodex -= 80*(i%12)+80;
        }
        canvas.add(node, nodex, nodey);
        nodes.push(node);
      }
      for (var i=1; i<nodes.length; i++) {
        var fromPort = 0;
        var toPort = 2;
        if (i%24 > 11) {
          fromPort = 2;
          toPort = 0;
        }
        if (i%24==12) {
          fromPort = 1;
          toPort = 3;
        }
        if (i%24==0) {
          fromPort = 1;
          toPort = 3;
        }
        var userData = {
          condition_type: 'timer',
          wait_time: result.events[i].time - result.events[i-1].time
        };
        var c = connCreate(
            nodes[i-1].getHybridPort(fromPort),
            nodes[i].getHybridPort(toPort),
            userData
        );
        canvas.add(c);
      }
  });
});

$('#nodeLinkPanelX').click(function(){
  $('#workflowsidepanel').attr('style','display: none;');
  // TODO: Deselect node/link
});

$('#workflowToolbarAddNode').click(function(){
  canvas.add(addNode({
    evt: 'end_recording'
  }), window.innerWidth/2, window.innerHeight/3);
  nodes.push(node);
});