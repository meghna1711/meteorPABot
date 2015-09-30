Comments = new Meteor.Collection('comments' , {
    schema : {
        issueId: {type: Number},
        url: {type: String},
        html_url : {type: String},
        issue_url : {type: String},
        id : {type: Number},
        user: {
            login :{type: String},
            id:{type: Number},
            type:{type: String},
            site_admin:{type: String}
        },
        created_at : {type : Date},
        updated_at: {type : Date},
        body : {type : String}
    }
});
