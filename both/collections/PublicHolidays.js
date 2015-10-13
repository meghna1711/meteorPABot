PublicHolidays = new Meteor.Collection('publicHolidays' , {
    schema : {
        name : {type : String},
        date : {type : Date}
    }
});