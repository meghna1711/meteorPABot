DailyReport = new Mongo.Collection('dailyReport'  , {

    schema : {
        projectId : {type : String},
        projectData : {type : Object},
        date : {type : Date},
        data : {type : String}

    }
    });
