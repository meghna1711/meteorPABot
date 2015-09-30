Template.yearReport.helpers({
    'project' : function(){
        return Project.find({});
    },

    'Year' : function(){
        var year = [];
        for(var i=2018 ; i>= 2000 ; i--){
            year.push(i);
        }
        return year;
    }
});

Template.yearReport.events({
    'click #getYearlyReport' : function(e){
        e.preventDefault();

        var year = $('#selectYear').val(),
            projectKey = $('#selectProject').val();

        console.log(">>>>>>>>>>>>>>>year>>>>>>>>>>>>>>>",year);
        getCommitsReportForTheYear(projectKey , year);

        Router.go('showReport' , {projectKey : projectKey});
    }
});

var  getCommitsReportForTheYear = function(projectKey , year){
    var yearCommits = new yearlyReport();
    yearCommits.Year = year;
    var commitsResult, regex = new RegExp("^"+year+'(.*)');
    console.log(regex +"  " + projectKey);
    commitsResult = Commits.find({projectId : projectKey , timestamp : {$regex : regex}}).fetch();
    console.log(commitsResult);

    if(commitsResult){
        yearCommits.Total=commitsResult.length;
        commitsResult.forEach(function (value) {
            var commitDate=new Date(value.timestamp);
            var index=commitDate.getMonth();
            yearCommits.Month[index].Total+=1;
            if(value.added.length>0){
                yearCommits.Added+=1;
                yearCommits.Month[index].Added+=1;
            }
            if(value.removed.length>0){
                yearCommits.Removed+=1;
                yearCommits.Month[index].Removed+=1;
            }
            if(value.modified.length>0){
                yearCommits.Modified+=1;
                yearCommits.Month[index].Modified+=1;
            }
        });

        reportService.setReportData(yearCommits);
        console.log(yearCommits);
    }
};