$(document).ready(function() {
    $(".big span.pie").peity("pie", {
        radius: 20
    });
    $(".small span.pie").peity("pie");

    $(".big span.donut").peity("donut", {
        radius: 20
    });
    $(".small span.donut").peity("donut");

    $(".big span.line").peity("line", {
        height: 38
    });
    $(".small span.line").peity("line");
    $(".big span.bar").peity("bar", {
        height: 38
    });
    $(".small span.bar").peity("bar");

    var bigUpdatingChartLine = $(".big-updating-chart-line").peity("line", { width: 130, height: 38 });

    setInterval(function() {
        var random = Math.round(Math.random() * 10);
        var values = bigUpdatingChartLine.text().split(",");
        values.shift();
        values.push(random);
        bigUpdatingChartLine
            .text(values.join(","))
            .change()
    }, 1000);

    var smallUpdatingChartLine = $(".small-updating-chart-line").peity("line", { width: 130 });

    setInterval(function() {
        var random = Math.round(Math.random() * 10);
        var values = smallUpdatingChartLine.text().split(",");
        values.shift();
        values.push(random);
        smallUpdatingChartLine
            .text(values.join(","))
            .change()
    }, 1000);

    var bigUpdatingChartBar = $(".big-updating-chart-bar").peity("bar", { width: 130, height: 38 });

    setInterval(function() {
        var random = Math.round(Math.random() * 10);
        var values = bigUpdatingChartBar.text().split(",");
        values.shift();
        values.push(random);
        bigUpdatingChartBar
            .text(values.join(","))
            .change()
    }, 1000);

    var smallUpdatingChartBar = $(".small-updating-chart-bar").peity("bar", { width: 130 });

    setInterval(function() {
        var random = Math.round(Math.random() * 10);
        var values = smallUpdatingChartBar.text().split(",");
        values.shift();
        values.push(random);
        smallUpdatingChartBar
            .text(values.join(","))
            .change()
    }, 1000);
});
