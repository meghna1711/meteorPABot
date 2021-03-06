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
        var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate+ " 23:59:59");
         var commit_data = Commits.find({projectId : this.projectKey,
            timestamp : {
                $lte : new Date(end_date.toISOString()),
                $gte : new Date(start_date.toISOString())
            }
        } , {$sort : {timestamp : 1}}).fetch();

        commit_data.forEach(function(value){
            value.timestamp = moment(value.timestamp).format("DD-MM-YYYY HH:MM");
            var issue_number = value.message.match(/#\d+/g);
            console.log(issue_number);
            if(issue_number){
                value.issue = [];
                for(var i=0 ; i<issue_number.length ; i++) {
                    var num = +issue_number[i].match(/\d+/);
                    console.log(num);
                    var issues = Issues.find({"issue.number": num}).fetch()[0];
                    if(issues) {
                        value.issue.push({number: "#" + num, title: issues.issue.title, url: issues.issue.html_url});
                    }
                }
            }
        });
        console.log(commit_data);
        return commit_data;
    },

    'OpenIssue' : function(){
        var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:59:59");
        var issues = Issues.find({
            projectId : this.projectKey,
            "issue.created_at" : {
                $lte : new Date(end_date.toISOString()),
                $gte : new Date(start_date.toISOString())
            },
            "issue.state" : "open"
        } , {$sort : {"issue.created_at" : 1}}).fetch();

        issues.forEach(function(value){
            value.issue.created_at = moment(value.issue.created_at).format("DD-MM-YYYY HH:MM");
            console.log(value.issue.created_at);
        });
        return issues;
    },

    'ClosedIssue' : function(){
        var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:59:59");
        var issues = Issues.find({
            projectId : this.projectKey,
            "issue.closed_at" : {
                $lte : new Date(end_date.toISOString()),
                $gte : new Date(start_date.toISOString())
            },
            "issue.state" : "closed"
        } , {$sort : {"issue.created_at" : 1}}).fetch();

        issues.forEach(function(value){
            value.issue.closed_at = moment(value.issue.closed_at).format("DD-MM-YYYY HH:MM");
        });
        return issues;
    },

    'UpdatedIssue' : function(){
        var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:59:59");
        var issues = Issues.find({
            projectId : this.projectKey,
            "issue.updated_at" : {
                $lte : new Date(end_date.toISOString()),
                $gte : new Date(start_date.toISOString())
            }
        } , {$sort : {"issue.updated_at" : 1}}).fetch();

        console.log(issues);
        issues.forEach(function(value){
            value.issue.updated_at = moment(value.issue.updated_at).format("DD-MM-YYYY HH:MM");
        });
        return issues;
    },

    'CommentIssue' : function(){
        var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:59:59");
        var issues = Issues.find({
            projectId : this.projectKey,
            "issue.updated_at" : {
                $lte : new Date(end_date.toISOString()),
                $gte : new Date(start_date.toISOString())
            },
            "issue.comments" : {$ne : 0}
        } , {$sort : {"issue.updated_at" : 1}}).fetch();

        console.log(issues);
        issues.forEach(function(value){
            var comments = [];
            comments = Comments.find({
                issueId : value.issue.id ,
                created_at : {
                    $gte : new Date(start_date.toISOString()),
                    $lte : new Date(end_date.toISOString())
                }
            },{$sort : {created_at : 1}}).fetch();
            comments.forEach(function(doc){
                doc.created_at = moment(doc.created_at).format("DD-MM-YYYY HH:MM");
            });
            value.commentsData = comments;
        });

        return issues;
    },

    'usersHolidays' : function(){
        var user = Project.find({projectKey : this.projectKey}).fetch()[0].permission, holidays=[];
        for(x in user){
            var userHoliday = Profile.find({userId : x}).fetch()[0].leaveRecord;
            userHoliday.forEach(function(value){
                if(value.date >= new Date(reportData.StartDate) && value.date <= new Date(reportData.EndDate+" 23:59:59")){
                     holidays.push({name : Profile.find({userId : x}).fetch()[0].full_name , date : moment(value.date).format("DD-MM-YYYY") , reason : value.reason});
                }
            });
        }
        return holidays;
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

