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
        for(var i=2015 ; i>= 1990 ; i--){
            year.push(i);
        }
        return year;
    }
});

Template.dateReport.events({

    'click #getDateReport' : function(e){
        e.preventDefault();

        var data = {
            date : +$('#selectDate').val(),
            month : $('#selectMonth').val(),
            year : +$('#selectYear').val()
        },
            projectKey = $('#selectProject').val();
        console.log(">>>>>>>>>>>>>>>date>>>>>>>>>>>>>>>",data);
        generateCommitsReportForTheDate(projectKey , data);

        Router.go('showReport' , {projectKey : projectKey});
    }
});

var generateCommitsReportForTheDate = function(projectKey , date){
    var dateCommits = new dateReport();
    dateCommits.Date = ''+date.date+', '+date.month+', '+date.year;
    var commitResult, regex = new RegExp("^"+date.year+'-'+date.month+'-'+date.date+'(.*)');
    commitResult = Commits.find({projectId : projectKey  , timestamp : {$regex : regex}}).fetch();
    console.log(commitResult);

    if(commitResult){
        dateCommits.Total = commitResult.length;
        commitResult.forEach(function (value) {
            var commitDate=new Date(value.timestamp);
            var index=commitDate.getHours();
            console.log(index);
            dateCommits.Hour[index].Total+=1;
            if(value.added.length>0){
                dateCommits.Added+=1;
                dateCommits.Hour[index].Added+=1;
            }
            if(value.removed.length>0){
                dateCommits.Removed+=1;
                dateCommits.Hour[index].Removed+=1;
            }
            if(value.modified.length>0){
                dateCommits.Modified+=1;
                dateCommits.Hour[index].Modified+=1;
            }
        });
        console.log(dateCommits);
        reportService.setReportData(dateCommits);
    }
};