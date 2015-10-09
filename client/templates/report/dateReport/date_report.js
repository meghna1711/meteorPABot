var start_date , end_date;

Template.dateReport.rendered = function(){
    $('#reportrange').daterangepicker({
            startDate: moment().subtract('days', 29),
            endDate: moment(),
            minDate: '01/01/2012',
            maxDate: '12/31/2017',
            dateLimit: {
                days: 60
            },
            showDropdowns: true,
            showWeekNumbers: true,
            timePicker: false,
            timePickerIncrement: 1,
            timePicker12Hour: true,
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                'Last 7 Days': [moment().subtract('days', 6), moment()],
                'Last 30 Days': [moment().subtract('days', 29), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
            },
            opens: 'left',
            buttonClasses: ['btn btn-default'],
            applyClass: 'btn-small btn-primary',
            cancelClass: 'btn-small',
            format: 'MM/DD/YYYY',
            separator: ' to ',
            locale: {
                applyLabel: 'Submit',
                fromLabel: 'From',
                toLabel: 'To',
                customRangeLabel: 'Custom Range',
                daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                firstDay: 1
            }
        },
        function(start, end) {
            console.log("Callback has been called!");
            start_date = new Date(start);
            end_date = new Date(end);
            console.log(start_date  + " >>>>>> " + end_date);
            console.log(">>>> Date >>>>>"+start_date.getDate());
            $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
    );

    //Set the initial state of the picker label
    $('#reportrange span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

};

Template.dateReport.helpers({
    'project' : function(){
        return Project.find({});
    }
});

Template.dateReport.events({

    'click #getDateReport' : function(e){
        e.preventDefault();

        var data = {
            fromDate : +start_date.getDate(),
            fromMonth : +start_date.getMonth() + 1,
            fromYear : +start_date.getFullYear(),
            toDate : +end_date.getDate(),
            toMonth : +end_date.getMonth() + 1,
            toYear : +end_date.getFullYear()
        },
            projectKey = $('#selectProject').val();
        console.log(projectKey);
        if(projectKey !== '-1') {
            console.log(">>>>>>>>>>>>>>>date>>>>>>>>>>>>>>>", data);
            getCommitsReport(projectKey, data);
            getIssuesReport(projectKey, data);

            Router.go('showReport', {projectKey: projectKey});
        }
        else {
            throwError("Please Select a Project !!");
        }
    }
});

/**
 *
 * Generating pie chart data for commit report
 *
 * */

var getCommitsReport = function(projectKey , date){
    var dateCommits = new commitReport();
    dateCommits.Month = ''+date.fromMonth+', '+date.fromYear;
    dateCommits.StartDate = '' + date.fromYear + ', ' + date.fromMonth + ', ' + date.fromDate;
    dateCommits.EndDate = '' + date.toYear + ', ' + date.toMonth + ', ' + date.toDate;
    dateCommits.noOfDays=new Date(date.fromYear,date.fromMonth,0).getDate();
    var commitResult, users = [], startdate = new Date(date.fromYear, date.fromMonth - 1, date.fromDate + 1),
    //endDate should include 23hrs of that day
        enddate = new Date(date.toYear, date.toMonth - 1, date.toDate + 1 , 23 , 0);
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

var getIssuesReport = function(projectKey , date){
    var dateIssues = new issueReport();
    dateIssues.StartDate = '' + date.fromDate + ', ' + date.fromMonth + ', ' + date.fromYear;
    dateIssues.EndDate = '' + date.toDate + ', ' + date.toMonth + ', ' + date.toYear;
    var issueResult, users = [], startdate = new Date(date.fromYear, date.fromMonth - 1, date.fromDate),
        //endDate should include 23hrs of that day
        enddate = new Date(date.toYear, date.toMonth - 1, date.toDate , 23 , 0 , 0);
    console.log("issue report >>>>>>>>>>"+startdate + ">>>>>>>>" + enddate);
    issueResult = Issues.find({
        projectId : projectKey ,
        "issue.created_at" : {
            $lte : new Date(enddate.toISOString()),
            $gte : new Date(startdate.toISOString())

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
            if(value.issue.updated_at !== null){
                dateIssues.Updated+=1;
            }
        });
    }
    console.log("issues report >>>>>" + dateIssues);
    issueService.setIssueData(dateIssues);
};