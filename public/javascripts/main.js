$(function () {
    if (document.getElementById("countsChart")) {
        var countsSvg = dimple.newSvg("#countsChart", 520, 150);
        d3.json('/data/node-types.json', function (data) {
            var labelCountGraph = new dimple.chart(countsSvg, data);
            labelCountGraph.setBounds(60, 20, 440, 90);
            var x = labelCountGraph.addMeasureAxis("x", "value");
            x.title = 'Amount';
            labelCountGraph.addCategoryAxis("y", "label");
            labelCountGraph.addSeries('label', dimple.plot.bar);
            labelCountGraph.draw();
        });
    }

    if (document.getElementById("fileScoreHisto")) {
        var bucketNumber = 13;
        var fileScoreSvg = dimple.newSvg("#fileScoreHisto", 520, 160);
        d3.json("/files", function (data) {
            var counts = {};
            var max = 0;
            for (var i = 0; i < data.length; i++) {
                counts[data[i][2]] = counts[data[i][2]] + 1 || 1;
                max = Math.max(data[i][2], max);
            }
            var bucket = 1;
            while (bucket * bucketNumber < max) bucket *= 2;
            var chartData = [];
            for (var b = 0; b < bucketNumber; b++) {
                var cnt = 0;
                for (var j = bucket * b; j <= bucket * (b + 1); j++) {
                    cnt += counts[j] || 0
                }
                chartData.push({Score: j - 1, Amount: cnt})
            }

            var fileScoreChart = new dimple.chart(fileScoreSvg, chartData);
            fileScoreChart.setBounds(60, 15, 440, 100);
            var x = fileScoreChart.addCategoryAxis("x", "Score");
            fileScoreChart.addMeasureAxis("y", "Amount");
            var s = fileScoreChart.addSeries(null, dimple.plot.area);
            s.interpolation = "step";
            s.lineWeight = 1;
            fileScoreChart.draw();
        });
    }

    if (document.getElementById("fileScoreDots")) {
        var fileScoreDotsSvg = dimple.newSvg("#fileScoreDots", 520, 300);
        d3.json("/files", function (data) {
            var chartData = [];
            for (var i = 0; i < data.length; i++) {
                chartData.push({File: data[i][0], ServerCount: data[i][1], WeightScore: data[i][2]})
            }

            var fileScoreDotChart = new dimple.chart(fileScoreDotsSvg, chartData);
            fileScoreDotChart.setBounds(50, 30, 450, 230);
            fileScoreDotChart.addLogAxis("x", "WeightScore");
            fileScoreDotChart.addLogAxis("y", "ServerCount");
            var series1 = fileScoreDotChart.addSeries("File", dimple.plot.bubble);
            fileScoreDotChart.draw();
        });
    }

    if (document.getElementById("resourceActivityChart") && document.getElementById("resourceFailureChart")) {
        var resourceActivitySvg = dimple.newSvg("#resourceActivityChart", 520, 300);
        var resourceFailureSvg = dimple.newSvg("#resourceFailureChart", 520, 300);
        d3.json("/resources", function (data) {
            var resourceActivityChart = new dimple.chart(resourceActivitySvg, data);
            resourceActivityChart.setBounds(50, 30, 370, 230);
            var x = resourceActivityChart.addMeasureAxis("x", "Amount");
            x.title = "Effected systems";
            var y = resourceActivityChart.addMeasureAxis("y", "Rate");
            y.title = "Change rate";
            resourceActivityChart.addSeries(["Name", "Type"], dimple.plot.bubble);
            resourceActivityChart.addLegend(440, 10, 50, 200);
            resourceActivityChart.draw();

            var resourceFailuresChart = new dimple.chart(resourceFailureSvg, data);
            resourceFailuresChart.setBounds(50, 30, 370, 230);
            var x = resourceFailuresChart.addMeasureAxis("x", "Amount");
            x.title = "Effected systems";
            var y = resourceFailuresChart.addMeasureAxis("y", "Failures");
            y.title = "Failure rate";
            resourceFailuresChart.addSeries(["Name", "Type"], dimple.plot.bubble);
            resourceFailuresChart.addLegend(440, 10, 50, 200);
            resourceFailuresChart.draw();
        });
    }
    if (document.getElementById("serverActivityChart")) {
        var serverActivitySvg = dimple.newSvg("#serverActivityChart", 520, 300);
        d3.json("/server", function (results) {
            var chartData = [];

            for (var i = 0; i < results.length; i++) {
                if ((results[i].max_rate + results[i].max_failed) > 0) {
                    chartData.push({
                        Server: results[i].fqdn,
                        Weight: results[i].weight || 1,
                        Files: results[i].files,
                        Resources: results[i].resources,
                        Rate: results[i].max_rate + results[i].max_failed,
                        Change: results[i].max_rate,
                        Failure: results[i].max_failed
                    });
                }
            }

            var serverActivityChart = new dimple.chart(serverActivitySvg, chartData);
            serverActivityChart.setBounds(50, 30, 440, 230);
            var x = serverActivityChart.addMeasureAxis("x", "Files");
            serverActivityChart.addMeasureAxis("y", "Rate");
            serverActivityChart.addSeries(["Server", "Failure"], dimple.plot.bubble);
            serverActivityChart.draw();
        });
    }
});