
Project = new Meteor.Collection('project', {
    schema : {
        name: {type: String, required: true},
        clientName: String,
            clientEmail: {type: String, required: true},
        description: String,
            startDateTimeStamp: {type: Number, default: +new Date()},
        status: {type: String, default: "created"},
        timesheet : {
            id : {type : String},
            title : {type : String}
        },
        repositories: [
            {
                name: String,
                repoUrl: String
            }
        ],
            projectKey: String,
            permission: Object,
            //{uid1:['Admin','Engineer',''],
            // uid2:['Engineer']}
            release: [
            {
                url: {type: String},
                assets_url: {type: String},
                upload_url: {type: String},
                html_url: {type: String},
                id: {type: Number},
                tag_name: {type: String},
                target_commitish: {type: String},
                name: {type: String},
                draft: {type: Boolean},
                author: {
                    login: {type: String},
                    id: {type: Number},
                    type: {type: String},
                    site_admin: {type: Boolean}
                },
                prerelease: {type: Boolean},
                created_at: {type: Date},
                published_at: {type: Date},
                tarball_url: {type: String},
                zipball_url: {type: String},
                body: {type: String}
            }
        ]
    }
});