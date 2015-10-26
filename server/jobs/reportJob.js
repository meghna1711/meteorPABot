Meteor.startup(function() {

    //Starting job when Meteor starts
    SyncedCron.start();

    Meteor.setTimeout(function () {
        SyncedCron.stop();
    }, 60 * 60 * 1000);
});


/**
 *
 * Cron configuration settings
 *
 * */

SyncedCron.config({
    log : true,
    utc : false
});


/**
 *
 * Adding Cron's jobs below by using add() function
 * */


/**
 * Cron jon for entering data into Projects Timesheet at 12:00 am every day
 * */

SyncedCron.add(
    {
        name : "Entering Data into >>>Timesheet>>>",
        schedule : function(parser){
            return parser.text("at 12:59 pm every weekday");
        },
        job : function(intentedAt) {
            console.log("Preparing Data For TimeSheet");
            console.log(intentedAt);

            var fs = Npm.require("fs");
            var GoogleSpreadsheet = Npm.require("google-spreadsheet");
            var days = ["Sunday" , "Monday" , "Tuesday" , "Wednesday" , "Thursday",  "Friday" , "Saturday"];
            var base = process.env.PWD;

            //reading JSON file from private folder containing client_email and private_key
            var file = JSON.parse(fs.readFileSync(base + "/private/creds.json" , "utf-8"));

            var creds = {
                client_email: file.client_email,
                private_key: file.private_key
            };

            var todayDate = new Date();

            var projects = Project.find({}).fetch();
            projects.forEach(function(project){
                var sheet = new GoogleSpreadsheet(project.timesheet.id);
                sheet.useServiceAccountAuth(creds , Meteor.bindEnvironment(function(err , result){
                    if(err){
                        console.log(err);
                    }
                    console.log(sheet);
                    var day = days[(new Date()).getDay()], date = moment(new Date()).format("DD-MM-YYYY");
                    var projectsData = project;
                    console.log("adding data to timesheet of project >>>>> " + projectsData.name);
                    if((new Date(todayDate).getDay()) == 0 || (new Date(todayDate).getDay()) == 6 ){
                        console.log("today is weekend");
                        sheet.addRow(1 ,
                            {
                                "Day" : ">>>>>>>>>>>>>>>>" ,
                                "Date" : ">>>>>>>>>>>>>>>>" ,
                                "Author" : ">>>>>>>>>>>>>>>>" ,
                                "Total Commits" : ">>>>>>>>>>>>>>>>" ,
                                "Issues Opened" : ">>>>> " +  day + ">>>>>",
                                "Issues Updated" : ">>>>>>>>>>>>>>>>",
                                "Issues Closed" : ">>>>>>>>>>>>>>>>" ,
                                "Comments" : ">>>>>>>>>>>>>>>>"
                            }, function(err){
                                if(err){
                                    console.log(err);
                                }
                                console.log("commits data added !!!!!");
                            });
                    }else {
                        sheet.addRow(1,
                            {
                                "Day": day,
                                "Date": date,
                                "Author": "---------------------",
                                "Total Commits": "---------------------",
                                "Issues Opened": "---------------------",
                                "Issues Updated": "---------------------",
                                "Issues Closed": "---------------------",
                                "Comments": "---------------------"
                            }, Meteor.bindEnvironment(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("First row added");
                                    for (var x in projectsData.permission) {
                                        var profile = Profile.find({userId: x}).fetch()[0];
                                        var onLeave = Profile.find({
                                            userId: x, leaveRecord: {
                                                $elemMatch: {
                                                    date: {
                                                        $gte: new Date(todayDate.getFullYear(), todayDate.getMonth(),
                                                            todayDate.getDate())
                                                    }
                                                }
                                            }
                                        }).fetch()[0];
                                        if (onLeave) {
                                            console.log(profile.full_name + " is on leave today");
                                            sheet.addRow(1,
                                                {
                                                    "Day": "",
                                                    "Date": "",
                                                    "Author": profile.full_name,
                                                    "Total Commits": "",
                                                    "Issues Opened": "          ON",
                                                    "Issues Updated": "        LEAVE",
                                                    "Issues Closed": "",
                                                    "Comments": ""
                                                }, function (err) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    console.log("commits data added !!!!!");
                                                });
                                        } else {
                                            console.log("running for user >>>>>>>" + profile.full_name);
                                            //counting total commits
                                            var commitsCount = Commits.find({
                                                projectId: projectsData.projectKey,
                                                "committer.username": profile.github_username,
                                                timestamp: {$gte: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())}
                                            }).count();

                                            //counting issues opened
                                            var issuesOpened = Issues.find({
                                                projectId: projectsData.projectKey,
                                                "issue.user.login": profile.github_username,
                                                "issue.created_at": {$gte: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())}
                                            }).count();
                                            var issuesClosed = Issues.find({
                                                projectId: projectsData.projectKey,
                                                "issue.user.login": profile.github_username,
                                                "issue.closed_at": {$gte: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())}
                                            }).count();

                                            //counting issues updated
                                            var issuesUpdated = Issues.find({
                                                projectId: projectsData.projectKey,
                                                "issue.user.login": profile.github_username,
                                                "issue.updated_at": {$gte: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())}
                                            }).count();

                                            //counting total comments
                                            var comments = Comments.find({
                                                "user.login": profile.github_username,
                                                "created_at": {
                                                    $gte: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
                                                }
                                            }).count();

                                            sheet.addRow(1, {
                                                "Day": "",
                                                "Date": "",
                                                "Author": profile.full_name,
                                                "Total Commits": commitsCount,
                                                "Issues Opened": issuesOpened,
                                                "Issues Updated": issuesUpdated,
                                                "Issues Closed": issuesClosed,
                                                "Comments": comments
                                            }, function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                console.log("commits data added !!!!!");
                                            });
                                        }
                                    }
                                }
                            }));
                    }
                }));
            });
        }
    });

SyncedCron.add( {
    name:"Sending report of the day to client",
    schedule : function(parser){
        return parser.text("at 12:17 pm every weekday");
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

            'Commits' : function(){
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate+ " 23:59:59");
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
                            if(issues) {
                                value.issue.push({
                                    number: "#" + num,
                                    title: issues.issue.title,
                                    url: issues.issue.html_url
                                });
                            }
                        }
                    }
                });
                console.log("commit data on server >>>>>>>>>>>>>" + commit_data);
                return commit_data;
            },

            'OpenIssue' : function(){
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:59:59");
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
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:59:59");
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
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:59:59");
                var issues = Issues.find({
                    projectId : projectKey,
                    "issue.updated_at" : {
                        $lte : new Date(end_date.toISOString()),
                        $gte : new Date(start_date.toISOString())
                    }
                } , {$sort : {"issue.updated_at" : 1}}).fetch();

                issues.forEach(function(value){
                    value.issue.updated_at = moment(value.issue.updated_at).format("DD-MM-YYYY HH:MM");
                });
                return issues;
            },

            'CommentIssue' : function(){
                var start_date = new Date(reportData.StartDate), end_date = new Date(reportData.EndDate + " 23:59:59");
                var issues = Issues.find({
                    projectId : projectKey,
                    "issue.updated_at" : {
                        $lte : new Date(end_date.toISOString()),
                        $gte : new Date(start_date.toISOString())

                    },
                    "issue.comments" : {$ne : 0}
                } , {$sort : {"issue.updated_at" : 1}}).fetch();

                issues.forEach(function(value){
                    var comments = [];
                    comments = Comments.find({
                        issueId : value.issue.id,
                        created_at : {
                            $gte : new Date(start_date.toISOString()),
                            $lte : new Date(end_date.toISOString())
                        }
                    },{$sort : {created_at : 1}}).fetch();

                    console.log("comments >>>>>>>>>" + comments);
                    comments.forEach(function(doc){
                        doc.created_at = moment(doc.created_at).format("DD-MM-YYYY HH:MM");
                    });
                    value.commentsData = comments;
                });
                console.log(issues);

                return issues;
            },

            'usersHolidays' : function(){
                var user = Project.find({projectKey : projectKey}).fetch()[0].permission, holidays=[];
                for(x in user){
                    var userHoliday = Profile.find({userId : x}).fetch()[0].leaveRecord;
                    userHoliday.forEach(function(value){
                        if(value.date >= new Date(reportData.StartDate) && value.date <= new Date(reportData.EndDate+" 23:59:59")){
                            holidays.push({name : Profile.find({userId : x}).fetch()[0].given_name , date : moment(value.date).format("DD-MM-YYYY") , reason : value.reason});
                        }
                    });
                }
                return holidays;
            }

        });

        console.log("templates binded >>>>>");

        var emailReport;

        var projects = Project.find({}).fetch(),
            todayDate = new Date(),
            holidayYesterday = PublicHolidays.find({date : new Date(todayDate.getFullYear(),todayDate.getMonth() , todayDate.getDate()-1) }).count(),
            holidayToday = PublicHolidays.find({date : new Date(todayDate.getFullYear(),todayDate.getMonth(),todayDate.getDate())}).count(),
            date = {
                fromDate: (holidayYesterday > 0) ? ((todayDate.getDay() == 1 ) ? todayDate.getDate()-3 : todayDate.getDate()-1) :
                    ((todayDate.getDay() ==1) ? todayDate.getDate()-2 : todayDate.getDate()),
                fromMonth: todayDate.getMonth()+1,
                fromYear: todayDate.getFullYear(),
                toDate: todayDate.getDate(),
                toMonth: todayDate.getMonth()+1,
                toYear: todayDate.getFullYear()
            };

        // console.log("holiday >>>>> " + holidayToday);
        console.log(date.fromDate);

        //Dont send email if today is holiday
        if( holidayToday == 0 ) {
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
                console.log("email sent to client at address" + value.clientEmail);
            });
        }
        else{
            console.log(">>>>>>>>  today is a holiday  >>>>>>>>>>>>");
        }

    }
});

var projectKey;