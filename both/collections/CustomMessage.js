CustomMessage = new Meteor.Collection('custommessage' , {
    schema : {
        projectId: {type: String},
        userId: {type: String},
        message: {type: String}
    }
});