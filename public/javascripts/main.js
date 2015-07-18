$(function () {
    if (document.getElementById("countsChart")) {
        var countsSvg = dimple.newSvg("#countsChart", 330, 150);
        d3.json('/data/node-types.json', function (data) {
            var labelCountGraph = new dimple.chart(countsSvg, data);
            labelCountGraph.setBounds(60, 20, 260, 100);
            var x = labelCountGraph.addMeasureAxis("x", "value");
            labelCountGraph.addCategoryAxis("y", "label");
            labelCountGraph.addSeries('label', dimple.plot.bar);
            labelCountGraph.draw();
        });
    }

    if (document.getElementById("fileScoreHisto")) {
        var fileScoreSvg = dimple.newSvg("#fileScoreHisto", 330, 160);
        d3.json("/files", function (data) {
            var counts = {};
            var max = 0;
            for (var i = 0; i < data.length; i++) {
                counts[data[i][1]] = counts[data[i][1]] + 1 || 1;
                max = Math.max(data[i][1], max);
            }
            console.log(counts)
            var chartData = [];
            for (var j = 0; j <= max; j++) {
                chartData.push({Score: j, Amount: counts[j] || 0})
            }
            var fileScoreChart = new dimple.chart(fileScoreSvg, chartData);
            fileScoreChart.setBounds(40, 5, 280, 100);
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
            var chartData=[];
            for (var i = 0; i < data.length; i++) {
                var t=data[i][0].split('[')[0]
                chartData.push({Name: data[i][0], Amount: data[i][1],Rate: data[i][2], Type:t})
            }
            console.log(chartData)
            var myChart = new dimple.chart(svg, chartData);
            myChart.setBounds(30, 30, 370, 230)
            myChart.addMeasureAxis("x", "Amount");
            myChart.addMeasureAxis("y", "Rate");
            myChart.addSeries("Type", dimple.plot.bubble);
            myChart.addLegend(10, 10, 360, 20, "right");
            myChart.draw();
        });
    }
});