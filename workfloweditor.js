var canvas;
var conn;

function selectedFigure(figure) {
  $('#workflowsidepanel').attr('style','');
  $('#sidepanelContents').html(JSON.stringify([figure.id,figure.userData,figure.x,figure.y], undefined, 2));
  
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
    var minX   = Math.min.apply(Math, xCoords);
    var minY   = Math.min.apply(Math, yCoords);
    var width  = Math.max.apply(Math, xCoords)-minX;
    var height = Math.max.apply(Math, yCoords)-minY;
    console.log(canvas);
    
    var writer = new draw2d.io.png.Writer();
    writer.marshal(canvas,function(png){
      console.log(png);
    }, new draw2d.geo.Rectangle(minX,minY,width,height));
}
$('#workflowToolbarExportImage').click(function(){exportCanvasImage();});

function importJSON(json) {
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

function connCreate(sourcePort, targetPort) {
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
        userData: {some: "value"}
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
  /* Init Page */
  var width = window.innerWidth;
  var height = window.innerHeight-136;
  $('#graph').attr('style','width: ' + width + 'px; height: ' + height + 'px; background-color: #ffffff;');
  window.addEventListener("contextmenu", function(e) { e.preventDefault(); });

  canvas = new draw2d.Canvas("graph");
  canvas.installEditPolicy(  new draw2d.policy.connection.DragConnectionCreatePolicy({
    createConnection: connCreate
  }));
  canvas.on("select", function(emitter,event) {
     if (event.figure!==null) {
         selectedFigure(event.figure);
     } else {
         deselectedFigure(event.figure);
     }
 });

  var nodes = [];
  for (var i=0; i<84; i++) {
    var rect = new draw2d.shape.basic.Rectangle({
      radius: 10,
      stroke:3,
      color: "#888888",
      resizeable: false,
      bgColor: "#00B5CB"
    });
    var portConfig = {
      diameter: 7,
      bgColor: "#1E90FF"
    };
    /* Order is important */
    rect.addPort(new draw2d.HybridPort(portConfig),new draw2d.layout.locator.RightLocator());
    rect.addPort(new draw2d.HybridPort(portConfig),new draw2d.layout.locator.BottomLocator());
    rect.addPort(new draw2d.HybridPort(portConfig),new draw2d.layout.locator.LeftLocator());
    rect.addPort(new draw2d.HybridPort(portConfig),new draw2d.layout.locator.TopLocator());
    var nodex = 350 + Math.min(80*(i%24), 80*12);
    var nodey = 80 + 160*Math.floor(i/24);
    if (i%24 > 11) {
      nodey += 80;
      nodex -= 80*(i%12)+80;
    }
    canvas.add(rect, nodex, nodey);
    nodes.push(rect);
  }
  for (var i=1; i<nodes.length; i++) {
    console.log(nodes[i-1]);
    var fromPort = 0;
    var toPort = 2;
    if (i%24 > 11) {
      fromPort = 2;
      toPort = 0;
    }
    if (i%24==12)
      fromPort = 0;
    if (i%24==0)
      fromPort = 2;
    var c = connCreate(
        nodes[i-1].getHybridPort(fromPort),
        nodes[i].getHybridPort(toPort)
    );
    canvas.add(c);
  }

});

$('#nodeLinkPanelX').click(function(){
  $('#workflowsidepanel').attr('style','display: none;');
});
