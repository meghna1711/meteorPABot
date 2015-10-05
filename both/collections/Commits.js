var objectId = new Mongo.ObjectID();

Commits = new Meteor.Collection('commits' , {
   schema : {
       projectId: objectId,
       id: {type: String},
       distinct: {type: Boolean},
       message: {type: String},
       timestamp: {type: Date},
       url: {type: String},
       author: {
           name: {type: String},
           email: {type: String},
           username: {type: String} },
       committer: {
           name: {type: String},
           email: {type: String},
           username: {type: String}},
       added: [
           {type: String}
       ],
       removed: [
           {type: String}
       ],
       modified: [
           {type: String}
       ]
   }
});