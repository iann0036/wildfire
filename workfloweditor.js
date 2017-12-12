var canvas;
var conn;
var nodes = [];
var node;
var links = [];
var figure;
var gridPolicy;
var delayedResizeCounter;
var CustomTracker = [];

var link_types = [
  "timer",
  "wait_for_element",
  "wait_for_title",
  "test_expression",
  "wait_for_time"
];

function deleteSelection() {
  if (figure.userData && figure.userData.evt && figure.userData.evt == "begin_recording")
    return;
  
  canvas.getCommandStack().startTransaction('delete_multiple');
  var selection = canvas.getSelection();
  selection.each(function(i, o) {
    var command = new draw2d.command.CommandDelete(o);
    canvas.getCommandStack().execute(command);
  });
  canvas.getCommandStack().commitTransaction();
  canvas.getCommandStack().undostack.pop();
  $('#workflowToolbarUndo').attr('disabled','');

  /*if ($.inArray(figure.userData.evt,link_types)==-1)
    figure.resetPorts();
  canvas.remove(figure);*/
  canvas.setCurrentSelection(null);
}
$('#workflowToolbarDelete').click(function(){
    deleteSelection();
});
$('#deleteButtonSidepanel').click(function(){deleteSelection();});

function escapeOrDefault(value, defaultval) {
  if (value || value === "") {
    if (isNaN(value))
      return value.replace(/\"/g,'&quot;').replace(/\\/g,'\\\\');
    return value;
  }
  return defaultval;
}

function getEventOptionsHtml(userdata) {
  if (userdata.section) {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"section_name\">Section Name</label>" +
    "    <input type=\"text\" class=\"form-control\" id=\"section_name\" value=\"" + escapeOrDefault(userdata.section_name.replace(/\"/g,'&quot;'),"") + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "scroll") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_scrollLeftEnd\">Scroll To</label>" +
    "    <div class=\"row\"><div class=\"col-sm-6\" style=\"padding-right: 5px;\"><div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">x</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientX\" id=\"event_x\" value=\"" + escapeOrDefault(userdata.evt_data.clientX || "0") + "\">" +
    "    </div></div>" +
    "    <div class=\"col-sm-6\" style=\"padding-left: 5px;\"><div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">y</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientY\" id=\"event_y\" value=\"" + escapeOrDefault(userdata.evt_data.clientY || "0") + "\">" +
    "    </div></div></div><br />" +
    "    <label class=\"form-label semibold\" for=\"event_scrollTime\">Scroll Time</label>" +
    "    <div class=\"input-group\">" +
    "        <input type=\"text\" class=\"form-control\" id=\"event_scrollTime\" value=\"" + escapeOrDefault(userdata.evt_data.scrollTime/1000,"0") + "\">" +
    "        <div class=\"input-group-addon\">secs</div>" +
    "    </div>" +
    "</div>";
  } else if (userdata.evt == "click") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_x\">Position</label>" +
    "    <div class=\"row\"><div class=\"col-sm-6\" style=\"padding-right: 5px;\"><div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">x</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientX\" id=\"event_x\" value=\"" + escapeOrDefault(userdata.evt_data.clientX || "0") + "\">" +
    "    </div></div>" +
    "    <div class=\"col-sm-6\" style=\"padding-left: 5px;\"><div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">y</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientY\" id=\"event_y\" value=\"" + escapeOrDefault(userdata.evt_data.clientY || "0") + "\">" +
    "    </div></div></div><br />" +
    "    <label class=\"form-label semibold\" for=\"event_downloadlinks\">Options</label>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_downloadlinks\">" +
		"      <label for=\"event_downloadlinks\">Download Links</label>" +
	  "    </div>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_middlebutton\">" +
		"      <label for=\"event_middlebutton\">Use Middle Mouse Button</label>" +
	  "    </div>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useDirectInput\">" +
		"      <label for=\"event_useDirectInput\">Use Direct Input</label>" +
    "    </div>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useOSInput\">" +
		"      <label for=\"event_useOSInput\">Use Desktop Automation</label>" +
    "    </div>" +
    "    <br /><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\">" +
    "</div>";
  } else if (userdata.evt == "mouseup" || userdata.evt == "mousedown") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_x\">Position</label>" +
    "    <div class=\"row\"><div class=\"col-sm-6\" style=\"padding-right: 5px;\"><div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">x</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientX\" id=\"event_x\" value=\"" + escapeOrDefault(userdata.evt_data.clientX || "0") + "\">" +
    "    </div></div>" +
    "    <div class=\"col-sm-6\" style=\"padding-left: 5px;\"><div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">y</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientY\" id=\"event_y\" value=\"" + escapeOrDefault(userdata.evt_data.clientY || "0") + "\">" +
    "    </div></div></div><br />" +
    "    <label class=\"form-label semibold\" for=\"event_middlebutton\">Options</label>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_middlebutton\">" +
		"      <label for=\"event_middlebutton\">Use Middle Mouse Button</label>" +
	  "    </div>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useDirectInput\">" +
		"      <label for=\"event_useDirectInput\">Use Direct Input</label>" +
    "   </div>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useOSInput\">" +
		"      <label for=\"event_useOSInput\">Use Desktop Automation</label>" +
    "    </div>" +
    "    <br /><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\">" +
    "</div>";
  } else if (userdata.evt == "mouseover" || userdata.evt == "mouseout") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_x\">Position</label>" +
    "    <div class=\"row\"><div class=\"col-sm-6\" style=\"padding-right: 5px;\"><div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">x</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientX\" id=\"event_x\" value=\"" + escapeOrDefault(userdata.evt_data.clientX || "0") + "\">" +
    "    </div></div>" +
    "    <div class=\"col-sm-6\" style=\"padding-left: 5px;\"><div class=\"input-group\">" +
    "        <div class=\"input-group-addon\">y</div>" +
    "        <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"clientY\" id=\"event_y\" value=\"" + escapeOrDefault(userdata.evt_data.clientY || "0") + "\">" +
    "    </div></div></div><br />" +
    "    <br /><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\">" +
    "</div>";
  } else if (userdata.evt == "focusin" || userdata.evt == "focusout" || userdata.evt == "submit" || userdata.evt == "select") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "input") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_value\">Value</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"value\" id=\"event_value\" value=\"" + escapeOrDefault(userdata.evt_data.value,"") + "\">" +
    "    <br /><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\"><br />" +
    "    <label class=\"form-label semibold\" for=\"event_useDirectInput\">Options</label>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useDirectInput\">" +
    "      <label for=\"event_useDirectInput\">Use Direct Input</label>" +
    "    </div>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useOSInput\">" +
    "      <label for=\"event_useOSInput\">Use Desktop Automation</label>" +
    "    </div>" +
    "</div>";
  } else if (userdata.evt == "change") {
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
    "    <select class=\"form-control\" id=\"event_keyCode\">" +
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
    "      <option value=\"91\">Windows / Command</option>" +
    chars +
    "      <option value=\"186\">;</option>" +
    "      <option value=\"187\">=</option>" +
    "      <option value=\"188\">,</option>" +
    "      <option value=\"189\">-</option>" +
    "      <option value=\"190\">.</option>" +
    "      <option value=\"191\">/</option>" +
    "      <option value=\"192\">`</option>" +
    "      <option value=\"219\">[</option>" +
    "      <option value=\"220\">\\</option>" +
    "      <option value=\"221\">]</option>" +
    "      <option value=\"222\">'</option>" +
    "    </select>" +
    "    <br /><label class=\"form-label semibold\" for=\"event_css_selector\">CSS Selector</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"csspath\" id=\"event_css_selector\" value=\"" + escapeOrDefault(userdata.evt_data.csspath,"") + "\"><br />" +
    "    <label class=\"form-label semibold\" for=\"event_useDirectInput\">Options</label>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useDirectInput\">" +
		"      <label for=\"event_useDirectInput\">Use Direct Input</label>" +
	  "    </div>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useOSInput\">" +
		"      <label for=\"event_useOSInput\">Use Desktop Automation</label>" +
    "    </div>" +
    "</div>";
  } else if (userdata.evt == "customjs") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"code\">Code</label>" +
    "    <textarea rows=\"8\" style=\"resize: none;white-space: nowrap;\" required class=\"form-control event-detail\" data-event-detail=\"code\" id=\"code\">" + escapeOrDefault(userdata.evt_data.code,"") + "</textarea>" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "purgecookies") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"searchterm\">Domain Search Term</label>" +
    "    <input type=\"text\" required class=\"form-control event-detail\" data-event-detail=\"searchterm\" id=\"searchterm\" value=\"" + escapeOrDefault(userdata.evt_data.searchterm,"example.com") + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "ocr") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"ocrsearchterm\">Search Term</label>" +
    "    <input type=\"text\" required class=\"form-control event-detail\" data-event-detail=\"ocrsearchterm\" id=\"ocrsearchterm\" value=\"" + escapeOrDefault(userdata.evt_data.ocrsearchterm,"") + "\">" +
    "    <br />" +
    "    <label class=\"form-label semibold\" for=\"event_useFuzzyMatch\">Options</label>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useFuzzyMatch\">" +
		"      <label for=\"event_useFuzzyMatch\">Use Fuzzy Matching</label>" +
    "    </div>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useOSInput\">" +
		"      <label for=\"event_useOSInput\">Use Desktop Automation</label>" +
	  "    </div>" +
    "</div>";
  } else if (userdata.evt == "subimage") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"subimg\">Search Image</label>" +
    (userdata.evt_data.subimgfile ? "    <div id=\"subimg-files\"><img style=\"max-width: 100%; max-height: 200px;\" src=\"" + userdata.evt_data.subimgresults + "\" /><br /><small><a id=\"clearSubimg\">Clear</a></small><br /></div><div style=\"display: none;\" id=\"subimg-drop-zone\"><span class=\"btn btn-file\"><span><i class=\"fa fa-upload\"></i> Choose Image</span><input id=\"event_subimgfile\" type=\"file\" name=\"event_subimgfile[]\"></span></div>" : "    <div id=\"subimg-files\"></div><div id=\"subimg-drop-zone\"><span class=\"btn btn-file\"><span><i class=\"fa fa-upload\"></i> Choose Image</span><input id=\"event_subimgfile\" type=\"file\" name=\"event_subimgfile[]\"></span></div>") +
    "    </div>" + 
    "    <label class=\"form-label semibold\" for=\"colorvariance\">Color Variance</label>" +
    "    <input type=\"text\" required class=\"form-control event-detail\" data-event-detail=\"colorvariance\" id=\"colorvariance\" value=\"" + escapeOrDefault(userdata.evt_data.colorvariance,"10") + "\">" +
    "    <br />" +
    "    <label class=\"form-label semibold\" for=\"event_useOSInput\">Options</label>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useOSInput\">" +
		"      <label for=\"event_useOSInput\">Use Desktop Automation</label>" +
    "    </div>" +
    "</div>";
  } else if (userdata.evt == "screenshot") {
    return "    <label class=\"form-label semibold\" for=\"event_useOSInput\">Options</label>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_useOSInput\">" +
		"      <label for=\"event_useOSInput\">Use Desktop Automation</label>" +
    "    </div>" +
    "</div>";
  } else if (userdata.evt == "setvar") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"var\">Variable</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"var\" id=\"var\" value=\"" + escapeOrDefault(userdata.evt_data.var,"") + "\">" +
    "    </div><div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_usage\">Value Type</label>" +
    "    <select class=\"form-control event-detail\" data-event-detail=\"usage\" id=\"event_usage\">" +
    "        <option value=\"expression\">Expression</option>" +
    "        <option value=\"innertext\">Element Text</option>" +
    "        <option value=\"attrval\">Element Value</option>" +
    "        <option value=\"outerhtml\">Element HTML</option>" +
    "        <option value=\"elemattr\">Element Attribute</option>" +
    "        <option value=\"urlparam\">URL Parameter</option>" +
    "        <option value=\"title\">Document Title</option>" +
    "        <option value=\"url\">Document URL</option>" +
    "    </select>" +
    "    </div><div id=\"attributeblock\" style=\"display: none;\" class=\"form-group\"><label class=\"form-label semibold\" for=\"attribute\">Attribute</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"attribute\" id=\"attribute\" value=\"" + escapeOrDefault(userdata.evt_data.attribute,"") + "\">" +
    "    </div><div class=\"form-group\"><label class=\"form-label semibold\" for=\"expr\">Value</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"expr\" id=\"expr\" value=\"" + escapeOrDefault(userdata.evt_data.expr,"") + "\">" +
    "    <br />" +
    "</div>";
  } else if (userdata.evt == "tabswitch") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_method\">Method</label>" +
    "    <select class=\"form-control event-detail\" data-event-detail=\"method\" id=\"event_method\">" +
    "        <option value=\"url\">By URL</option>" +
    "        <option value=\"index\">By Index</option>" +
    "    </select>" +
    "    </div><div id=\"urlFieldGroup\" style=\"display: none;\" class=\"form-group\"><label class=\"form-label semibold\" for=\"url\">URL</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"url\" id=\"url\" value=\"" + escapeOrDefault(userdata.evt_data.url,"") + "\">" +
    "    <br />" +
    "    </div><div id=\"indexFieldGroup\" style=\"display: none;\"  class=\"form-group\"><label class=\"form-label semibold\" for=\"index\">Index</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"index\" id=\"index\" value=\"" + escapeOrDefault(userdata.evt_data.index,"") + "\">" +
    "    <br />" +
    "    </div>";
  } else if (userdata.evt == "tabremove") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_method\">Method</label>" +
    "    <select class=\"form-control event-detail\" data-event-detail=\"method\" id=\"event_method\">" +
    "        <option value=\"active\">Use Current Tab</option>" +
    "        <option value=\"url\">By URL</option>" +
    "        <option value=\"index\">By Index</option>" +
    "    </select>" +
    "    </div><div id=\"urlFieldGroup\" style=\"display: none;\" class=\"form-group\"><label class=\"form-label semibold\" for=\"url\">URL</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"url\" id=\"url\" value=\"" + escapeOrDefault(userdata.evt_data.url,"") + "\">" +
    "    <br />" +
    "    </div><div id=\"indexFieldGroup\" style=\"display: none;\"  class=\"form-group\"><label class=\"form-label semibold\" for=\"index\">Index</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"index\" id=\"index\" value=\"" + escapeOrDefault(userdata.evt_data.index,"") + "\">" +
    "    <br />" +
    "    </div>";
  } else if (userdata.evt == "csvimport") {
    if (userdata.evt_data.csvfile) {
      return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"csv\">CSV File</label>" +
      "    <div id=\"csv-files\"><i class=\"fa fa-file-o\"></i> " + userdata.evt_data.csvfile.name + " <small><a id=\"clearCsv\">Clear</a></small><br /></div><div style=\"display: none;\" id=\"csv-drop-zone\"><span class=\"btn btn-file\"><span><i class=\"fa fa-upload\"></i> Choose CSV File</span><input id=\"event_csvfile\" type=\"file\" name=\"event_csvfile[]\"></span></div>" +
      "</div>";
    }
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"csv\">CSV File</label>" +
    "    <div id=\"csv-files\"></div><div id=\"csv-drop-zone\">" +
	  "     <span class=\"btn btn-file\"><span><i class=\"fa fa-upload\"></i> Choose CSV File</span><input id=\"event_csvfile\" type=\"file\" name=\"event_csvfile[]\"></span></div>" +
    "</div><br />";
  } else if (userdata.evt == "tabchange") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"url\">URL</label>" +
    "    <input type=\"text\" class=\"form-control event-detail\" data-event-detail=\"url\" id=\"url\" value=\"" + escapeOrDefault(userdata.evt_data.url,"about:blank") + "\">" +
    "    <br />" +
    "    <label class=\"form-label semibold\" for=\"event_newtab\">Options</label>" +
    "    <div class=\"checkbox-bird\">" +
		"      <input type=\"checkbox\" id=\"event_newtab\">" +
		"      <label for=\"event_newtab\">Open in New Tab</label>" +
	  "    </div>" +
    "</div>";
  } else if (userdata.evt == "begin_recording" || userdata.evt == "end_recording" || userdata.evt == "clipboard_cut" || userdata.evt == "clipboard_copy" || userdata.evt == "clipboard_paste") {
    return "";
  } else if (userdata.evt == "closewindow") {
    return "";
  } else if (userdata.evt == "setproxy") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_scheme\">Proxy Type</label>" +
    "    <select class=\"form-control event-detail\" data-event-detail=\"scheme\" id=\"event_scheme\">" +
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
      userdata.wait_time = 0;
    var wait_time = 0;
    if (isNaN(parseFloat(userdata.wait_time)))
      wait_time = userdata.wait_time;
    else
      wait_time = escapeOrDefault(userdata.wait_time/1000,"0");
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_detail_timer\">Timer</label>" +
    "    <div class=\"input-group\">" +
    "        <input type=\"text\" class=\"form-control\" id=\"event_detail_timer\" value=\"" + wait_time + "\">" +
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
  } else if (userdata.evt == "test_expression") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_detail_expression\">Expression</label>" +
    "    <input type=\"text\" class=\"form-control\" id=\"event_detail_expression\" value=\"" + escapeOrDefault(userdata.expr,"") + "\">" +
    "</div>";
  } else if (userdata.evt == "wait_for_time") {
    return "<div class=\"form-group\"><label class=\"form-label semibold\" for=\"event_detail_waittilltime\">Time</label>" +
    "    <input type=\"text\" class=\"form-control\" id=\"event_detail_waittilltime\" value=\"" + escapeOrDefault(userdata.waittilltime,"12:00:00 AM") + "\">" +
    "</div>";
  }

  console.log("Unprocessable Event Options: " + userdata.evt);

  return "<i>Event Properties Unavailable</i><br /><br />";
}

function selectedFigure(figure) {
  $('#workflowsidepanel').attr('style','');
  $('#sidePanelTypeSelect').html('');
  $('#sidePanelTypeSelectGroup').attr("style","display: block;");

  if (figure.userData.section) {
    $('#sidePanelTitle').text("Section Properties");
    $('#sidePanelTypeSelectGroup').attr("style","display: none;");
  } else if ($.inArray(figure.userData.evt,link_types)==-1) {
    $('#sidePanelTitle').text("Event Properties");
    $('#sidePanelTypeSelect').removeAttr('disabled');
    if (figure.userData.evt == "begin_recording") {
      $('#sidePanelTypeSelect').attr('disabled','disabled');
      $('#sidePanelTypeSelect').html(
        "<option value='begin_recording' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-runner.png\"/>Begin Recording</span>'>Begin Recording</option>"
      ).selectpicker('refresh');
      $('#sidePanelTypeSelect').attr('disabled','disabled');
    } else {
      var selecthtml = "";
      for (var event in mappingData) {
        if (event != "begin_recording") {
          if (mappingData[event].optlabel)
            selecthtml += "<optgroup label='" + mappingData[event].optlabel + "'>";
          selecthtml += '<option ';
          if (figure.userData.evt == event)
            selecthtml += "selected='selected' ";
          selecthtml += "value='" + event + "' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-" + mappingData[event].icon + "\"/>" + mappingData[event].event_type + "</span>'>" + mappingData[event].event_type + "</option>";
          if (mappingData[event].endoptlabel)
            selecthtml += "</optgroup>";
        }
      }
      $('#sidePanelTypeSelect').html(selecthtml).selectpicker('refresh');
    }
  } else {
    $('#sidePanelTitle').text("Link Properties");
    $('#sidePanelTypeSelect').removeAttr('disabled');
    if (figure.userData.evt == "wait_for_element")
      $('#sidePanelTypeSelect').html(
        "<option value='timer' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-timer-clock.png\"/>Timer</span>'>Timer</option>" +
        "<option selected='selected' value='wait_for_element' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/page-view.png\"/>Wait For Element</span>'>Wait For Element</option>" +
        "<option value='wait_for_title' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-title.png\"/>Wait For Title</span>'>Wait For Title</option>" +
        "<option value='test_expression' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-equation.png\"/>Test Expression</span>'>Test Expression</option>" +
        "<option value='wait_for_time' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-wall-clock.png\"/>Wait For Time</span>'>Wait For Time</option>"
      ).selectpicker('refresh');
    else if (figure.userData.evt == "wait_for_title")
      $('#sidePanelTypeSelect').html(
        "<option value='timer' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-timer-clock.png\"/>Timer</span>'>Timer</option>" +
        "<option value='wait_for_element' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/page-view.png\"/>Wait For Element</span>'>Wait For Element</option>" +
        "<option selected='selected' value='wait_for_title' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-title.png\"/>Wait For Title</span>'>Wait For Title</option>" +
        "<option value='test_expression' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-equation.png\"/>Test Expression</span>'>Test Expression</option>" +
        "<option value='wait_for_time' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-wall-clock.png\"/>Wait For Time</span>'>Wait For Time</option>"
      ).selectpicker('refresh');
    else if (figure.userData.evt == "timer")
      $('#sidePanelTypeSelect').html(
        "<option selected='selected' value='timer' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-timer-clock.png\"/>Timer</span>'>Timer</option>" +
        "<option value='wait_for_element' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/page-view.png\"/>Wait For Element</span>'>Wait For Element</option>" +
        "<option value='wait_for_title' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-title.png\"/>Wait For Title</span>'>Wait For Title</option>" +
        "<option value='test_expression' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-equation.png\"/>Test Expression</span>'>Test Expression</option>" +
        "<option value='wait_for_time' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-wall-clock.png\"/>Wait For Time</span>'>Wait For Time</option>"
      ).selectpicker('refresh');
    else if (figure.userData.evt == "test_expression")
      $('#sidePanelTypeSelect').html(
        "<option value='timer' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-timer-clock.png\"/>Timer</span>'>Timer</option>" +
        "<option value='wait_for_element' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/page-view.png\"/>Wait For Element</span>'>Wait For Element</option>" +
        "<option value='wait_for_title' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-title.png\"/>Wait For Title</span>'>Wait For Title</option>" +
        "<option selected='selected' value='test_expression' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-equation.png\"/>Test Expression</span>'>Test Expression</option>" +
        "<option value='wait_for_time' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-wall-clock.png\"/>Wait For Time</span>'>Wait For Time</option>"
      ).selectpicker('refresh');
    else if (figure.userData.evt == "wait_for_time") {
      $('#sidePanelTypeSelect').html(
        "<option value='timer' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-timer-clock.png\"/>Timer</span>'>Timer</option>" +
        "<option value='wait_for_element' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/page-view.png\"/>Wait For Element</span>'>Wait For Element</option>" +
        "<option value='wait_for_title' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-title.png\"/>Wait For Title</span>'>Wait For Title</option>" +
        "<option value='test_expression' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-equation.png\"/>Test Expression</span>'>Test Expression</option>" +
        "<option selected='selected' value='wait_for_time' data-content='<span class=\"user-item\"><img style=\"-webkit-border-radius: 0; border-radius: 0;\" src=\"/icons/dark-wall-clock.png\"/>Wait For Time</span>'>Wait For Time</option>"
      ).selectpicker('refresh');
    }
  }

  // Set details call
  $('#sidePanelEventDetails').html(getEventOptionsHtml(figure.userData));

  // Setup select values properly
  if (figure.userData && figure.userData.evt_data) {
      if (figure.userData.evt_data.scheme) {
        $('#event_scheme').val(figure.userData.evt_data.scheme);
      }
      if (figure.userData.evt_data.keyCode) {
        $('#event_keyCode').val(figure.userData.evt_data.keyCode);
      }
      if (figure.userData.evt_data.usage) {
        $('#event_usage').val(figure.userData.evt_data.usage);
        if (figure.userData.evt_data.usage == "title" || figure.userData.evt_data.usage == "url")
          $('#expr').attr("disabled","disabled");
        else
          $('#expr').removeAttr("disabled");
        
        if (figure.userData.evt_data.usage != "elemattr")
          $('#attributeblock').attr("style","display: none;");
        else
          $('#attributeblock').removeAttr("style");
      }
      if (figure.userData.evt_data.button && figure.userData.evt_data.button == 1) {
        $('#event_middlebutton').prop('checked', true);
      }
      if (figure.userData.useDirectInput) {
        $('#event_useDirectInput').prop('checked', true);
      }
      if (figure.userData.useOSInput) {
        $('#event_useOSInput').prop('checked', true);
      }
      if (figure.userData.evt_data.useFuzzyMatch) {
        $('#event_useFuzzyMatch').prop('checked', true);
      }
      if (figure.userData.evt_data.downloadlinks && figure.userData.evt_data.downloadlinks == 1) {
        $('#event_downloadlinks').prop('checked', true);
      }
      if (figure.userData.evt_data.newtab) {
        $('#event_newtab').prop('checked', true);
      }
      if (figure.userData.evt_data.method) {
        $('#event_method').val(figure.userData.evt_data.method);
        if (figure.userData.evt_data.method == "index")
          $('#indexFieldGroup').removeAttr("style");
        if (figure.userData.evt_data.method == "url")
          $('#urlFieldGroup').removeAttr("style");
      }
  }
  // Listen for changes
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
        init : doSuper,
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
  $('#event_detail_timer').on('input', function() {
    var userData = figure.userData;
    userData['wait_time'] = 0;
    if (isNaN(parseFloat($('#event_detail_timer').val())))
      userData['wait_time'] = $('#event_detail_timer').val();
    else
      userData['wait_time'] = $('#event_detail_timer').val() * 1000;
    figure.setUserData(userData);
  });
  $('#event_detail_waittilltime').on('input', function() {
    var userData = figure.userData;
    userData['waittilltime'] = $('#event_detail_waittilltime').val();
    figure.setUserData(userData);
  });
  $('#event_detail_title').on('input', function() {
    var userData = figure.userData;
    userData['title'] = $('#event_detail_title').val();
    figure.setUserData(userData);
  });
  $('#event_detail_expression').on('input', function() {
    var userData = figure.userData;
    userData['expr'] = $('#event_detail_expression').val();
    figure.setUserData(userData);
  });
  $('#event_detail_csspath').on('input', function() {
    var userData = figure.userData;
    userData['csspath'] = $('#event_detail_csspath').val();
    figure.setUserData(userData);
  });
  $('#section_name').on('input', function() {
    var userData = figure.userData;
    userData['section_name'] = $('#section_name').val();
    figure.setUserData(userData);
    figure.getChildren().data[0].setText($('#section_name').val());
  });
  $('.event-detail').on('input', function() {
    var userData = figure.userData;
    userData.evt_data[$(this).attr('data-event-detail')] = $(this).val();
    figure.setUserData(userData);
  });
  $('.event-detail').on('change', function() {
    var userData = figure.userData;
    userData.evt_data[$(this).attr('data-event-detail')] = $(this).val();
    figure.setUserData(userData);
  });
  $('#event_middlebutton').on('change', function() {
    var userData = figure.userData;
    userData.evt_data.button = $(this).is(":checked");
    figure.setUserData(userData);
  });
  $('#event_useDirectInput').on('change', function() {
    var userData = figure.userData;
    userData.useDirectInput = $(this).is(":checked");
    figure.setUserData(userData);
  });
  $('#event_useOSInput').on('change', function() {
    var userData = figure.userData;
    userData.useOSInput = $(this).is(":checked");
    figure.setUserData(userData);
  });
  $('#event_useFuzzyMatch').on('change', function() {
    var userData = figure.userData;
    userData.evt_data.useFuzzyMatch = $(this).is(":checked");
    figure.setUserData(userData);
  });
  $('#event_keyCode').on('change', function() {
    var userData = figure.userData;
    userData.evt_data.keyCode = $(this).val();
    figure.setUserData(userData);
  });
  $('#event_downloadlinks').on('change', function() {
    var userData = figure.userData;
    userData.evt_data.downloadlinks = $(this).is(":checked");
    figure.setUserData(userData);
  });
  $('#event_newtab').on('change', function() {
    var userData = figure.userData;
    userData.evt_data.newtab = $(this).is(":checked");
    figure.setUserData(userData);
  });
  $('#event_scrollTime').on('change', function() {
    var userData = figure.userData;
    userData.evt_data.scrollTime = ($(this).val() * 1000);
    figure.setUserData(userData);
  });
  $('#event_usage').on('change', function() {
    console.log($(this).val());
    if ($(this).val() == "elemattr")
      $('#attributeblock').removeAttr("style");
    else
      $('#attributeblock').attr("style","display: none;");
  });

  $('#event_csvfile').on('change', function(change_detail) {
    if ($('#event_csvfile').val() == "") return; // cleared file

    $("#event_csvfile").parse({
      config: {
        complete: function(results, file) {
          if (results.errors.length < 1) {
            var userData = figure.userData;
            userData.evt_data.csvresults = results;
            userData.evt_data.csvfile = {
              name: file.name,
              size: file.size,
              lastModified: file.lastModified
            };
            figure.setUserData(userData);

            $('#csv-drop-zone').attr('style','display: none;');
            $('#csv-files').html("<i class=\"fa fa-file-o\"></i> " + file.name + " <small><a id=\"clearCsv\">Clear</a></small><br />");
            $('#clearCsv').click(function(){
              $('#csv-drop-zone').attr('style','display: block;');
              var userData = figure.userData;
              userData.evt_data.csvresults = false;
              userData.evt_data.csvfile = false;
              figure.setUserData(userData);
              $('#csv-files').html("");
              $('#event_csvfile').val("");
            });
          } else {
            console.log(results.errors); // TODO - Make this user visible
            swal({
                title: "Error",
                text: results.errors[0].message + "<small><br /><br /><b>Hint: </b>Ensure your file is a CSV and does not have a new line at the end of the file.</small>",
                type: "error",
                html: true
            });
          }
        }
      }
    });
  });
  $('#clearCsv').click(function(){
    $('#csv-drop-zone').attr('style','display: block;');
    var userData = figure.userData;
    userData.evt_data.csvresults = false;
    userData.evt_data.csvfile = false;
    figure.setUserData(userData);
    $('#csv-files').html("");
    $('#event_csvfile').val("");
  });

  $('#event_subimgfile').on('change', function(change_detail) {
    if ($('#event_subimgfile').val() == "") return; // cleared file
    var file = change_detail.target.files[0];
    var reader  = new FileReader();
    reader.addEventListener("load", function(){
      var userData = figure.userData;
      userData.evt_data.subimgresults = reader.result;
      userData.evt_data.subimgfile = {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified
      };
      figure.setUserData(userData);
  
      $('#subimg-drop-zone').attr('style','display: none;');
      $('#subimg-files').html("<img style=\"max-width: 100%; max-height: 200px;\" src=\"" + reader.result + "\" /><br /><small><a id=\"clearSubimg\">Clear</a></small><br />");
      $('#clearSubimg').click(function(){
        $('#subimg-drop-zone').attr('style','display: block;');
        var userData = figure.userData;
        userData.evt_data.subimgresults = false;
        userData.evt_data.subimgfile = false;
        figure.setUserData(userData);
        $('#subimg-files').html("");
        $('#event_subimgfile').val("");
      });
    }, false);
    reader.readAsDataURL(file);
  });
  $('#clearSubimg').click(function(){
    $('#subimg-drop-zone').attr('style','display: block;');
    var userData = figure.userData;
    userData.evt_data.subimgfile = false;
    figure.setUserData(userData);
    $('#subimg-files').html("");
    $('#event_subimgfile').val("");
  });
  
  $('#event_usage').on('change', function() {
    if (figure.userData.evt_data.usage == "title" || figure.userData.evt_data.usage == "url")
      $('#expr').attr("disabled","disabled");
    else
      $('#expr').removeAttr("disabled");
  });
  $('#event_method').on('change', function() {
    $('#indexFieldGroup').attr("style","display: none;");
    $('#urlFieldGroup').attr("style","display: none;");
    if (figure.userData.evt_data.method == "index")
      $('#indexFieldGroup').removeAttr("style");
    if (figure.userData.evt_data.method == "url")
      $('#urlFieldGroup').removeAttr("style");
  });
}

function addSection(label) {
  var heights = canvas.getFigures().clone().map(function(f){ return f.getAbsoluteY()+f.getHeight();});
  var y = 10 + Math.max.apply(Math,heights.asArray());

  canvas.uninstallEditPolicy( gridPolicy );

  var section = new CustomSection({
    x: (window.innerWidth/2)-108,
    y: y,
    bgColor: "#f4f4f4",
    color: "#888888",
    stroke: 2,
    width: 232,
    height: 80,
    userData: {
      section: true,
      section_name: ""
    }
  });

  var command = new draw2d.command.CommandAdd(canvas, section, (window.innerWidth/2)-108, y);
  canvas.getCommandStack().execute(command);
  
  //canvas.add(section);

  section.on("move",function(obj,ctx) {
      canvasResize();
  });

  setTimeout(function(){
    canvas.installEditPolicy( gridPolicy );
  },2);

  canvas.setCurrentSelection(section);
  selectedFigure(section);

  $(window).scrollTop($('body').height());
  canvasResize();

  $('#section_name').focus();
}

function addNode(event) {
  var bgColor = "#999999";
  if (mappingData[event.evt] !== undefined)
    bgColor = mappingData[event.evt].bgColor;
  if (all_settings.directinputdefault && ["keyup","keydown","keypress","input","mouseup","mousedown","click"].includes(event.evt))
    event['useDirectInput'] = true;
  var node = new CustomNode({ // can change Oval to Rectangle
    radius: 10,
    stroke:3,
    color: "#888888",
    resizeable: false,
    bgColor: bgColor,
    userData: event
  });

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
  
  node.on("move",function(obj,ctx) {
      canvasResize();
  });

  return node;
}

function deselectedFigure(figure) {
  $('#workflowsidepanel').attr('style','display: none;');
}

function canvasResize() {
    var heights = canvas.getFigures().clone().map(function(f){ return f.getAbsoluteY()+f.getHeight();});
    var height = Math.max(window.innerHeight-142,200 + Math.max.apply(Math,heights.asArray()));
    if (canvas.getHeight() == height)
      return;

    clearTimeout(delayedResizeCounter);
    delayedResizeCounter = setTimeout(function(){
        $('#graph').attr('style','width: ' + window.innerWidth + 'px; height: ' + height + 'px; background-color: #ffffff;');
        canvas.setDimension(new draw2d.geo.Rectangle(0,0,window.innerWidth,height));

        var newRegion = new draw2d.policy.figure.RegionEditPolicy(new draw2d.geo.Rectangle(0,0,window.innerWidth,height));
        canvas.getFigures().each(function(i, o) {
          o.uninstallEditPolicy({NAME: "draw2d.policy.figure.RegionEditPolicy"});		
          o.installEditPolicy(newRegion);
        });
    },300);
}

function getCanvasImage() {
    clearProcessIcons();
    return new Promise(function(resolve, reject) {
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
            gridPolicy.setGrid(5); // reset sexy hack

            resolve(png);
        }, new draw2d.geo.Rectangle(minX,minY,width,height));
    });
}

function exportCanvasImage() {
    getCanvasImage().then(function(png){
        var filename = "WildfireWorkflowImage_" + Math.floor(Date.now() / 1000) + ".png";

        var element = document.createElement('a');
        element.setAttribute('href', png);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });
}
$('#workflowToolbarExportImage').click(function(){
    exportCanvasImage();
});

function importJSON(json) {
    canvas.clear();
    var reader = new draw2d.io.json.Reader();
    var importedjson = JSON.parse(decrypt(json));

    reader.unmarshal(canvas, importedjson.canvas);

    nodes = [];
    for (var i=0; i<canvas.figures.data.length; i++) {
        nodes.push(canvas.figures.data[i]);
        canvas.figures.data[i].setResizeable(false);
        canvas.figures.data[i].on("move",function(obj,ctx) {
            canvasResize();
        });
    }

    chrome.storage.local.set({events: importedjson.events});

    if (importedjson.cvsHeight) {
        if (importedjson.cvsHeight != $('#graph').height()) {
            canvasResize();
        }
    }

    setTimeout(function(){ // TODO: This is a dirty hack to avoid grid overlay on long loads
      resetGridZ();
    },1000);
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
    return new Promise(function(resolve, reject) {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas, function(json){
            var jsonTxt = JSON.stringify({
                canvas: json,
                events: events,
                cvsHeight: $('#graph').height()
            });
            if (jsonTxt.length < 1024) {
                resolve();
                return;
            }
            var text = encrypt(jsonTxt);
            chrome.storage.local.set({workflow: text},function(){
                resolve();
            });
        });
    });
}

$(window).unload(function() {
  saveToLocalStorage();
  // TODO - stall processing time waiting for async
  //return;
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
      swal({
          title: "Export Workflow",
          text: "Enter your filename:",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          inputValue: "WildfireSimulationExport_" + Math.floor(Date.now() / 1000) + ".wfsim"
      }, function (filename) {
          if (filename === false) return false;
          if (filename === "") {
              swal("Error", "You need to specify a filename.", "error");
              return false;
          }
          if (!filename.endsWith(".wfsim") && !filename.endsWith(".WFSIM")) {
              swal("Error", "The extension must be .wfsim", "error");
              return false;
          }

          var element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
          element.setAttribute('download', filename);

          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          return true;
      });
  });
}

$('#workflowToolbarNew').click(function(){
    flushWorkflow();
});
$('#workflowToolbarSave').click(function(){
    exportJSON();
});
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
        wait_time: 1000
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
    /* Init Page */
    var width = window.innerWidth;
    var height = window.innerHeight-136;

    defineCustoms();

    $('#graph').attr('style','width: ' + width + 'px; height: ' + height + 'px; background-color: #ffffff;');

    window.addEventListener("contextmenu", function(e) { e.preventDefault(); });

    initCanvas();

    if (window.location.hash == "#launch") {
      setTimeout(function(){
        initWorkflowSimulation();
      },500);
    } else if (window.location.hash == "#export") {
      setTimeout(function(){
        exportJSON();
      },800);
    } else if (window.location.hash == "#tour1_1") {
      setTimeout(function(){
        openTour1_1();
      },50);
    }

    $('#simulateButton2').click(function(){
      initWorkflowSimulation();
    });
    $('#importWorkflowButton').click(function(){
      $('#simfileContainer').click();
    });
    $('#exportWorkflowButton').click(function(){
      exportJSON();
    });

    chrome.storage.local.get('settings', function (result) {
        if (result.settings.account != "" && result.settings.account !== undefined)
            $('#workflowToolbarCloudUpload').attr('style','display: block;');
    });
});

function initCanvas() {
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

        saveToLocalStorage();
        canvasResize();
        scrollOverrides();
    },100);
    
    canvas.on("select", function(emitter,event) {
        if (event.figure!==null) {
            figure = event.figure;
            selectedFigure(event.figure);
        } else {
            deselectedFigure(event.figure);
        }
    });

    chrome.storage.local.get('events', function (result) {
        if (!result.events)
            result.events = [];
        loadFromLocalStorageOrCreateNew(result);
    });

    canvas.getCommandStack().addEventListener(function(){
        if (canvas.getCommandStack().canUndo()) {
            $('#workflowToolbarUndo').removeAttr('disabled');
        } else {
            $('#workflowToolbarUndo').attr('disabled','');
        }
        if (canvas.getCommandStack().canRedo()) {
            $('#workflowToolbarRedo').removeAttr('disabled');
        } else {
            $('#workflowToolbarRedo').attr('disabled','');
        }
        $('.tooltip').remove();
    });
    canvas.getCommandStack().markSaveLocation();

    $('svg').css({position: 'static'});
}

function createNewWorkflowFromEvents(result) {
    var nodey;

    if (result.events.length < 1) { // only happens on fresh install
        result.events.push({
            evt: 'begin_recording',
            time: 0
        });
    }
    for (var i=0; i<result.events.length; i++) {
        var node = addNode(result.events[i]);
        var nodex = 295 + Math.min(80*(i%24), 80*12);
        nodey = 80 + 160*Math.floor(i/24);
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

    canvasResize();
}

$('#nodeLinkPanelX').click(function(){
    $('#workflowsidepanel').attr('style','display: none;');
    canvas.setCurrentSelection([]);
});

$('#workflowToolbarAddNode').click(function(){
    var heights = canvas.getFigures().clone().map(function(f){ return f.getAbsoluteY();});
    var y = Math.max.apply(Math,heights.asArray()) + 80;

    var node = addNode({
      evt: 'end_recording',
      time: 0
    })
    var command = new draw2d.command.CommandAdd(canvas, node, 775, y);
    canvas.getCommandStack().execute(command);

    nodes.push(node);
    canvasResize();
    $(window).scrollTop($('body').height());
});
$('#workflowToolbarAddSection').click(function(){
    addSection("");
    $(window).scrollTop($('body').height());
});
$('#workflowToolbarInitSimulation').click(function(){
    saveToLocalStorage().then(function() {
      initWorkflowSimulation();
    });
});

function favoriteSwal() {
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
            swal("Error", "You need to enter a workflow name", "error");
            return false;
        }
        chrome.storage.local.get('favorites', function (result) {
            chrome.storage.local.get('workflow', function (workflow) {
                var favorites = result.favorites;
                if (!Array.isArray(favorites)) { // for safety only
                    favorites = [];
                }

                for (var i=0; i<favorites.length; i++) {
                    if (favorites[i].name == inputValue.trim()) {
                        swal("Error", "You already have a workflow with the same name", "error");
                        return false;
                    }
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
}
$('#workflowToolbarFavorite').click(favoriteSwal);

function cloudUploadSwal() {
    saveToLocalStorage();
    swal({
        title: "Upload Workflow",
        text: "Enter your workflow name:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: ""
    }, function (inputValue) {
        if (inputValue === false || inputValue.trim() === "") {
            swal("Error", "You need to enter a workflow name", "error");
            return false;
        }

        $('.confirm').attr('disabled','');

        getCanvasImage().then(function(png){
            chrome.storage.local.get('events', function (events) {
                chrome.storage.local.get('workflow', function (workflow) {
                    chrome.storage.local.get('settings', function (settings) {
                        $.ajax({
                            method: "POST",
                            url: "https://cloud.wildfire.ai/api/upload",
                            data: {
                                name: inputValue.trim(),
                                workflow: workflow.workflow,
                                time: Date.now(),
                                api_key: all_settings.cloudapikey,
                                account: all_settings.account,
                                version: chrome.runtime.getManifest().version,
                                image: png
                            }
                        }).always(function(resp) {
                            if (JSON.parse(resp).result) {
                              swal({
                                  title: "Done",
                                  text: "Your <b>" + inputValue.trim() + "</b> workflow has been uploaded to the Wildfire Cloud.",
                                  type: "success",
                                  html: true
                              });
                            } else {
                              swal({
                                title: "Error",
                                text: "Your workflow could not be uploaded. Check your quota usage and API key.",
                                type: "error",
                                html: true
                              });
                            } 
                            $('.confirm').removeAttr('disabled');
                        });
                    });
                });
            });
        });
    });
}

function cloneSelection() {
    var cloneNodes = [];
    var retry = true;
    var offset = 0;
    var selection = new draw2d.util.ArrayList();

    while (retry && offset < 8000) {
        retry = false;
        offset += 80;
        canvas.getSelection().each(function(i,fig){
            if (canvas.getBestFigure(fig.x, fig.y+offset) !== null)
                retry = true;
        });
    }

    canvas.getSelection().each(function(i,fig){
        if (fig.cssClass == "CustomNode") {
            if (fig.userData.evt == "begin_recording")
                return;
            var node = fig.clone();
            node.setResizeable(false);
            for (var i=0; i<node.hybridPorts.data.length; i++) {
                node.hybridPorts.data[i].userData.clonedFrom = fig.hybridPorts.data[i].id;
            }
            node.userData.clonedFrom = fig.id;
            cloneNodes.push(node);
            canvas.add(node, fig.x, fig.y+offset);
            nodes.push(node);
            selection.add(node);
        } else if (fig.cssClass == "CustomSection") {
            var section = fig.clone();
            canvas.add(section, fig.x, fig.y+offset);
            selection.add(section);
        }
    });
    canvas.getSelection().each(function(i,fig){
        if (fig.cssClass == "draw2d_Connection") {
            var source = false;
            var dest = false;

            for (var i=0; i<cloneNodes.length; i++) {
                if (cloneNodes[i].hybridPorts) {
                    for (var j=0; j<cloneNodes[i].hybridPorts.data.length; j++) {
                        if (fig.sourcePort.parent.userData.evt == "begin_recording")
                            return;
                        if (fig.targetPort.parent.userData.evt == "begin_recording")
                            return;
                        if (fig.sourcePort.id == cloneNodes[i].hybridPorts.data[j].userData.clonedFrom)
                            source = cloneNodes[i].hybridPorts.data[j];
                        if (fig.targetPort.id == cloneNodes[i].hybridPorts.data[j].userData.clonedFrom)
                            dest = cloneNodes[i].hybridPorts.data[j];
                    }
                }
            }

            var newLink = connCreate(source,dest,fig.userData);
            links.push(newLink);
            canvas.add(newLink);
            selection.add(newLink);
        }
    });

    $('#workflowsidepanel').attr('style','display: none;');
    canvas.setCurrentSelection([]);
    resetGridZ();
    saveToLocalStorage();
    canvas.getCommandStack().markSaveLocation();
}

function resetGridZ() {
    setTimeout(function(){
        canvas.uninstallEditPolicy( gridPolicy );
        canvas.installEditPolicy( gridPolicy ); // sexy hack to avoid section being under grid
    },1);
}

$('#workflowToolbarCloudUpload').click(cloudUploadSwal);
$('#workflowToolbarClone').click(cloneSelection);
$('#workflowToolbarUndo').click(function(){
  canvas.getCommandStack().undo();
});
$('#workflowToolbarRedo').click(function(){
  canvas.getCommandStack().redo();
  resetGridZ();
});

function openTour1_1() {
    var enjoyhint_instance = new EnjoyHint({});
    var enjoyhint_script_steps = [
      {
        'click #workflowToolbarInitSimulation': 'This is the workflow we just created.<br />It has many events (circles) and links (arrows).<br /><br />The final step is to click the play button to start a simulation.<br />Once it\'s running, simply watch and relax.',
        showSkip: false
      }
    ];
    enjoyhint_instance.set(enjoyhint_script_steps);
    enjoyhint_instance.run();
}

function scrollOverrides() {
    canvas.fromDocumentToCanvasCoordinate =  $.proxy(function (x, y) {
      return new draw2d.geo.Point(
        (x - this.getAbsoluteX() + this.getScrollLeft() + this.getWindowScrollLeft()) * this.zoomFactor,
        (y - this.getAbsoluteY() + this.getScrollTop() + this.getWindowScrollTop()) * this.zoomFactor);
    }, canvas);

    canvas.fromCanvasToDocumentCoordinate =  $.proxy(function (x, y) {
      return new draw2d.geo.Point(
        ((x * (1 / this.zoomFactor)) + this.getAbsoluteX() - this.getScrollLeft() - this.getWindowScrollLeft()),
        ((y * (1 / this.zoomFactor)) + this.getAbsoluteY() - this.getScrollTop() - this.getWindowScrollTop()));
    }, canvas);
      
    canvas.getWindowScrollTop =  $.proxy(function (x, y) {
      if (typeof pageYOffset != 'undefined') {
        //most browsers except IE before #9      
        return pageYOffset;
      }
      else {
        var B = document.body; //IE 'quirks'
        var D = document.documentElement; //IE with doctype
        D = (D.clientHeight) ? D : B;
        return D.scrollTop;
      }
    }, canvas);

    canvas.getWindowScrollLeft =  $.proxy(function (x, y) {
      if (typeof pageXOffset != 'undefined') {
        //most browsers except IE before #9
        return pageXOffset;
      }
      else {
        var B = document.body; //IE 'quirks'
        var D = document.documentElement; //IE with doctype
        D = (D.clientHeight) ? D : B;
        return D.scrollLeft;
      }
    }, canvas);
}

/* From simulate */
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

function clearProcessIcons() {
  canvas.getFigures().each(function(i, o) {
      var children = o.getChildren();
      if (children.data) {
          for (var j=0; j<children.data.length; j++) {
              if (children.data[j].userData) {
                  if (children.data[j].userData.isProgressFigure) {
                      canvas.remove(children.data[j]);
                  }
              }
          }
      }
  });

  canvas.getCommandStack().markSaveLocation();
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
      if (nodes[i].id !== undefined && nodes[i].id == nodeid) {
          node = nodes[i];
          break;
      }
  }
  CustomTracker.push(custom);
  node.add(custom, new draw2d.layout.locator.CenterLocator(node));
}

function initWorkflowSimulation() {
  if (!events || events.length<2) { // TODO: test events? eventually get rid of events requirement :/
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
  clearProcessIcons();

  send_message({
      action: "begin_sim"
  });
}
