Meteor.startup(function() {

  if(Rooms.find().count() === 0){
    Rooms.insert({roomname : 'admin'});
  }

    /**
     * Email configurations for sending mail during password recovery
     *
     * */

  smtp={
    username : "meghna@innox.io",
    password : "meghna1711",
    server : "smtp.gmail.com",
    port : 465
  };

  process.env.MAIL_URL="smtp://"+encodeURIComponent(smtp.username) + ":" +
      encodeURIComponent(smtp.password)+"@"+
      encodeURIComponent(smtp.server) + ":" + smtp.port;


  Meteor.methods({


      /**
       * Meteor method for creating profile of user
       * @user function params currently logged user Id
       * @account function params type of account
       * @address function params optional for github account
       * */


    'updateUser': function (user , account , address) {
      var userData = Meteor.users.find({_id: user}).fetch();

      if(Profile.find({userId:user}).count() === 0) {
        if (account === "google") {
          var userProfile = {
                userId: user,
                address: userData[0].services.google.email,
                verified: !!userData[0].services.google.verified_email,
                picture: userData[0].services.google.picture,
                given_name: userData[0].services.google.given_name,
                family_name: userData[0].services.google.family_name,
                full_name : userData[0].services.google.given_name + " " + userData[0].services.google.family_name,
                number : "",
                  residence_address : "",
                  about : "",
                  github_username : "",
                  created : +new Date(),
                  isEnabled : true,
                roles : ['Viewer']
              },
              emails = [{
                address: userProfile.address,
                verified: userProfile.verified
              }];

          Profile.insert(userProfile);
          Meteor.users.update({_id: user}, {$set: {emails: emails}});
        }
        else {
          var userProfile = {
              userId: user,
              address: address,
              verified: true,
              picture: "",
              given_name:userData[0].services.github.username ,
              family_name: "" ,
              full_name : "",
              number: "",
              residence_address: "",
              about: "",
              github_username : userData[0].services.github.username,
                  created : +new Date(),
                  isEnabled : true,
              roles : ['Viewer']
              },
              emails = [{
                  address : address,
                  verified : true
              }];

          Profile.insert(userProfile);
          Meteor.users.update({_id: user}, {$set: {emails : emails}});
        }
      }

    },


      /**
       * Meteor method for reseting password of account
       * @userId Id of currently logged user
       * @password New password of user
       * */

    'passwordReset' : function(userId , password){
      Accounts.setPassword(userId, password, function (err) {
        if (err) {
          console.log('We are sorry but something went wrong.');
        }
      });
    },


      /**
       * Meteor method for updating profile
       * */

    'profileUpdate' : function(userId, data){
      Profile.update({userId : userId} , {$set : data});
    },


      /**
       * Meteor method for changing profile picture of user
       * @url url from cloudinary where images are uploaded
       * */

    'changeProfilePicture' : function(userId , url){
      Profile.update({userId : userId} , {$set : {picture : url}});
    },


      /**
       * Meteor method for adding new projects in Project Collection
       * @projectData is object send by Client
       *
       * */

      'addProject' : function(projectData){
          Project.insert(projectData);
          console.log(projectData);
      },


      /**
       * Meteor method for updating project data
       * @projectData params Object send by Client
       * @projectKey params project key to be edited
       * */

      'updateProject' : function(projectData , projectKey){
          Project.update({projectKey : projectKey} , {$set : projectData});
          console.log(projectData);
      },


      /**
       * Meteor method to remove selected project
       * */

      'removeProject' : function(projectKey){
          Project.remove({projectKey : projectKey});
          console.log("project with Key " + projectKey + " successfully deleted ");
      },

      /**
       * Meteor method for saving data from Github
       * */

      'repoData' : function(data , projectKey){
          if(data.hasOwnProperty("head_commit")){
              var commit_data = data.head_commit;
              commit_data.timestamp = new Date(commit_data.timestamp);
              commit_data.projectId = projectKey;
              Commits.insert(commit_data);
              console.log("repoData " + commit_data);
          }
          else
          if(data.hasOwnProperty("issue")){
              console.log(">>>>>>> server method executed for issuess !! >>>>>>>>>>>>>>>>>>>>>");
              var issue_data = {
                  projectId: projectKey,
                  action: data.action,
                  issue: {
                      url: data.issue.url,
                      html_url : data.issue.html_url,
                      id: data.issue.id,
                      number: data.issue.number,
                      title: data.issue.title,
                      user: {
                          login: data.issue.user.login,
                          id: data.issue.user.id,
                          type: data.issue.user.type,
                          site_admin: data.issue.user.site_admin
                      },
                      labels: data.issue.labels,
                      state: data.issue.state,
                      locked: data.issue.locked,
                      assignee: data.issue.assignee === null ? null : {
                          login: data.issue.assignee.login,
                          id:  data.issue.assignee.id,
                          type:  data.issue.assignee.type,
                          site_admin: data.issue.assignee.site_admin
                          },
                      milestone: data.issue.milestone,
                      comments: data.issue.comments,
                      created_at: new Date(data.issue.created_at),
                      updated_at: new Date(data.issue.updated_at),
                      closed_at: new Date(data.issue.closed_at),
                      body: data.issue.body
                  },
                  comment: {
                      url: null,
                      html_url: null,
                      issue_url:  null,
                      id: null,
                      user: {
                          login: null,
                          id: null,
                          type:  null,
                          site_admin:  null
                      },
                      created_at: null,
                      updated_at: null,
                      body: null
                  }
              };

              if(Issues.find({"issue.id" : data.issue.id }).count() === 0 ){
                  Issues.insert(issue_data);
                  console.log(">>>>>>>> Issue Inserted >>>>>>>>>>>");
              }else
              if(data.hasOwnProperty('comment')){
                  issue_data.comment = {
                      url: data.comment.url,
                      html_url: data.comment.html_url,
                      issue_url:  data.comment.issue_url,
                      id: data.comment.id,
                      user: {
                          login: data.comment.user.login,
                          id: data.comment.user.id,
                          type:  data.comment.user.type,
                          site_admin: data.comment.user.site_admin
                      },
                      created_at: new Date(data.comment.created_at),
                      updated_at: new Date(data.comment.updated_at),
                      body: data.comment.body
                  };
                  Issues.update({"issue.id" : data.issue.id } , {$set : issue_data});
                  var comment = issue_data.comment;
                  comment.issueId = data.issue.id;
                  Comments.insert(comment);
                  console.log(">>>>>>>>>>>> Comment Inserted >>>>>>>>>>");
              } else {
                  Issues.update({"issue.id" : data.issue.id } , {$set : issue_data});
              }

              console.log(issue_data);
          }

      },

      'userLeaveRecord' : function(data , userId){
          Profile.update({userId : userId} , {$push : {leaveRecord : { date : new Date(data.date) , reason : data.reason}}});
      }

  });
});
