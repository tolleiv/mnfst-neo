$(function () {
    if (document.getElementById("countsChart")) {
        var countsSvg = dimple.newSvg("#countsChart", 520, 150);
        d3.json('/data/node-types.json', function (data) {
            var labelCountGraph = new dimple.chart(countsSvg, data);
            labelCountGraph.setBounds(60, 20, 470, 90);
            var x = labelCountGraph.addMeasureAxis("x", "value");
            x.title = 'Amount'
            labelCountGraph.addCategoryAxis("y", "label");
            labelCountGraph.addSeries('label', dimple.plot.bar);
            labelCountGraph.draw();
        });
    }

    if (document.getElementById("fileScoreHisto")) {
        var fileScoreSvg = dimple.newSvg("#fileScoreHisto", 520, 160);
        d3.json("/files", function (data) {
            var counts = {};
            var max = 0;
            for (var i = 0; i < data.length; i++) {
                counts[data[i][1]] = counts[data[i][1]] + 1 || 1;
                max = Math.max(data[i][1], max);
            }
            var bucket = 1;
            while (bucket * 7 < max) bucket *= 2;
            var chartData = [];
            for (var b = 0; b < 7; b++) {
                var cnt = 0;
                for (var j = bucket * b; j <= bucket * (b + 1); j++) {
                    cnt += counts[j] || 0
                }
                chartData.push({Score: j - 1, Amount: cnt})
            }

            var fileScoreChart = new dimple.chart(fileScoreSvg, chartData);
            fileScoreChart.setBounds(60, 5, 470, 100);
            var x = fileScoreChart.addCategoryAxis("x", "Score");
            fileScoreChart.addMeasureAxis("y", "Amount");
            var s = fileScoreChart.addSeries(null, dimple.plot.area);
            s.interpolation = "step";
            s.lineWeight = 1;
            fileScoreChart.draw();
        });
    }

    if (document.getElementById("resourceActivityChart")) {
        var svg = dimple.newSvg("#resourceActivityChart", 450, 300);
        d3.json("/resources", function (data) {
            var chartData = [];
            for (var i = 0; i < data.length; i++) {
                if (Math.round(data[i][2] * 1000) / 1000 > 0) {
                    var t = data[i][0].split('[')[0] || 'Unknown';
                    chartData.push({Name: data[i][0], Amount: data[i][1], Rate: data[i][2], Type: t})
                }
            }
            var resourceActivityChart = new dimple.chart(svg, chartData);
            resourceActivityChart.setBounds(50, 30, 370, 230);
            var x = resourceActivityChart.addMeasureAxis("x", "Amount");
            x.title = "Effected systems";
            var y = resourceActivityChart.addMeasureAxis("y", "Rate");
            y.title = "Change rate";
            var series1 = resourceActivityChart.addSeries(["Name", "Type"], dimple.plot.bubble);
            resourceActivityChart.addLegend(10, 10, 360, 20, "right");
            resourceActivityChart.draw();
        });
    }
    if (document.getElementById("serverActivityChart")) {
        var svg = dimple.newSvg("#serverActivityChart", 450, 300);
        d3.json("/server", function (results) {
            var chartData = [];
            for (var i = 0; i < results.data.length; i++) {
                chartData.push({
                    Server: results.data[i][0].data.fqdn,
                    Weight: results.data[i][0].data.weight || 1,
                    Files: results.data[i][1],
                    Resources: results.data[i][2],
                    Rate: Math.round(results.data[i][3] * 1000) / 1000
                });
            }

            var serverActivityChart = new dimple.chart(svg, chartData);
            serverActivityChart.setBounds(50, 30, 370, 230);
            var x = serverActivityChart.addMeasureAxis("x", "Files");
            var y = serverActivityChart.addMeasureAxis("y", "Rate");
            var series1 = serverActivityChart.addSeries(["Server", "Weight"], dimple.plot.bubble);
            // serverActivityChart.addLegend(10, 10, 360, 20, "right");
            serverActivityChart.draw();
        });
    }
});