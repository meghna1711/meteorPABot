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
            projectKey = $('selectProject').val();

        console.log(">>>>>>>>>>>>>>>year>>>>>>>>>>>>>>>",year);
        getCommitsReportForTheYear(projectKey , year);
    }
});

var  getCommitsReportForTheYear = function(projectKey , year){
    var yearCommits = new yearlyReport();
    yearCommits.Year = year;
    var commitsResult, regex = new RegExp("^"+year+'(.*)');
    console.log(regex);
    commitsResult = Commits.find({projectId : projectKey , timestamp : {$regex : regex}}).fetch();
    console.log(commitsResult);
};