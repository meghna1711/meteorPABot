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
        generateCommitsReport(projectKey , data);

        Router.go('showReport' , {projectKey : projectKey});
    }
});


var getCommitsReport = function(projectKey , date){
    var dateCommits = new monthlyReport();
    dateCommits.Month = ''+date.fromMonth+', '+date.fromYear;
    dateCommits.StartDate = '' + date.fromDate + ', ' + date.fromMonth + ', ' + date.fromYear;
    dateCommits.EndDate = '' + date.toDate + ', ' + date.toMonth + ', ' + date.toYear;
    dateCommits.noOfDays=new Date(date.fromYear,date.fromMonth,0).getDate();
    var commitResult, startdate = new Date(date.fromYear, date.fromMonth - 1, date.fromDate + 1),
        enddate = new Date(date.toYear, date.toMonth - 1, date.toDate + 1);
    console.log("startdate>>>>"+startdate.toISOString()+">>>>EndDate >>>>"+enddate.toISOString());
    commitResult = Commits.find({
        projectId: projectKey, timestamp: {
            $gte: new Date(startdate.toISOString()),
            $lte: new Date(enddate.toISOString())
        }
    },{$sort : {timestamp : 1}}).fetch();
    console.log("commit Result>>>>>" + commitResult);

    if (commitResult) {
        dateCommits.Total = commitResult.length;
        commitResult.forEach(function (value) {
            var commitDate = new Date(value.timestamp);
            var index = commitDate.getDate() - 1;
            dateCommits.Day[index].Total += 1;
            if (value.added.length > 0) {
                dateCommits.Added += 1;
                dateCommits.Day[index].Added += 1;
            }
            if (value.removed.length > 0) {
                dateCommits.Removed += 1;
                dateCommits.Day[index].Removed += 1;
            }
            if (value.modified.length > 0) {
                dateCommits.Modified += 1;
                dateCommits.Day[index].Modified += 1;
            }
        });

        console.log("date commit for single month >>>>>"+dateCommits);
        reportService.setReportData(dateCommits);
    }
};