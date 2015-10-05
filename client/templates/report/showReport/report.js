var dataLimit = "", barChartTabelData=[];

Template.showReport.helpers({
    'project' : function(){
        return this;
    },

    'permissionTable' : function(){
        var project = this,
            repodata = project.permission, permissionTable = [];
        for(x in repodata){
            var permission = {
                user : Profile.find({userId : x}).fetch()[0].full_name,
                permission : repodata[x]
            };
            permissionTable.push(permission);
        }
        return permissionTable;
    },

    'pieChartTabelData' : function() {
        return {
            Label: reportData.Label,
            SubLabel: reportData.SubLabel,
            Value: reportData.Year ? reportData.Year : reportData.Month ? reportData.Month : reportData.Date,
            Total: reportData.Total,
            Added: reportData.Added,
            Modified: reportData.Modified,
            Removed: reportData.Removed
        }
    },

    'barChartTabelData' : function(){
        return barChartTabelData;
    },

    'barchart' : function(){
        return Session.get('barchart');
    }
});

Template.showReport.rendered=function(){
    Session.set('barchart' , false);
    var data = reportData;
    console.log(">>>>>>>>>>>>>>>>data>>>>>>>>>>>>>>>",data);
    showPieChart("#piechart", data);
    showBarChart("#barchart", data);
};

/**
 *
 * Pie Chart data is prepared here
 *
 * */

var showPieChart = function (pieChartId, reportData) {
    var dataSet = getPieChartData(reportData);

    $.plot(pieChartId, dataSet, {
        series: {
            pie: {
                show: true
            }
        }
    });
};

var getPieChartData = function (reportData) {
    return  [
        {
            label: "Added",
            data: reportData.Added,
            color: '#33CC66 '
        },
        {
            label: "Removed",
            data: reportData.Removed,
            color: '#FF9999'
        },
        {
            label: "Modified",
            data: reportData.Modified,
            color: '#00ccff'
        }
    ];
};


/**
 *
 * Bar Chart data is prepared here
 *
 * */

var showBarChart = function (barChartId, reportData) {
    var barChartData = getBarChartData(reportData);
    var dataSet = [
        {
            label: "Total Commits",
            data: barChartData.data1,
            bars: {
                fillColor: "#ffe45c"
            },
            color: "#ffe45c"
        },
        {
            label: "Added Commits",
            data: barChartData.data2,
            bars: {
                fillColor: "#33CC66 "
            },
            color: "#33CC66 "
        },
        {
            label: "Modified Commits",
            data: barChartData.data3,
            bars: {
                fillColor: "#00ccff"
            },
            color: "#00ccff"
        },
        {
            label: "Removed Commits",
            data: barChartData.data4,
            bars: {
                fillColor: "#FF9999"
            },
            color: "#FF9999"
        }
    ];

    $(barChartId).addClass("legend-barchart");

    $.plot($(barChartId), dataSet, {
        xaxis: {
            min: 0,
            max: barChartData.maxTick,
            mode: null,
            ticks: barChartData.ticks,
            tickLength: 0, // hide gridlines
            axisLabel: barChartData.axisLabel,
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
            axisLabelPadding: 4
        },
        yaxis: {
            axisLabel: '--------Commits-------->',
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
            axisLabelPadding: 5
        },
        grid: {
            hoverable: true,
            clickable: false,
            borderWidth: 1
        },
        legend: {
            labelBoxBorderColor: "none",
            position: "right"
        },
        series: {
            shadowSize: 1,
            bars: {
                show: true,
                barWidth: barChartData.barWidth,
                order: 1
            }
        }
    });

    var getCommitsCountHeading = function (index) {
        switch (reportData.Label) {
            case "YEAR":
                return  reportData.Month[index].name;
                break;

            case "MONTH":
                return reportData.Day[index].name+', '+reportData.Month;
                break;

            case "DAY":
                return 'Hourhand: ' + index;
                break;

            default:
                return "Commits Count";
                break;
        }
    };

    $(barChartId).bind("plothover", function (event, pos, item) {
        if (item) {
            $("#flot-tooltip").remove();
            var originalPoint = Math.round(item.datapoint[0]) - 1;
            var x = getCommitsCountHeading(originalPoint),
                y = item.datapoint[1],
                z = item.series.color;

            showTooltip(item.pageX, item.pageY, "<b>" + item.series.label + "</b><br /> " + x + " = " + y + " Commits",
                z);
        } else {
            $("#flot-tooltip").remove();
        }
    });
};

var getBarChartData = function (reportData) {
    var barChartData = {},
        barChartTicks = [],
        barWidth = 0,
        maxTick = 0,
        axisLabel='',
        data1 = [],
        data2 = [],
        data3 = [],
        data4 = [];
    switch (reportData.Label) {
        case "YEAR":
            barChartTabelData = reportData.Month;
            Session.set("barchart" , true);
            maxTick = 13;
            axisLabel='--------Month-------->';
            dataLimit=maxTick-1;
            barWidth = 0.12;
            for (var i = 0; i < maxTick-1; i++) {
                data1[i] = [i + 1, reportData.Month[i].Total];
                data2[i] = [i + 1, reportData.Month[i].Added];
                data3[i] = [i + 1, reportData.Month[i].Modified];
                data4[i] = [i + 1, reportData.Month[i].Removed];
                barChartTicks[i] = [i + 1, reportData.Month[i].name];
            }
            break;

        case "MONTH":
            barChartTabelData = reportData.Day;
            Session.set('barchart',true);
            maxTick = reportData.noOfDays+1;
            dataLimit=maxTick-1;
            axisLabel='--------Day-------->';
            barWidth = 0.04;
            for (var i = 0; i < maxTick-1; i++) {
                data1[i] = [i + 1, reportData.Day[i].Total];
                data2[i] = [i + 1, reportData.Day[i].Added];
                data3[i] = [i + 1, reportData.Day[i].Modified];
                data4[i] = [i + 1, reportData.Day[i].Removed];
                barChartTicks[i] = [i + 1, reportData.Day[i].name];
            }
            break;

        case "DAY":
            barChartTabelData = reportData.Hour;
            Session.set('barchart',true);
            maxTick = 25;
            dataLimit=maxTick-1;
            axisLabel='--------Hour-Hand-------->';
            barWidth = 0.05;
            for (var i = 0; i < maxTick-1; i++) {
                data1[i] = [i + 1, reportData.Hour[i].Total];
                data2[i] = [i + 1, reportData.Hour[i].Added];
                data4[i] = [i + 1, reportData.Hour[i].Removed];
                data3[i] = [i + 1, reportData.Hour[i].Modified];
                barChartTicks[i] = [i + 1, reportData.Hour[i].name];
            }
            break;

        default:
            data1[0] = [0, 0];
            data2[0] = [0, 0];
            data3[0] = [0, 0];
            data4[0] = [0, 0];
            barChartTicks[0] = [0, 0];
            break;
    }
    barChartData['data1'] = data1;
    barChartData['data2'] = data2;
    barChartData['data3'] = data3;
    barChartData['data4'] = data4;
    barChartData['ticks'] = barChartTicks;
    barChartData['maxTick'] = maxTick;
    barChartData['barWidth'] = barWidth;
    barChartData['axisLabel'] = axisLabel;
    return barChartData;
};

var showTooltip = function (x, y, contents, z) {
    $('<div id="flot-tooltip">' + contents + '</div>').css({
        top: y - 20,
        left: x - 90,
        'border-color': z
    }).appendTo("body").show();
};