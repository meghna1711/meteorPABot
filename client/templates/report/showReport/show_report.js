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
            StartDate: reportData.StartDate,
            Value : reportData.Year ? reportData.Year : reportData.Month,
            EndDate : reportData.EndDate,
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

