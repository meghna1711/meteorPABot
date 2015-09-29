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

    'click #getDataReport' : function(e){
        e.preventDefault();

        var data = {
            date : +$('#selectDate').val(),
            month : +$('#selectMonth').val(),
            year : +$('#selectYear').val()
        },
            projectKey = $('selectProject').val();
        console.log(">>>>>>>>>>>>>>>date>>>>>>>>>>>>>>>",data);
        generateCommitsReportForTheDate(projectKey , data);
    }
});

var generateCommitsReportForTheDate = function(projectKey , date){
    var dateCommits = new dateReport();
    dateCommits.Date = ''+_date.date+', '+_date.month+', '+_date.year;
    var commitResult, regex = ''+date.year+'-'+date.month+'-'+date.date;
    commitResult = Commits.find({projectId : projectKey , timeStamp : {$regex : regex}}).fetch();
    console.log(commitResult);
};