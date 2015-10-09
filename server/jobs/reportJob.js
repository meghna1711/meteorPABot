Meteor.startup(function(){

    SyncedCron.start();

    Meteor.setTimeout(function(){
        SyncedCron.stop();
    }, 60*60*1000);

    Meteor.methods({
        'sendTemplate' : function(data , projectData){
            console.log(projectData);
            var project = DailyReport.find({projectId : projectData.projectKey}).fetch();
            var report = {
                projectId : projectData.projectKey,
                projectData : projectData,
                date : new Date(),
                data : data
            };

            if(project.length === 0) {
                DailyReport.insert(report);
            }else {
                DailyReport.update({projectId : projectData.projectKey} , {$set : report});
            }
        }
    });
});



SyncedCron.config({
    log : true,
    utc : false
});



SyncedCron.add({
    name:"Crunch some important numbers for marketing department",
    schedule : function(parser){
        return parser.text("at 12:00 am every weekday");
    },
    job : function(intentedAt){
        console.log("crunching numbers");
        console.log("job should be running at");
        console.log(intentedAt);

        var reports = DailyReport.find({}).fetch();

        reports.forEach(function(value){
            Email.send({
                to: value.projectData.clientEmail,
                from: "meghnagogna111@gmail.com",
                subject: "Today's project Report",
                html: value.data
            });
            console.log("report send to client" + value.projectData.clientEmail);
            DailyReport.remove({projectid : value.projectKey});
        });
    }
});
