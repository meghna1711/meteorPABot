var objectId = new Mongo.ObjectID();

Issues = new Meteor.Collection('issues' , {
    schema : {
        projectId: {type:objectId },
        action: {type: String},
        issue: {
            url: {type: String},
            id: {type: Number},
            number: {type: Number},
            title: {type: String},
            user: {
                login: {type: String},
                id: {type: Number},
                type: {type: String},
                site_admin: {type: Boolean}
            },
            labels: [
                {
                    url: {type: String},
                    name: {type: String},
                    color: {type: String}
                }
            ],
            state: {type: String},
            locked: {type: Boolean},
            assignee: {
                login: {type: String},
                id: {type: Number},
                type: {type: String},
                site_admin: {type: Boolean}
            },
            milestone: {
                url: {type: String},
                labels_url: {type: String},
                id: {type: Number},
                number: {type: Number},
                title: {type: String},
                description: {type: Object},
                creator: {
                    login: {type: String},
                    id: {type: Number},
                    type: {type: String},
                    site_admin: {type: Boolean}
                },
                open_issues: {type: Number},
                closed_issues: {type: Number},
                state: {type: String},
                created_at: {type: Date},
                updated_at: {type: Date},
                due_on: {type: Object}
            },
            comments: {type: Number},
            created_at: {type: Date},
            updated_at: {type: Date},
            closed_at: {type: Object},
            body: {type: String}
        },
        comment: {
            url: {type: String},
            html_url: {type: String},
            issue_url: {type: String},
            id: {type: Number},
            user: {
                login: {type: String},
                id: {type: Number},
                type: {type: String},
                site_admin: {type: Boolean}
            },
            created_at: {type: Date},
            updated_at: {type: Date},
            body: {type: Date}
        }
    }
});