
Template.dateReport.helpers({
    'project' : function(){
        return Project.find({});
    },

    'Days' : function(){
        var days = ['01', '02', '03', '04', '05', '06',
            '07', '08', '09', '10', '11', '12', '13', '14',
            '15', '16', '17', '18', '19', '20', '21', '22',
            '23', '24', '25', '26', '27', '28', '29', '30',
            '31'];
        return days;
    },

    'Month' : function(){
        var month = ['01', '02', '03', '04', '05', '06',
            '07', '08', '09', '10', '11', '12'];
        return month;
    },

    'Year' : function(){
        var year = [];
        for(var i=2018 ; i>= 2000 ; i--){
            year.push(i);
        }
        return year;
    }
});

Template.dateReport.events({

    'click #getDateReport' : function(e){
        e.preventDefault();

        var data = {
            fromDate : +$('#selectFromDate').val(),
            fromMonth : +$('#selectFromMonth').val(),
            fromYear : +$('#selectFromYear').val(),
            toDate : +$('#selectToDate').val(),
            toMonth : +$('#selectToMonth').val(),
            toYear : +$('#selectToYear').val()
        },
            projectKey = $('#selectProject').val();
        console.log(">>>>>>>>>>>>>>>date>>>>>>>>>>>>>>>",data);
        getCommitsReport(projectKey , data);
        getIssuesReport(projectKey , data);

        Router.go('showReport' , {projectKey : projectKey});
    }
});


var getCommitsReport = function(projectKey , date){
    var dateCommits = new monthlyReport();
    dateCommits.Month = ''+date.fromMonth+', '+date.fromYear;
    dateCommits.StartDate = '' + date.fromYear + ', ' + date.fromMonth + ', ' + date.fromDate;
    dateCommits.EndDate = '' + date.toYear + ', ' + date.toMonth + ', ' + date.toDate;
    dateCommits.noOfDays=new Date(date.fromYear,date.fromMonth,0).getDate();
    var commitResult, users = [], startdate = new Date(date.fromYear, date.fromMonth - 1, date.fromDate + 1),
        enddate = new Date(date.toYear, date.toMonth - 1, date.toDate + 1);
    console.log("startdate>>>>"+startdate.toISOString()+">>>>EndDate >>>>"+enddate.toISOString());
    commitResult = Commits.find({
        projectId: projectKey, timestamp: {
            $gte: new Date(startdate.toISOString()),
            $lte: new Date(enddate.toISOString())
        }
    },{$sort : {timestamp : 1}}).fetch();
    console.log("commit Result>>>>>" + commitResult);

    //Commit Report

    if (commitResult) {
        dateCommits.Total = commitResult.length;
        commitResult.forEach(function (value) {
            if (value.added.length > 0) {
                dateCommits.Added += 1;
            }
            if (value.removed.length > 0) {
                dateCommits.Removed += 1;
            }
            if (value.modified.length > 0) {
                dateCommits.Modified += 1;
            }

            if(users.indexOf(value.committer.username)<0){
                users.push(value.committer.username);
                dateCommits.Commit.push({name : value.committer.username , commit : 0});
            }

        });

        for(var i=0 ; i<users.length ; i++){
            dateCommits.Commit[i].commit = Commits.find({ projectId : projectKey , "committer.username" : users[i]}).count();
        }

        console.log("commits on basis of user >>>>>" + dateCommits);
        reportService.setReportData(dateCommits);
    }
};

var getIssuesReport = function(projectKey , date){
    var dateIssues = new issueReport();
    dateIssues.StartDate = '' + date.fromDate + ', ' + date.fromMonth + ', ' + date.fromYear;
    dateIssues.EndDate = '' + date.toDate + ', ' + date.toMonth + ', ' + date.toYear;
    var issueResult, users = [], startdate = new Date(date.fromYear, date.fromMonth - 1, date.fromDate + 1),
        enddate = new Date(date.toYear, date.toMonth - 1, date.toDate + 1);
    issueResult = Issues.find({
        projectId : projectKey , "issue.created_at" : {
            $gte : new Date(startdate.toISOString()),
            $lte : new Date(enddate.toISOString())
        }
    } , {$sort : {"issue.created_at" : 1}}).fetch();
    console.log("issue Result>>>>>" + issueResult);
    if(issueResult){
        issueResult.forEach(function(value){
            dateIssues.Comments+=value.issue.comments;
            if(value.issue.state === 'open'){
                dateIssues.Opened+=1;
            }
            if(value.issue.state === 'closed'){
                dateIssues.Closed+=1;
            }
            if(value.issue.state === 'updated'){
                dateIssues.Updated+=1;
            }
        });
    }
    console.log("issues report >>>>>" + dateIssues);
    issueService.setIssueData(dateIssues);
};