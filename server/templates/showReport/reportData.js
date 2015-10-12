 getCommitsReport = function(projectKey , date){
    var dateCommits = new commitReport();
    dateCommits.Month = ''+date.fromMonth+', '+date.fromYear;
    dateCommits.StartDate = '' + date.fromYear + ', ' + date.fromMonth + ', ' + date.fromDate;
    dateCommits.EndDate = '' + date.toYear + ', ' + date.toMonth + ', ' + date.toDate;
    dateCommits.noOfDays=new Date(date.fromYear,date.fromMonth,0).getDate();
    var commitResult, users = [], startdate = new Date(date.fromYear, date.fromMonth-1, date.fromDate),
    //endDate should include 23hrs of that day
        enddate = new Date(date.toYear, date.toMonth-1 , date.toDate , 23 , 0);
    console.log("startdate>>>>"+startdate+">>>>EndDate >>>>"+enddate);
    commitResult = Commits.find({
        projectId: projectKey, timestamp: {
            $lte: new Date(enddate.toISOString()),
            $gte: new Date(startdate.toISOString())

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


/**
 *
 * Generating pie chart data for issue report
 *
 * */


 getIssuesReport = function(projectKey , date){
    var dateIssues = new issueReport();
    dateIssues.StartDate = '' + date.fromDate + ', ' + date.fromMonth + ', ' + date.fromYear;
    dateIssues.EndDate = '' + date.toDate + ', ' + date.toMonth + ', ' + date.toYear;
    var issueResult, users = [], startdate = new Date(date.fromYear, date.fromMonth-1, date.fromDate),
    //endDate should include 23hrs of that day
        enddate = new Date(date.toYear, date.toMonth-1, date.toDate , 23 , 0 , 0);
    console.log("issue report >>>>>>>>>>"+startdate + ">>>>>>>>" + enddate);
    issueResult = Issues.find({
        projectId : projectKey ,
        "issue.created_at" : {
            $lte : new Date(enddate.toISOString()),
            $gte : new Date(startdate.toISOString())

        }
    } , {$sort : {"issue.created_at" : 1}}).fetch();
    console.log("issue Result>>>>>");
    if(issueResult){
        issueResult.forEach(function(value){
            dateIssues.Comments+=value.issue.comments;
            if(value.issue.state === 'open'){
                dateIssues.Opened+=1;
            }
            if(value.issue.state === 'closed'){
                dateIssues.Closed+=1;
            }
            if(value.issue.updated_at !== null){
                dateIssues.Updated+=1;
            }
        });
    }
    console.log("issues report >>>>>" + dateIssues);
    issueService.setIssueData(dateIssues);
};




 issueService = {};
 issueService.setIssueData = function(data){
     issueData = data;
 };

 reportService = {};
 reportService.setReportData = function(data){
     console.log("setReportData function is called");
     reportData = data;
 };

