Meteor.startup(function() {
    var fs = Meteor.npmRequire('fs'),
        path = Npm.require('path'),
        base = path.resolve('.').split('.meteor')[0];

    SyncedCron.start();

    Meteor.setTimeout(function () {
        SyncedCron.stop();
    }, 60 * 60 * 1000);


});



SyncedCron.config({
    log : true,
    utc : false
});



SyncedCron.add({
    name:"Sending report of the day to client",
    schedule : function(parser){
        return parser.text("at 11:11 am every weekday");
    },
    job : function(intentedAt){
        console.log("preparing Data");
        console.log("job should be running at");
        console.log(intentedAt);


        //binding html file with template name 'showReport'
        SSR.compileTemplate('showReport', Assets.getText('show_report.html') , {language : 'html'});


        //Template 'showReport' helpers need to be defined after SSR.compileTemplate because if declared before it will not find the html file to which i
        //it is defined and shows errors "cannot find helpers of undefined"
        Template.showReport.helpers({
            'project' : function(){
                var project = Project.find({projectKey : projectKey}).fetch()[0];
                console.log("project is >>>>> " + project.name);
                return Project.find({projectKey : projectKey}).fetch()[0];
            },

            'permissionTable' : function(){
                var project = Project.find({projectKey : projectKey}).fetch()[0],
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
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate+ " 23:00:00");
                var commit_data = Commits.find({projectId : projectKey,
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
                            value.issue.push({ number : "#"+num , title : issues.issue.title , url : issues.issue.html_url});
                        }
                    }
                });
                console.log("commit data on server >>>>>>>>>>>>>" + commit_data);
                return commit_data;
            },

            'OpenIssue' : function(){
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:00:00");
                var issues = Issues.find({
                    projectId : projectKey,
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
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:00:00");
                console.log(reportData.StartDate + ">>>>>>>>>>>>" + reportData.EndDate);
                console.log(start_date + ">>>>>" + end_date);
                var issues = Issues.find({
                    projectId : projectKey,
                    "issue.closed_at" : {
                        $lte : new Date(end_date.toISOString()),
                        $gte : new Date(start_date.toISOString())
                    },
                    "issue.state" : "closed"
                } , {$sort : {"issue.created_at" : 1}}).fetch();

                issues.forEach(function(value){
                    value.issue.closed_at = moment(value.issue.closed_at).format("DD-MM-YYYY HH:MM");
                });

                console.log("closed issues on server >>>>>" + issues);
                return issues;
            },

            'UpdatedIssue' : function(){
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:00:00");
                var issues = Issues.find({
                    projectId : projectKey,
                    "issue.updated_at" : {
                        $lte : new Date(end_date.toISOString()),
                        $gte : new Date(start_date.toISOString())
                    },
                    "issue.updated_at" : {$ne : null}
                } , {$sort : {"issue.updated_at" : 1}}).fetch();

                issues.forEach(function(value){
                    value.issue.updated_at = moment(value.issue.updated_at).format("DD-MM-YYYY HH:MM");
                });
                return issues;
            },

            'CommentIssue' : function(){
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:00:00");
                var issues = Issues.find({
                    projectId : projectKey,
                    "issue.created_at" : {
                        $lte : new Date(end_date.toISOString()),
                        $gte : new Date(start_date.toISOString())

                    },
                    "issue.comments" : {$ne : 0}
                } , {$sort : {"issue.created_at" : 1}}).fetch();

                issues.forEach(function(value){
                    var comments = [];
                    comments = Comments.find({issueId : value.issue.id}).fetch();
                    comments.forEach(function(doc){
                        doc.created_at = moment(doc.created_at).format("DD-MM-YYYY HH:MM");
                    });
                    value.commentsData = comments;
                });
                return issues;
            }

        });


        var emailReport;

        var projects = Project.find({}).fetch(),
            todayDate = new Date(),
            date = {
                fromDate: todayDate.getDate(),
                fromMonth: todayDate.getMonth()+1,
                fromYear: todayDate.getFullYear(),
                toDate: todayDate.getDate(),
                toMonth: todayDate.getMonth()+1,
                toYear: todayDate.getFullYear()
            };

        projects.forEach(function (value) {
            getCommitsReport(value.projectId, date);
            getIssuesReport(value.projectId, date);

            console.log("project key >>>>>>>>>>" + value.projectKey);
            projectKey = value.projectKey;
            console.log("project Key >>>>>>>>>>>>" + projectKey);
            emailReport = SSR.render('showReport', {reportData: reportData});

            Email.send({
                to: value.clientEmail,
                from: "meghnagogna111@gmail.com",
                subject: "Today's project Report",
                html: emailReport
            });
            console.log("email sent to client at address"  + value.clientEmail);
        });

    }
});

var projectKey;