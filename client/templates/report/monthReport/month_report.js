Template.monthReport.helpers({
    'project' : function(){
        return Project.find({});
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

Template.monthReport.events({
    'click #getMonthlyReport' : function(e){
        e.preventDefault();

        var data = {
            month : $('#selectMonth').val(),
            year : $('#selectYear').val()
            },
        projectKey = $('#selectProject').val();
        console.log(">>>>>>>>>>>>>>>month>>>>>>>>>>>>>>>",data);

        getCommitsReportForTheMonth(projectKey , data);
        Router.go('showReport' , {projectKey : projectKey});
    }
});

var getCommitsReportForTheMonth = function(projectId , month){
    var monthCommits = new monthlyReport();
    monthCommits.Month = ''+month.month+', '+month.year;
    var commitsResult, regex = new RegExp("^"+month.year+'-'+month.month+'(.*)');
    monthCommits.noOfDays=new Date(month.year,month.month,0).getDate();
    commitsResult = Commits.find({projectId : projectId , timestamp : {$regex : regex}}).fetch();
    console.log(commitsResult);

    if (commitsResult) {
        monthCommits.Total = commitsResult.length;
        commitsResult.forEach(function (value) {
            var commitDate = new Date(value.timestamp);
            var index = commitDate.getDate() - 1;
            monthCommits.Day[index].Total += 1;
            if (value.added.length > 0) {
                monthCommits.Added += 1;
                monthCommits.Day[index].Added += 1;
            }
            if (value.removed.length > 0) {
                monthCommits.Removed += 1;
                monthCommits.Day[index].Removed += 1;
            }
            if (value.modified.length > 0) {
                monthCommits.Modified += 1;
                monthCommits.Day[index].Modified += 1;
            }
        });

        reportService.setReportData(monthCommits);
        console.log(monthCommits);

    }
};