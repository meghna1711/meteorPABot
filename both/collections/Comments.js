Comments = new Meteor.Collection('comments' , {
    schema : {
        projectId: {type: String},
        userId: {type: String},
        message: {type: String}
    }
});
