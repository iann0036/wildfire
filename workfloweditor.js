var canvas;
var conn;
var nodes = [];
var figure;
var gridPolicy;

var link_types = [
  "timer",
  "wait_for_element",
  "wait_for_title"
]

function deleteSelection() {
  if (figure.userData && figure.userData.evt && figure.userData.evt == "begin_recording")
    return;
  if ($.inArray(figure.userData.evt,link_types)==-1)
    figure.resetPorts();
  canvas.remove(figure);
  canvas.setCurrentSelection(null);
}
$('#workflowToolbarDelete').click(function(){deleteSelection();});
$('#deleteButtonSidepanel').click(function(){deleteSelection();});

function escapeOrDefault(value, defaultval) {
  if (value) {
    if (isNaN(value))
      return value.replace(/\"/g,'&quot;');
    return value;
  }
  return defaultval;
}

function getEventOptionsHtml(userdata) {
  if (userdata.evt == "scroll") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_scrollLeftEnd\">Scroll To</label>" +
    "    <div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">x</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"scrollLeftEnd\" id=\"event_scrollLeftEnd\" value=\"" + escapeOrDefault(userdata.evt_data.scrollLeftEnd,"0") + "\">" +
    "    </div>" +
    "    <div style=\"margin-top: 2px;\" class=\"input-group\">" +
    "        <div class=\"input-group-addon\">y</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"scrollTopEnd\" id=\"event_scrollTopEnd\" value=\"" + escapeOrDefault(userdata.evt_data.scrollTopEnd,"0") + "\">" +
    "    </div><br />" +
    "    <label class=\"form-label semibold\" for=\"event_scrollTime\">Scroll Time</label>" +
    "    <div class=\"input-group\">" +
    "        <input type=\"text\" class=\"form-control\" data-event-detail=\"scrollTime\" id=\"event_scrollTime\" value=\"" + escapeOrDefault(userdata.evt_data.scrollTime/1000,"0") + "\">" +
    "        <div class=\"input-group-addon\">secs</div>" +
    "    </div>" +
    "</div>";
  } else if (userdata.evt == "click" || userdata.evt == "mouseup" || userdata.evt == "mousedown" || userdata.evt == "mouseover" || userdata.evt == "mouseout") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_x\">Position</label>" +
    "    <div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">x</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientX\" id=\"event_x\" value=\"" + escapeOrDefault(userdata.evt_data.clientX || "0") + "\">" +
    "    </div>" +
    "    <div style=\"margin-top: 2px;\" class=\"input-group\">" +
    "        <div class=\"input-group-addon\">y</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientY\" id=\"event_y\" value=\"" + escapeOrDefault(userdata.evt_data.clientY || "0") + "\">" +
    "    </div><br />" +
    "    <label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\">" +
    "</div>";
  } else if (userdata.evt == "focusin" || userdata.evt == "focusout" || userdata.evt == "submit" || userdata.evt == "select") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath.replace(/\"/g,'&quot;')|| "") + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "input" || userdata.evt == "change") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_value\">Value</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"value\" id=\"event_value\" value=\"" + escapeOrDefault(userdata.evt_data.value,"") + "\">" +
    "    <br /><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\">" +
    "</div>";
  } else if (userdata.evt == "keydown" || userdata.evt == "keyup" || userdata.evt == "keypress") {
    var chars = "";
    for (var i=48; i<127; i++) {
      if (userdata.evt_data.keyCode == i)
        chars += "      <option selected=\"selected\" value=\"" + i + "\">" + String.fromCharCode(i) + "</option>";
      else
        chars += "      <option value=\"" + i + "\">" + String.fromCharCode(i) + "</option>";
    }
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_keyCode\">Key</label>" +
    "    <select class=\"form-control event-detail\" data-event-detail=\"keyCode\" id=\"event_keyCode\">" +
    "      <option value=\"0\">&nbsp;</option>" +
    "      <option value=\"8\">Backspace</option>" +
    "      <option value=\"9\">Tab</option>" +
    "      <option value=\"13\">Enter</option>" +
    "      <option value=\"16\">Shift</option>" +
    "      <option value=\"17\">Control</option>" +
    "      <option value=\"18\">Alt</option>" +
    "      <option value=\"20\">Caps Lock</option>" +
    "      <option value=\"27\">Escape</option>" +
    "      <option value=\"32\">Space</option>" +
    "      <option value=\"33\">Page Up</option>" +
    "      <option value=\"34\">Page Down</option>" +
    "      <option value=\"35\">End</option>" +
    "      <option value=\"36\">Home</option>" +
    "      <option value=\"37\">Left Arrow</option>" +
    "      <option value=\"38\">Up Arrow</option>" +
    "      <option value=\"39\">Right Arrow</option>" +
    "      <option value=\"40\">Down Arrow</option>" +
    "      <option value=\"45\">Insert</option>" +
    "      <option value=\"46\">Delete</option>" +
    chars +
    "    </select>" +
    "    <br /><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\">" +
    "</div>";
  } else if (userdata.evt == "purgecookies") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"searchterm\">Domain Search Term</label>" +
    "    <input type=\"text\" required class=\"form-control event-detail\" data-event-detail=\"searchterm\" id=\"searchterm\" value=\"" + escapeOrDefault(userdata.evt_data.searchterm,"example.com") + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "setvar") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"var\">Variable</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"var\" id=\"var\" value=\"" + escapeOrDefault(userdata.evt_data.var,"") + "\">" +
    "    </div><div class=\"form-group\"><label class=\"form-label semibold\" for=\"expr\">Value / Expression</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"expr\" id=\"expr\" value=\"" + escapeOrDefault(userdata.evt_data.expr,"") + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "tabchange") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"url\">URL</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"url\" id=\"url\" value=\"" + escapeOrDefault(userdata.evt_data.url,"about:blank") + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "begin_recording" || userdata.evt == "end_recording" || userdata.evt == "clipboard_cut" || userdata.evt == "clipboard_copy" || userdata.evt == "clipboard_paste") {
    return "";
  } else if (userdata.evt == "setproxy") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_scheme\">Proxy Type</label>" +
    "    <select class=\"form-control event-detail\" data-event-detail=\"keyCode\" id=\"event_scheme\">" +
    "        <option value=\"http\">HTTP</option>" +
    "        <option value=\"https\">HTTPS</option>" +
    "        <option value=\"socks4\">SOCKS4</option>" +
    "        <option value=\"socks5\">SOCKS5</option>" +
    "    </select>" +
    "</div><div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_host\">Host</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"host\" id=\"event_host\" value=\"" + escapeOrDefault(userdata.evt_data.host,"") + "\">" +
    "</div><div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_port\">Port</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"port\" id=\"event_port\" value=\"" + escapeOrDefault(userdata.evt_data.port,"") + "\">" +
    "</div><div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_username\">Username</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"username\" id=\"event_username\" value=\"" + escapeOrDefault(userdata.evt_data.username,"") + "\">" +
    "</div><div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_password\">Password</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"password\" id=\"event_password\" value=\"" + escapeOrDefault(userdata.evt_data.password,"") + "\">" +
    "</div><br />";
  } else if (userdata.evt == "recaptcha") {
    return "";
  } else if (userdata.evt == "timer" || userdata.evt === undefined) {
    if (userdata.wait_time === undefined)
      userdata.wait_time = 0; // TODO probably not necessary with the escapeOrDefault
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_detail_timer\">Timer</label>" +
    "    <div class=\"input-group\">" +
    "        <input type=\"text\" class=\"form-control\" id=\"event_detail_timer\" value=\"" + escapeOrDefault(userdata.wait_time/1000,"0") + "\">" +
    "        <div class=\"input-group-addon\">secs</div>" +
    "    </div>" +
    "</div>";
  } else if (userdata.evt == "wait_for_element") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_detail_csspath\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control\" id=\"event_detail_csspath\" value=\"" + escapeOrDefault(userdata.csspath,"") + "\">" +
    "</div>";
  } else if (userdata.evt == "wait_for_title") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_detail_title\">Title</label>" +
    "    <input type=\"text\" class=\"form-control\" id=\"event_detail_title\" value=\"" + escapeOrDefault(userdata.title,"") + "\">" +
    "</div>";
  }

  console.log("Unprocessable Event Options: " + userdata.evt);

  return "<i>Event Properties Unavailable</i><br /><br />";
}

function selectedFigure(figure) {
  $('#workflowsidepanel').attr('style','');
  $('#sidePanelTypeSelect').html('');

  if ($.inArray(figure.userData.evt,link_types)==-1) {
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
    }
  } else {
    $('#sidePanelTitle').text("Link Properties");
    $('#sidePanelTypeSelect').removeAttr('disabled');
    if (figure.userData.evt == "wait_for_element")
      $('#sidePanelTypeSelect').html(
        '<option value="timer" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-timer-clock.png"/>Timer</span>\'>Timer</option>' +
        '<option selected="selected" value="wait_for_element" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/page-view.png"/>Wait For Element</span>\'>Wait For Element</option>' +
        '<option value="wait_for_title" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-title.png"/>Wait For Title</span>\'>Wait For Title</option>'
      ).selectpicker('refresh');
    else if (figure.userData.evt == "wait_for_title")
      $('#sidePanelTypeSelect').html(
        '<option value="timer" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-timer-clock.png"/>Timer</span>\'>Timer</option>' +
        '<option value="wait_for_element" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/page-view.png"/>Wait For Element</span>\'>Wait For Element</option>' +
        '<option selected="selected" value="wait_for_title" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-title.png"/>Wait For Title</span>\'>Wait For Title</option>'
      ).selectpicker('refresh');
    else if (figure.userData.evt == "timer")
      $('#sidePanelTypeSelect').html(
        '<option selected="selected" value="timer" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-timer-clock.png"/>Timer</span>\'>Timer</option>' +
        '<option value="wait_for_element" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/page-view.png"/>Wait For Element</span>\'>Wait For Element</option>' +
        '<option value="wait_for_title" data-content=\'<span class="user-item"><img style="-webkit-border-radius: 0; border-radius: 0;" src="/icons/dark-title.png"/>Wait For Title</span>\'>Wait For Title</option>'
      ).selectpicker('refresh');
  }

  // Set details call and listen for select changes
  $('#sidePanelEventDetails').html(getEventOptionsHtml(figure.userData));
  $('#sidePanelTypeSelect').change(function(){
    changeType();
  });

  setDetailListeners();
}

function changeType() {
    var userData = figure.userData;
    userData.evt = $('#sidePanelTypeSelect').val();

    if ($.inArray(userData.evt,link_types)==-1) {
      figure.resetChildren();
      figure.setBackgroundColor(mappingData[userData.evt].bgColor);
      var CustomIcon = draw2d.SetFigure.extend({
        init : function(){ this._super(); },
        createSet: function(){
            this.canvas.paper.setStart();
            this.canvas.paper.rect(0, 0, this.getWidth(), this.getHeight()).attr({
                stroke: 0
            });
            this.canvas.paper.image("icons/" + mappingData[userData.evt].icon, 12, 12, this.getWidth() - 24, this.getHeight() - 24);
            return this.canvas.paper.setFinish();
        }
      });
      figure.add(new CustomIcon(), new draw2d.layout.locator.CenterLocator(node));
    }

    if (userData.evt_data === undefined)
      userData.evt_data = {};
    figure.setUserData(userData);
    $('#sidePanelEventDetails').html(getEventOptionsHtml(figure.userData));
    setDetailListeners();
}

function setDetailListeners() {
  $('#event_detail_timer').change(function(){
    var userData = figure.userData;
    userData['wait_time'] = $('#event_detail_timer').val() * 1000;
    figure.setUserData(userData);
  });
  $('#event_detail_title').change(function(){
    var userData = figure.userData;
    userData['title'] = $('#event_detail_title').val();
    figure.setUserData(userData);
  });
  $('#event_detail_csspath').change(function(){
    var userData = figure.userData;
    userData['csspath'] = $('#event_detail_csspath').val();
    figure.setUserData(userData);
  });
  $('.event-detail').change(function(){
    var userData = figure.userData;
    userData.evt_data[$(this).attr('data-event-detail')] = $(this).val();
    figure.setUserData(userData);
  });
}

function addNode(event) {
  var bgColor = "#999999";
  if (mappingData[event.evt] !== undefined)
    bgColor = mappingData[event.evt].bgColor;
  var node = new CustomNode({ // can change Oval to Rectangle
    radius: 10,
    stroke:3,
    color: "#888888",
    resizeable: false,
    bgColor: bgColor,
    userData: event
  });
  //node.installEditPolicy(new draw2d.policy.figure.RectangleSelectionFeedbackPolicy());
  /*
  if (event.evt == "begin_recording")
    node.setDeleteable(false);
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
  });
  node.add(new CustomIcon(), new draw2d.layout.locator.CenterLocator(node));
  */
  var portConfig = {
    diameter: 7,
    bgColor: "#1E90FF"
  };
  /* Order is important */
  var rightPort = new draw2d.HybridPort(portConfig);
  rightPort.setName("Right");
  node.addPort(rightPort,new draw2d.layout.locator.RightLocator());
  var bottomPort = new draw2d.HybridPort(portConfig);
  bottomPort.setName("Bottom");
  node.addPort(bottomPort,new draw2d.layout.locator.BottomLocator());
  var leftPort = new draw2d.HybridPort(portConfig);
  leftPort.setName("Left");
  node.addPort(leftPort,new draw2d.layout.locator.LeftLocator());
  var topPort = new draw2d.HybridPort(portConfig);
  topPort.setName("Top");
  node.addPort(topPort,new draw2d.layout.locator.TopLocator());
  
  return node;
}

function deselectedFigure(figure) {
  $('#workflowsidepanel').attr('style','display: none;');
}

function exportCanvasImage() {
    canvas.setCurrentSelection(null);
    var xCoords = [];
    var yCoords = [];
    canvas.getFigures().each(function(i,f){
        var b = f.getBoundingBox();
        xCoords.push(b.x, b.x+b.w);
        yCoords.push(b.y, b.y+b.h);
    });
    var minX   = Math.min.apply(Math, xCoords) - 30;
    var minY   = Math.min.apply(Math, yCoords) - 30;
    var width  = Math.max.apply(Math, xCoords)-minX + 30;
    var height = Math.max.apply(Math, yCoords)-minY + 30;

    canvas.getAllPorts().each(function(i,p){ // hide figure ports for screenshot
        p.setVisible(false);
    });
    gridPolicy.setGrid(1); // sexy hack to make background white
    
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

        gridPolicy.setGrid(5); // reset sexy hack
    }, new draw2d.geo.Rectangle(minX,minY,width,height));
}
$('#workflowToolbarExportImage').click(function(){exportCanvasImage();});

function importJSON(json) {
  canvas.clear();
  var reader = new draw2d.io.json.Reader();
  var importedjson = JSON.parse(decrypt(json));
  reader.unmarshal(canvas, importedjson.canvas);

  nodes = [];
  for (var i=0; i<canvas.figures.data.length; i++) {
    nodes.push(canvas.figures.data[i]);
    canvas.figures.data[i].setResizeable(false);
  }

  if (canvas.figures.data.length>60)
    $('body').attr('style','background-color: #ffffff; overflow-y: scroll; overflow-x: hidden;');
  else
    $('body').attr('style','background-color: #ffffff;');

  chrome.storage.local.set({events: importedjson.events});
}

function loadFromLocalStorageOrCreateNew(eventresult) {
  chrome.storage.local.get('workflow', function (result) {
    if (result.workflow === undefined || result.workflow == null)
      createNewWorkflowFromEvents(eventresult);
    else
      importJSON(result.workflow);
  });
}

function saveToLocalStorage() {
  var writer = new draw2d.io.json.Writer();
  writer.marshal(canvas, function(json){
      var jsonTxt = JSON.stringify({
        canvas: json,
        events: events
      });
      var text = encrypt(jsonTxt);
      chrome.storage.local.set({workflow: text});
  });
}

$(window).unload(function() {
  if (simulating) {
    terminateSimulation(false, "Navigated away from simulation runner");
  }

  saveToLocalStorage();
  // TODO - stall processing time waiting for async
  return;
});

function flushWorkflow() {
  chrome.storage.local.set({workflow: null},function(){
    $(window).unbind("unload");
    location.reload();
  });
}

function exportJSON() {
  var writer = new draw2d.io.json.Writer();
  writer.marshal(canvas, function(json){
      var jsonTxt = JSON.stringify({
        canvas: json,
        events: events
      });
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

$('#workflowToolbarNew').click(function(){flushWorkflow();});
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
      userData = {
        evt: 'timer',
        condition_type: 'timer',
        wait_time: 0
      };

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

    var arrow = new CustomArrow(10,10);
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
      if (!result.events)
          result.events = [];
      /* Init Page */
      var width = window.innerWidth;
      var height = window.innerHeight-136 + Math.max(0,Math.floor((result.events.length-60)/12)*80);

      defineCustoms();

      if (result.events.length>60)
        $('body').attr('style','background-color: #ffffff; overflow-y: scroll; overflow-x: hidden;');

      $('#graph').attr('style','width: ' + width + 'px; height: ' + height + 'px; background-color: #ffffff;');
      window.addEventListener("contextmenu", function(e) { e.preventDefault(); });

      canvas = new draw2d.Canvas("graph");
      canvas.installEditPolicy( new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: connCreate
      }));
      setTimeout(function(){
        gridPolicy = new draw2d.policy.canvas.SnapToGridEditPolicy();
        gridPolicy.setGrid(5);
        gridPolicy.setGridColor("#ffffff");
        canvas.installEditPolicy( new draw2d.policy.canvas.CoronaDecorationPolicy() );
        canvas.installEditPolicy( gridPolicy );
      },100);
      
      canvas.on("select", function(emitter,event) {
        if (event.figure!==null) {
            figure = event.figure;
            selectedFigure(event.figure);
        } else {
            deselectedFigure(event.figure);
        }
      });

      loadFromLocalStorageOrCreateNew(result);

      if (window.location.hash == "#launch") {
        setTimeout(function(){
          initWorkflowSimulation();
        },200);
      }
  });
});

function createNewWorkflowFromEvents(result) {
    if (result.events.length < 1) { // only happens on fresh install
        result.events.push({
            evt: 'begin_recording',
            time: 0
        });
    }
    for (var i=0; i<result.events.length; i++) {
        var node = addNode(result.events[i]);
        var nodex = 295 + Math.min(80*(i%24), 80*12);
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
            evt: 'timer',
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
}

$('#nodeLinkPanelX').click(function(){
    $('#workflowsidepanel').attr('style','display: none;');
    // TODO: Deselect node/link
});

$('#workflowToolbarAddNode').click(function(){
    canvas.add(addNode({
      evt: 'end_recording',
      time: 0
    }), window.innerWidth/2, window.innerHeight/3);
    nodes.push(node);
});
$('#workflowToolbarInitSimulation').click(function(){
    initWorkflowSimulation();
});
$('#workflowToolbarFavorite').click(function(){
    saveToLocalStorage();
    swal({
        title: "Favorite Workflow",
        text: "Enter your workflow name:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: ""
    }, function (inputValue) {
        if (inputValue === false || inputValue.trim() === "") {
            swal.showInputError("You need to enter a workflow name");
            return false;
        }
        chrome.storage.local.get('favorites', function (result) {
            chrome.storage.local.get('workflow', function (workflow) {
                var favorites = result.favorites;
                if (!Array.isArray(favorites)) { // for safety only
                    favorites = [];
                }
                favorites.push({
                    name: inputValue.trim(),
                    workflow: workflow.workflow,
                    rightclick: true,
                    time: Date.now()
                });
                chrome.storage.local.set({favorites: favorites},function(){
                    swal({
                        title: "Done",
                        text: "Your <b>" + inputValue.trim() + "</b> workflow has been favorited.",
                        type: "success",
                        html: true
                    });
                });
            });
        });
    });
});
