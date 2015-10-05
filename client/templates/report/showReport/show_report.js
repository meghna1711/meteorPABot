
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
            StartDate : reportData.StartDate,
            EndDate : reportData.EndDate,
            Total: reportData.Total,
            Added: reportData.Added,
            Modified: reportData.Modified,
            Removed: reportData.Removed
        }
    },

    'issueTabelData' : function(){
        return {
            Opened : issueData.Opened,
            Closed : issueData.Closed,
            Updated : issueData.Updated,
            Comments : issueData.Comments

        }
    },

    'Commits' : function(){
        var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate);
        return Commits.find({projectId : this.projectKey,
            timestamp : {
                $gte : new Date(start_date.toISOString()),
                $lte : new Date(end_date.toISOString())
            }
        } , {$sort : {timestamp : 1}});
    }

});

Template.showReport.rendered=function(){
    Session.set('barchart' , false);
    var report_data = reportData, issue_data = issueData;
    console.log(">>>>>>>>>>>>>>>>reportdata>>>>>>>>>>>>>>>",report_data);
    showPieChart("#piechartCommit", report_data);
    console.log(">>>>>>>>>>>>>>>>issuedata>>>>>>>>>>>>>>>",issue_data);
    showPieChart('#piechartIssue' , issue_data);
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

var getPieChartData = function (dataResult) {
    var colors = ["#33CC66" , '#FF9999' , '#00ccff' , "#244166" , "#A1951A" , "#FF0066" ];
    var data = [], i=0;
    if(dataResult.Label === "COMMIT") {
        var commit_data = dataResult.Commit;
        commit_data.forEach(function (value) {
            data.push({label: value.name, data: value.commit, color: colors[i++]})
        });

        if (data.length === 0) {
            return [{
                label: "",
                data: 0,
                color: colors[0]
            }];
        }

        else {
            console.log(data);
            return data;
        }
    }
    else if(dataResult.Label === 'ISSUE'){
        return [
            {
            label: "Comments",
            data: dataResult.Comments,
            color : colors[0]
            },
            {
                label : "Closed",
                data : dataResult.Closed,
                color : colors[2]
            },
            {
                label : "Updated",
                data : dataResult.Updated,
                color : colors[3]
            },
            {
                label : "Opened",
                data : dataResult.Opened,
                color : colors[1]
            }
        ];

    }
};

