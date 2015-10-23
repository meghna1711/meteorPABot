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


SyncedCron.add(
    {
        name : "Entering Data into >>>Timesheet>>>",
        schedule : function(parser){
            return parser.text("at 2:01 pm every weekday");
        },
        job : function(intentedAt) {
            console.log("Preparing Data For TimeSheet");
            console.log(intentedAt);

            var GoogleSpreadsheet = Npm.require("google-spreadsheet");
            var days = ["Sunday" , "Monday" , "Tuesday" , "Wednesday" , "Thursday",  "Friday" , "Saturday"];

            var creds = {
                client_email: '309157398717-soocffkfmjfhhuvqsoe12jcj67av7kgf@developer.gserviceaccount.com',
                private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDXe9nK5zYw5+3s\nkEeq5knVWL4FtBJuIzjF8TE/UJq0y7vKlskf1dDVFl59KPhaSQfFe2ZOMh3v58ii\n15efv7JfEcGrDFFzt9MYNj4Vnkye1iMlH8GrnVxCRcEzeZvOX5ahasUTnzFc8VPN\nVBA5x3tLxVlfcN3SFzJ52nvkNOFHbOW3K3PvqxZLT0/p0i4DTyuyzmXdG0PXRCY7\nYozS18kkTsg/g8uqA5dyzxgMvimmJzxv0f7DPA/qLcPjnRqJ3gnPk6XrvPmQchiT\nNv2qnxSiaK9e4CUOYi3RrNHQQnOEbE2CIOJeCUdKTUpKlTuz6BFD2CIbcnUnWhig\ndITB1U8bAgMBAAECggEAS2L4/xOE0fdSNcEEUbXfftRdJoGpMP8Bjb6kDBKXDUl5\nmZbHJmwXc3Uv+Xmr6WpDXcOeNx0xfA0LFG14jlryfHAp4T2eAW3+XCod7lJDXA5u\nnT5O80tKS6U7wlZ5O+oVOMOxzvuSuYF0YBFY293+NLQGYG2MLUQQVLErRtt5NRMv\nsB9tA+R9/a1sZyfhl/MWDQd9YpDEog+Q7tOcluJ2AMzGQ8ZMPGdqhIxWYnNCBY38\nfRPVhW9gPOH5p+0+uVcyNdTbX/6WVW+27DQx8zaekngf3/PNCnqZjDXah9Cybi6o\nNlc/6JDAj2GXt4sv0GipSXpWoe7ebkpuhT+CofTHAQKBgQDt7c0UcfS5AiyevDhx\nodsYXFj+a70d/wP+wsTsM/tkgvs0i9V9sFhj5eXd4t8cp/+bDFORCEZrK51wSXT1\nOhShfSJwKbENZRWtz5+Ki6AGcCO5T9w6kBpyybIOI8xnFUhXzn/ylDdkBdpREmN8\nI7G+4kpwsMIccvypKG5C+bWSuQKBgQDn2aKl1zKAoicLs1vTm0hUXRiSBupOAi+B\ntJcRlh4rbU816BAGIRvZjsyzTJmB6FwhLQDPtB3GjOAbwQZOrx4irubsozVMPHGJ\ntyQQmrPTUf5ep7d9LlcMmLCNCLIjUDj39+Ckwk8yDIJCAVFJWUXvNWMsi61OMjYr\nOsVSBayWcwKBgQCeFohSElmRZ/Fv0w4J6opiCFIVUk7JFH16E722V9+sbB8vTc4f\ngkFotwNhx/GI39NFGQ6Zag8n/EXSquwsWFgG6NcuAXWjucuKvk56RsWgIXiLE5X3\nz3HTXVKSdJTG1WxI82suKe8X5Y+mmHpDrI/YjhD6CWggcQKR/swscjCD+QKBgQC6\n/CwP4jHJyn0BE8MwMyEvYPGq+8bF6T9VNUdNGKv2TC9BA4rA1rz2RhPTWyjGu5Zp\n7zijStlkw0MPPyqOFO+R+0skeDBI7sqGzdxZQ9tZx9wFjPAQFmqALzjcVbINhuqb\nGh/j4Q4sCCiZgSSEqmoblQwJ5hB8a0SCsuBm2Uqq/wKBgQCuCGs2HGcvfRMVusC9\nb7dgyaE1QgrJiOLJAHuU2P+S1+/d+cRJMPLSMAlpGwOLveQrJ2UA2ZepOedpT5VQ\naQuH3DE3ZHjTc8XFlZTDfR9CswQBUfAlEH/S77mkM5uoEj+wn3vkjzWFSeiNOkOr\n3eevDlYkaTOmWmPnvCD62clUaA\u003d\u003d\n-----END PRIVATE KEY-----\n"
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
                    sheet.addRow(1 , {"Day" : day , "Date" : date ,"Author" : "" , "Total Commits" : "" , "Issues Opened" : "" ,
                        "Issues Updated" : "" , "Issues Closed" : "" , "Comments" : ""} , Meteor.bindEnvironment(function(err){
                        if(err){
                            console.log(err);
                        }
                        else {
                            console.log("First row added");
                            for(var x in projectsData.permission){
                                console.log(x);
                                var profile = Profile.find({userId : x}).fetch()[0];
                                console.log("running for user >>>>>>>" + profile.full_name);
                                var commitsCount = Commits.find({projectId : projectsData.projectKey , "committer.username" : profile.github_username ,
                                    timestamp : { $gte : new Date(todayDate.getFullYear() , todayDate.getMonth() , todayDate.getDate()) }}).count();
                                var issuesOpened = Issues.find({projectId : projectsData.projectKey , "issue.user.login" : profile.github_username ,
                                    "issue.created_at" : {$gte : new Date(todayDate.getFullYear() , todayDate.getMonth() , todayDate.getDate())}}).count();
                                var issuesClosed =Issues.find({projectId : projectsData.projectKey , "issue.user.login" : profile.github_username ,
                                    "issue.closed_at" : {$gte : new Date(todayDate.getFullYear() , todayDate.getMonth() , todayDate.getDate())}}).count();
                                var issuesUpdated =Issues.find({projectId : projectsData.projectKey , "issue.user.login" : profile.github_username ,
                                    "issue.updated_at" : {$gte : new Date(todayDate.getFullYear() , todayDate.getMonth() , todayDate.getDate())}}).count();
                                var comments = Comments.find({
                                    "user.login": profile.github_username,
                                    "created_at" : {
                                        $gte : new Date(todayDate.getFullYear() , todayDate.getMonth() , todayDate.getDate())
                                    }
                                }).count();

                                sheet.addRow(1 , {"Day" : "" , "Date" : "" , "Author" : profile.full_name , "Total Commits" : commitsCount , "Issues Opened" : issuesOpened ,
                                    "Issues Updated" : issuesUpdated , "Issues Closed" : issuesClosed , "Comments" : comments}, function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                    console.log("commits data added !!!!!");
                                });
                            }
                        }
                    }));
            }));
            });
        }
    },
    {
    name:"Sending report of the day to client",
    schedule : function(parser){
        return parser.text("at 1:12 pm every weekday");
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