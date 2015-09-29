var objectId = new Mongo.ObjectID();

Delete = new Meteor.Collection('delete' , {
    schema : {
        projectId: {type: objectId},
        ref: {type: String},
        after: {type: String},
        before: {type: String},
        created: {type: Boolean},
        deleted: {type: Boolean},
        forced: {type: Boolean},
        compare: {type: String},
        commits: {type: Object},
        repository: {
            id: {type: Number},
            name: {type: String},
            full_name: {type: String},
            owner: {
                name: {type: String},
                email: {type: String}
            },
            private: {type: Boolean},
            html_url: {type: String},
            description: {type: String},
            url: {type: String},
            created_at: {type: Date},
            updated_at: {type: Date},
            pushed_at: {type: Date},
            open_issues: {type: Number},
            watchers: {type: Number},
            default_branch: {type: String},
            master_branch: {type: String}
        },
        pusher: {
            name: {type: String},
            email: {type: String}
        }
    }
});