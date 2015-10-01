var pieChartData = [], i=-1;

Template.issueReport.helpers({
    'project' : function(){
        return this;
    },

    'pieChartData' : function(){
        return pieChartData;
    },

    'showCharts' : function(){
        return Session.get('showCharts');
    }
});

Template.issueReport.rendered = function(){
    Session.set('showCharts' , false);
    var issues = Issues.find({projectId : "2df842e01e7d" }).fetch();
    console.log(issues);
    for(var i=0 ; i<issues.length ; i++){
       var data = generateIssueReport(issues[i]);
        pieChartData.push(data);
    }
    Session.set('showCharts' , true);
    console.log(pieChartData[1]);
};


var generateIssueReport = function(issue){
    console.log(issue);
    var newIssue = new issueReport();
    newIssue.Issue = issue.issue.title;
    newIssue.StartDate = issue.issue.created_at.substring(0,10);
    newIssue.TotalComments = issue.issue.comments;
    newIssue.Status = issue.issue.state;
    newIssue.CreatedBy = issue.issue.user.login;
    var comments, users=[], issue_id = issue.issue.id;
    comments = Comments.find({issueId : issue_id}).fetch();
    console.log(">>>Comments >>>> :"+comments);
    if(comments){
        comments.forEach(function(value){
            if(users.indexOf(value.user.login)<0){
                users.push(value.user.login);
                newIssue.Comment.push({name : value.user.login , comment : 0});
            }
        });
        for(var i=0 ; i<users.length ; i++){
            newIssue.Comment[i].comment = Comments.find({ issueId : issue_id , "user.login" : users[i]}).count();
        }
    }
    console.log(">>>>>newIssue data >>>>>"+newIssue);
    return newIssue;
};

var showPieChart = function (pieChartId, reportData) {
    var dataSet = getPieChartData(reportData);

    $.plot(pieChartId, dataSet, {
        series: {
            pie: {
                show: true
            }
        }
    });
};

var getPieChartData = function (reportData) {
    console.log(">>>>>get chart data called >>>");
    var colors = ["#33CC66" , '#FF9999' , '#00ccff' , "#244166" , "#A1951A" , "#FF0066" ];
    var data = [], comment_data = reportData.Comment, i=0;
    comment_data.forEach(function(value){
        data.push({label : value.name , data : value.comment , color : colors[i++]})
    });

    if(data.length === 0){
        return [{
            label : "",
            data : 0,
            color : colors[0]
        }];
    }

    else {
        console.log(">>>>>piechar data >>>" + data);
        return data;
    }
};

Template.piechart.rendered = function(){
    i++;
    console.log(">>>>>>>> PIE CHART TEMPLATE >>>>>>>>" + i);
    $('.piechartArea div#piechart').each(function(index){
        if(index === i) {
            $(this).addClass("piechart"+i);
            console.log("piechart class set to "+index);
        }
    });
        showPieChart('.piechart'+i , pieChartData[i]);
};