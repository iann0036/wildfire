var rect_width = 100;
var rect_height = 20;

// set up SVG for D3
var width  = window.innerWidth-0, // side panel width
    height = window.innerHeight-136,
    colors = d3.scale.category10();

var svg = d3.select('#workflowgraph')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

document.getElementById('workflowgraph').oncontextmenu = function(){ return false; }; // disable right click

chrome.storage.local.get('events', function (result) {
    events = result.events;

    if (events==null)
        return;
    if (events.length<2)
        return;

    // set up initial nodes and links
    //  - nodes are known by 'id', not by index in array.
    //  - reflexive edges are indicated on the node (as a bold black circle).
    //  - links are always source < target; edge directions are set by 'left' and 'right'.

    var nodes = [];
    var links = [];
    for (var i=0; i<events.length; i++) {
        nodes.push({
            id: i,
            fixed: true,
            reflexive: false,
            x: window.innerWidth / 2,
            y: (window.innerHeight / 2) - (events.length*50) + (i*100) - 68,
            eventdata: events[i]
        });
        if (i>0)
            links.push({
                source: nodes[i-1],
                target: nodes[i],
                left: false,
                right: true
            });
    }
    lastNodeId = events.length-1;

    // init D3 force layout
    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .linkDistance(100)
        .charge(-500)
        .on('tick', tick)

    // define arrow markers for graph links
    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#000');

// line displayed when dragging new nodes
    var drag_line = svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');

// handles to link and node element groups
    var path = svg.append('svg:g').selectAll('path'),
        circle = svg.append('svg:g').selectAll('g');

// mouse event vars
    var selected_node = null,
        selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mouseup_node = null;

    function resetMouseVars() {
        mousedown_node = null;
        mouseup_node = null;
        mousedown_link = null;
    }

    // update force layout (called automatically each iteration)
    function tick() {
        // draw directed edges with proper padding from node centers
        path.attr('d', function (d) {
            var deltaX = d.target.x - d.source.x,
                deltaY = d.target.y - d.source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourcePadding = d.left ? 17 : 12,
                targetPadding = d.right ? 17 : 12,
                sourceX = d.source.x + (sourcePadding * normX),
                sourceY = d.source.y + (sourcePadding * normY),
                targetX = d.target.x - (targetPadding * normX),
                targetY = d.target.y - (targetPadding * normY);
            return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        circle.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    }

    var drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("dragend", dragend);

    // update graph (called when needed)
    function restart() {
        // path (link) group
        path = path.data(links);

        // update existing links
        path.classed('selected', function (d) {
                return d === selected_link;
            })
            .style('marker-start', function (d) {
                return d.left ? 'url(#start-arrow)' : '';
            })
            .style('marker-end', function (d) {
                return d.right ? 'url(#end-arrow)' : '';
            });


        // add new links
        path.enter().append('svg:path')
            .attr('class', 'link')
            .classed('selected', function (d) {
                return d === selected_link;
            })
            .style('marker-start', function (d) {
                return d.left ? 'url(#start-arrow)' : '';
            })
            .style('marker-end', function (d) {
                return d.right ? 'url(#end-arrow)' : '';
            })
            .on('mousedown', function (d) {
                if (d3.event.ctrlKey) return;

                // select link
                mousedown_link = d;
                if (mousedown_link === selected_link) selected_link = null;
                else selected_link = mousedown_link;
                selected_node = null;

                openSidePanel(d);

                restart();
            });

        // remove old links
        path.exit().remove();


        // circle (node) group
        // NB: the function arg is crucial here! nodes are known by id, not by index!
        circle = circle.data(nodes, function (d) {
            return d.id;
        });

        // update existing nodes (reflexive & selected visual states)
        circle.selectAll('circle')
            .style('fill', function (d) {
                return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
            })
            .classed('reflexive', function (d) {
                return d.reflexive;
            });

        // add new nodes
        var g = circle.enter().append('svg:g');

        g.append('svg:rect')
            .attr('class', 'node')
            .attr('width', rect_width)
            .attr('height', rect_height)
            .attr('rx', 4)
            .attr('ry', 4)
            .style('fill', function (d) {
                return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
            })
            .style('stroke', function (d) {
                return d3.rgb(colors(d.id)).darker().toString();
            })
            .classed('reflexive', function (d) {
                return d.reflexive;
            })
            .on('mouseover', function (d) {
                if (!mousedown_node || d === mousedown_node) return;
                // enlarge target node
                d3.select(this).attr('transform', 'scale(1.1)');
            })
            .on('mouseout', function (d) {
                if (!mousedown_node || d === mousedown_node) return;
                // unenlarge target node
                d3.select(this).attr('transform', '');
            })
            .on('mousedown', function (d) {
                if (d3.event.ctrlKey) return;

                // select node
                mousedown_node = d;
                selected_node = mousedown_node; // always make node selected on click
                selected_link = null;

                openSidePanel(d);

                // reposition drag line
                if (d3.event.button == 2) // right-click
                    drag_line
                        .style('marker-end', 'url(#end-arrow)')
                        .classed('hidden', false)
                        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

                restart();
            })
            .on('mouseup', function (d) {
                if (!mousedown_node) return;

                if (d3.event.button != 2) return;

                // needed by FF
                drag_line
                    .classed('hidden', true)
                    .style('marker-end', '');

                // check for drag-to-self
                mouseup_node = d;
                if (mouseup_node === mousedown_node) {
                    resetMouseVars();
                    return;
                }

                // unenlarge target node
                d3.select(this).attr('transform', '');

                // add link to graph (update if exists)
                // NB: links are strictly source < target; arrows separately specified by booleans
                var source, target, direction;
                if (mousedown_node.id < mouseup_node.id) {
                    source = mousedown_node;
                    target = mouseup_node;
                    direction = 'right';
                } else {
                    source = mouseup_node;
                    target = mousedown_node;
                    direction = 'left';
                }

                var link;
                link = links.filter(function (l) {
                    return (l.source === source && l.target === target);
                })[0];

                if (link) {
                    link[direction] = true;
                } else {
                    link = {source: source, target: target, left: false, right: false};
                    link[direction] = true;
                    links.push(link);
                }

                // select new link
                selected_link = link;
                selected_node = null;
                restart();
            })
            .call(drag);
        ;

        // show node IDs
        g.append('svg:text')
            .attr('x', rect_width/2)
            .attr('y', (rect_height/2)+4)
            .attr('class', 'id')
            .text(function (d) {
                return d.eventdata.evt;
            });

        // remove old nodes
        circle.exit().remove();

        // set the graph in motion
        force.start();
    }

    function dragstart(d) {
        if (d3.event.sourceEvent.button == 2) {
            dragend();
        } else {
            circle.call(force.drag);
            svg.classed('ctrl', true);
            d3.select(this).classed("fixed", d.fixed = true);
        }
    }

    function dragend() {
        circle
            .on('mousedown.drag', null)
            .on('touchstart.drag', null);
        svg.classed('ctrl', false);
    }

    function mousedown() {
        // prevent I-bar on drag
        //d3.event.preventDefault();

        // because :active only works in WebKit?
        svg.classed('active', true);

        if (d3.event.ctrlKey || mousedown_node || mousedown_link) return;

        // Clicked nothing
        closeSidePanel();

        /* insert new node at point
         var point = d3.mouse(this),
         node = {id: ++lastNodeId, reflexive: false};
         node.x = point[0];
         node.y = point[1];
         nodes.push(node);
         */

        restart();
    }

    function mousemove() {
        if (!mousedown_node) return;

        // update drag line
        drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

        restart();
    }

    function mouseup() {
        if (mousedown_node) {
            // hide drag line
            drag_line
                .classed('hidden', true)
                .style('marker-end', '');
        }

        // because :active only works in WebKit?
        svg.classed('active', false);

        // clear mouse event vars
        resetMouseVars();
    }

    function spliceLinksForNode(node) {
        var toSplice = links.filter(function (l) {
            return (l.source === node || l.target === node);
        });
        toSplice.map(function (l) {
            links.splice(links.indexOf(l), 1);
        });
    }

    // only respond once per keydown
    var lastKeyDown = -1;

    function keydown() {
        d3.event.preventDefault();

        if (lastKeyDown !== -1) return;
        lastKeyDown = d3.event.keyCode;

        // ctrl
        if (d3.event.keyCode === 17) {
            circle.call(force.drag);
            svg.classed('ctrl', true);
        }

        if (!selected_node && !selected_link) return;
        switch (d3.event.keyCode) {
            case 8: // backspace
            case 46: // delete
                if (selected_node) {
                    nodes.splice(nodes.indexOf(selected_node), 1);
                    spliceLinksForNode(selected_node);
                } else if (selected_link) {
                    links.splice(links.indexOf(selected_link), 1);
                }
                selected_link = null;
                selected_node = null;
                closeSidePanel();
                restart();
                break;
            case 66: // B
                if (selected_link) {
                    // set link direction to both left and right
                    selected_link.left = true;
                    selected_link.right = true;
                }
                restart();
                break;
            case 76: // L
                if (selected_link) {
                    // set link direction to left only
                    selected_link.left = true;
                    selected_link.right = false;
                }
                restart();
                break;
            case 82: // R
                if (selected_node) {
                    // toggle node reflexivity
                    selected_node.reflexive = !selected_node.reflexive;
                } else if (selected_link) {
                    // set link direction to right only
                    selected_link.left = false;
                    selected_link.right = true;
                }
                restart();
                break;
        }
    }

    function keyup() {
        lastKeyDown = -1;

        // ctrl
        if (d3.event.keyCode === 17) {
            circle
                .on('mousedown.drag', null)
                .on('touchstart.drag', null);
            svg.classed('ctrl', false);
        }
    }

    function openSidePanel(d) {
        document.getElementById('sidepanelContents').innerHTML = JSON.stringify(d);

        document.getElementById('workflowsidepanel').style = "display: block; padding-top: 136px; width: 300px;";
    }

    function closeSidePanel() {
        document.getElementById('workflowsidepanel').style = "display: none; padding-top: 136px; width: 300px;";
    }

    document.getElementById('nodeLinkPanelX').addEventListener("click", function () {
        selected_link = null;
        selected_node = null;
        restart();
        closeSidePanel();
    });

    // app starts here
    svg.on('mousedown', mousedown)
        .on('mousemove', mousemove)
        .on('mouseup', mouseup);
    d3.select(window)
        .on('keydown', keydown)
        .on('keyup', keyup);
    restart();
});