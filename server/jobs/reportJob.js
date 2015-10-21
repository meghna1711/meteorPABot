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
            return parser.text("at 12:31 am every weekday");
        },
        job : function(intentedAt) {
            console.log("Preparing Data For TimeSheet");
            console.log(intentedAt);


            var GoogleSpreadsheet = Npm.require("google-spreadsheet");
            var sheet = new GoogleSpreadsheet("1buAELq9AsthbRAzOq0g3fRXKi6b9btRdcisFujK7-X4");
            var days = ["Sunday" , "Monday" , "Tuesday" , "Wednesday" , "Thursday",  "Friday" , "Saturday"];

            var creds = {
                client_email: '309157398717-soocffkfmjfhhuvqsoe12jcj67av7kgf@developer.gserviceaccount.com',
                private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDOvtE79g2IOJjc" +
                "\n0SHghwLxjkDT1vEOxlGvKqv5Wsf7JCC5bqdqcKrDexmm9u4NrbDaP5PLhlRUn6cW\nrz8nMKCO+ZYXCAJy5JWFTVSRYTSziD1sq9WCoNviixlrWQ28EW1JcNYzLUsZsjcx" +
                "\nMAwh1QKedDkmHYSYP6LWehOAdoQuIQDlVVI+JE6iBW+yTUsrWfBUTpse0eyPC6ot\nsgi5SXtfQ8rjKhenu8JFDW5PCUrlfvutkBKWQ08cPnZgxL+w5AK2G82WvufLaWOw" +
                "\noxAFCLDbZa3uImavtZQYIpO72k15bH/hDPWoDC7fBrJma3A7ANGDB+2TxNsAdsB0\nwaoxoB1BAgMBAAECggEAZpHguIDQId8CZ7sRtZUF7tWGcBLZMV1OtTrUazeQs5Yu" +
                "\n7hBp2rLe5XCzP1SOshaUARM9veF9ASbb/LMg/85uOcC1p+N/Y4TocWP2KtIxFUjo\nQHvXx6EKthAQomNiHwX+VEs42dcExVDXdP3DZx2I2RgMKk7Gs8oOfZ2/AyLJXSB5" +
                "\nE/gc/SI7K6TjmO8NQ1kvsDoSH19ZoxRswooFcdofMKlvemc6s96NDC+WxTp5+Who\nG6R/2w5vjmAa/fdquLkrsTUByYepa0VS41Y8xo/bqlnTu3CX+eh9AKWT1riVacyc" +
                "\nRBfNY4TU96GhxD1Lkrri95R8tat3pTic0CVLM9vmqQKBgQD/IWpX1q8YCBxZib6Z\n/Tti0WYngwgxqGhVAkLeokQzCfpa+W80DLTXNFvP0rxF2iUCtx+DXJk/LKGKaIDs" +
                "\n67qLSfA3oqsp6fE4/s4vlPoGa2JSWXPF2kmYm87W32E8bLNVoJUe20vI1Cm1bM+f\n5fy5a56F+kbx/2C+WJuJAN2kEwKBgQDPczBmPvZqYOfZN/wBtR2Ja/dolwlbI8B7" +
                "\nVTyNsOuLLFr2aPHqlq/MWkZbujFXt6MXBf41UCIQ18pTVTt82mPOW+31rPO0aM8/\nLSdX2254F7EcNGLjtR700NI+7fr2i1xqEbLlBlY6Y09NBLO0HPf0nBG9DsJCAE/1" +
                "\nCK9KrMZb2wKBgQDLFQc4Skxv3azrXOjaXKeT3kjpdLTmCj6aREWEQDf3RJ8DIX/y\nN5cPor7ea8mv9Jf3VFsCTogxsE4aBVtyu6Vu0HklYBfNMknwa2smlvh6ean3EPtF" +
                "\n558jmgqIIaGd3ozVwRBSUo89mhxlLOsMRZ7o3ZB+5xzn7rdMbO3JnWXP/wKBgQDJ\n/vmTtZ8vOijHhBHof7jBBNYli1va2NclwHtz5F+WZpwz70AQEqYfL4/u5UACj5dI" +
                "\nZdd/hgWFrPkfZ5DDI8unNjBg1gV/F8clVwxGKi5I1ZjpQ8E+xC/eZi8yg3uo8U4N\nIiq1gxQXSnf/IKLysHpoPkevdV2F8tPoXoqBBfcnnQKBgCckZl4nZeDWOFNF5HEd" +
                "\n2HCPwo/dDtDxQ9QzkfLW1EC7eRVBUfwuSdnyowj35kJ8MnIVTgMkqLiYOCRCxm6+\nmXwjtpmzgOf3xrVVunaTUHvczlN06AjcImLJMWqFIRl7Q6OIHZgMmFfiGk6MqP6+" +
                "\nW9H5WZrW5EvdgN/M/JTSwjj8\n-----END PRIVATE KEY-----\n"
            };

            var todayDate = new Date();
            var projectsData = Project.find({projectKey : "2df842e01e7d" }).fetch()[0];
            console.log(projectsData);
            sheet.useServiceAccountAuth(creds , Meteor.bindEnvironment(function(err , result){
                if(err){
                    console.log(err);
                }
                console.log(sheet);
                var day = days[(new Date()).getDay()], date = moment(new Date()).format("DD-MM-YYYY");
                sheet.addRow(1 , {Day : day , Date : date} , function(err){
                    if(err){
                        console.log(err);
                    }else {
                        console.log("row added success fully !!!!!");
                    }
                });
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

                    console.log("commits > " + commitsCount + " issues opened > "+ issuesOpened + " issues updated > " + issuesUpdated +
                    " issue closed > " + issuesClosed + ' comments > ' + comments);
                    sheet.addRow(1 , {"Day" : "" , "Date" : "" , "Author" : profile.full_name , "Total Commits" : commitsCount , "Issues Opened" : issuesOpened ,
                        "Issues Updated" : issuesUpdated , "Issues Closed" : issuesClosed , "Comments" : comments}, function(err){});
                }
                }));

            //code for creating new spread sheet on google drive
            /*
            var fs = Npm.require('fs');
            var base = process.env.PWD;
            var file = fs.readFileSync(base + "/public/SpreadsheetTemplate.ods" , "ascii");

            var google = Npm.require('googleapis');
            var OAuth2 = google.auth.OAuth2;
            var oauth2Client = new OAuth2("309157398717-8no7vhadttoahu67p7qijkfvg7hq3m4c.apps.googleusercontent.com",
                "oeykpiw3OSF6dmDoS2VDN9p2", "http://localhost:3000/timesheet");

            var drive = google.drive({version: 'v2', auth: oauth2Client});

            var conv = Npm.require('ods2json');
            c = new conv;
            var json = c.convert(file, false, true);


            var url = oauth2Client.generateAuthUrl({
                access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
                scope : "https://www.googleapis.com/auth/drive.file"// If you only need one scope you can pass it as string
            });

            console.log("visit url : " + url);





            oauth2Client.setCredentials({
                access_token : "ya29.EgLOZi2I4CVCmwMnCRFOUcJgCbN9d4BiAK175SeP1Y9g0piQ0QxgLCXTCmTHv0tod0-p",
                refresh_token : '1/SnBjRPC11bGPiurQXVGHn9Tq4FXqzVfG_BRlzL5YL55IgOrJDtdun6zK6XiATCKT'
            });

            oauth2Client.refreshAccessToken(function(err, tokens) {
                console.log("refresed tokens >>>>>>>>>");
                console.log(tokens);
                insertFile();
            });


            function insertFile() {
                drive.files.insert({
                    resource: {
                        title: +new Date() + "timesheet.ods",
                        mimeType: "application/vnd.oasis.opendocument.spreadsheet",
                        body : json
                    },
                    media: {
                        mimeType: "application/vnd.oasis.opendocument.spreadsheet",
                        title : +new Date() + "timesheet.ods",
                        body: json
                    }
                }, function (err, response) {
                    if (err) {
                        console.log("error while creating spreadsheet" + err);
                    } else {
                        console.log(">>>>>>>>>>>>>file id from google spreadsheet >>>>>>>>>>>>" + response.id);
                    }
                });
            }
            */
        }
    },
    {
    name:"Sending report of the day to client",
    schedule : function(parser){
        return parser.text("at 10:00 am every weekday");
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