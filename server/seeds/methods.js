
/**
 * >>>>>>>>>>>>>>>>>>>>>>>> All Meteor Methods are defined in this file >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 *
 * */

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
       * @params user {String} user Id of currently loggedIn user
       * @params account {String} type of account
       * @params address {String} optional parameter for Github accounts type only
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
       * @params userId {String} Id of currently logged user
       * @params password {String} New password of user
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
       * @params userId {String} userId of user whose profile is being updated
       * @params data {Object} updated data
       * */

    'profileUpdate' : function(userId, data){
      Profile.update({userId : userId} , {$set : data});
    },


      /**
       * Meteor method for changing profile picture of user
       * @params userId {String} userId of user whose profile picture is changed
       * @params url {String} url of new image uploaded at Cloudinary
       * */

    'changeProfilePicture' : function(userId , url){
      Profile.update({userId : userId} , {$set : {picture : url}});
    },


      /**
       * Meteor method for adding new projects in Project Collection
       * @params projectData  {Object} projects data send by Client
       *
       * */

      'addProject' : function(projectData){
          Project.insert(projectData);
          console.log(projectData);

          //code for creating timesheet of this project
          var google = Npm.require('googleapis');
          var OAuth2 = google.auth.OAuth2;
          var oauth2Client = new OAuth2("309157398717-8no7vhadttoahu67p7qijkfvg7hq3m4c.apps.googleusercontent.com",
              "oeykpiw3OSF6dmDoS2VDN9p2", "http://localhost:3000/timesheet");

          var drive = google.drive({version: 'v2', auth: oauth2Client});

          console.log("setting credentials");

          oauth2Client.setCredentials({
              access_token : "ya29.EgLOZi2I4CVCmwMnCRFOUcJgCbN9d4BiAK175SeP1Y9g0piQ0QxgLCXTCmTHv0tod0-p",
              refresh_token : '1/SnBjRPC11bGPiurQXVGHn9Tq4FXqzVfG_BRlzL5YL55IgOrJDtdun6zK6XiATCKT'
          });

          console.log("refreshing access token ");
          oauth2Client.refreshAccessToken(Meteor.bindEnvironment(function(err, tokens) {
              console.log("refresed tokens >>>>>>>>>");
             // console.log(tokens);
              insertFile();
          }));

          console.log("creating timesheet file");

          function insertFile() {
              drive.files.insert({
                  resource: {
                      title: projectData.name+"-timesheet",
                      mimeType: "application/vnd.google-apps.spreadsheet"
                  },
                  media: {
                      mimeType: "application/vnd.google-apps.spreadsheet",
                      title : projectData.name+"-timesheet"
                  }
              }, Meteor.bindEnvironment(function (err, response) {
                  if (err) {
                      console.log("error while creating spreadsheet" + err);
                  } else {
                      console.log("file created");
                      fileTitle = response.title;
                      Project.update({projectKey : projectData.projectKey} , {$set : {timesheet : {id : response.id , title : response.title }}});
                      givePermissions(response.id);
                      // console.log(Project.find({projectKey : "2df842e01e7d"}));
                  }
              }));
          }

          function givePermissions(fileId){
              console.log("file Id >>>>>>>" + fileId);
              drive.permissions.insert({
                  fileId : fileId,
                  resource : {
                      role : "writer",
                      type : "user",
                      value : "309157398717-soocffkfmjfhhuvqsoe12jcj67av7kgf@developer.gserviceaccount.com"
                  }
              }, function(err , response){
                  if(err){
                      console.log(err);
                  }else {
                      console.log("permission granted !!!");
                  }
              });
              addHeaderRow();
          }


          function addHeaderRow(){
              var Spreadsheet = Npm.require("edit-google-spreadsheet");
              var sheetDetails = Project.find({projectKey : projectData.projectKey}).fetch()[0].timesheet;

              console.log("creating Spreadsheet and inserting header row");
              var creds = {
                  client_email: '309157398717-soocffkfmjfhhuvqsoe12jcj67av7kgf@developer.gserviceaccount.com',
                  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDXe9nK5zYw5+3s" +
                  "\nkEeq5knVWL4FtBJuIzjF8TE/UJq0y7vKlskf1dDVFl59KPhaSQfFe2ZOMh3v58ii\n15efv7JfEcGrDFFzt9MYNj4Vnkye1iMlH8GrnVxCRcEzeZvOX5ahasUTnzFc8VPN" +
                  "\nVBA5x3tLxVlfcN3SFzJ52nvkNOFHbOW3K3PvqxZLT0/p0i4DTyuyzmXdG0PXRCY7\nYozS18kkTsg/g8uqA5dyzxgMvimmJzxv0f7DPA/qLcPjnRqJ3gnPk6XrvPmQchiT" +
                  "\nNv2qnxSiaK9e4CUOYi3RrNHQQnOEbE2CIOJeCUdKTUpKlTuz6BFD2CIbcnUnWhig\ndITB1U8bAgMBAAECggEAS2L4/xOE0fdSNcEEUbXfftRdJoGpMP8Bjb6kDBKXDUl5" +
                  "\nmZbHJmwXc3Uv+Xmr6WpDXcOeNx0xfA0LFG14jlryfHAp4T2eAW3+XCod7lJDXA5u\nnT5O80tKS6U7wlZ5O+oVOMOxzvuSuYF0YBFY293+NLQGYG2MLUQQVLErRtt5NRMv" +
                  "\nsB9tA+R9/a1sZyfhl/MWDQd9YpDEog+Q7tOcluJ2AMzGQ8ZMPGdqhIxWYnNCBY38\nfRPVhW9gPOH5p+0+uVcyNdTbX/6WVW+27DQx8zaekngf3/PNCnqZjDXah9Cybi6o" +
                  "\nNlc/6JDAj2GXt4sv0GipSXpWoe7ebkpuhT+CofTHAQKBgQDt7c0UcfS5AiyevDhx\nodsYXFj+a70d/wP+wsTsM/tkgvs0i9V9sFhj5eXd4t8cp/+bDFORCEZrK51wSXT1" +
                  "\nOhShfSJwKbENZRWtz5+Ki6AGcCO5T9w6kBpyybIOI8xnFUhXzn/ylDdkBdpREmN8\nI7G+4kpwsMIccvypKG5C+bWSuQKBgQDn2aKl1zKAoicLs1vTm0hUXRiSBupOAi+B" +
                  "\ntJcRlh4rbU816BAGIRvZjsyzTJmB6FwhLQDPtB3GjOAbwQZOrx4irubsozVMPHGJ\ntyQQmrPTUf5ep7d9LlcMmLCNCLIjUDj39+Ckwk8yDIJCAVFJWUXvNWMsi61OMjYr" +
                  "\nOsVSBayWcwKBgQCeFohSElmRZ/Fv0w4J6opiCFIVUk7JFH16E722V9+sbB8vTc4f\ngkFotwNhx/GI39NFGQ6Zag8n/EXSquwsWFgG6NcuAXWjucuKvk56RsWgIXiLE5X3" +
                  "\nz3HTXVKSdJTG1WxI82suKe8X5Y+mmHpDrI/YjhD6CWggcQKR/swscjCD+QKBgQC6\n/CwP4jHJyn0BE8MwMyEvYPGq+8bF6T9VNUdNGKv2TC9BA4rA1rz2RhPTWyjGu5Zp" +
                  "\n7zijStlkw0MPPyqOFO+R+0skeDBI7sqGzdxZQ9tZx9wFjPAQFmqALzjcVbINhuqb\nGh/j4Q4sCCiZgSSEqmoblQwJ5hB8a0SCsuBm2Uqq/wKBgQCuCGs2HGcvfRMVusC9\n" +
                  "b7dgyaE1QgrJiOLJAHuU2P+S1+/d+cRJMPLSMAlpGwOLveQrJ2UA2ZepOedpT5VQ\naQuH3DE3ZHjTc8XFlZTDfR9CswQBUfAlEH/S77mkM5uoEj+wn3vkjzWFSeiNOkOr" +
                  "\n3eevDlYkaTOmWmPnvCD62clUaA\u003d\u003d\n-----END PRIVATE KEY-----\n"
              };


              //adding header Row to newly created spreadsheet
              Spreadsheet.load({
                  debug : true,
                  oauth : {
                      email : creds.client_email,
                      key : creds.private_key
                  },
                  spreadsheetId : sheetDetails.id,
                  worksheetName : "Sheet1"

              } ,function run(err , spreadsheet){
                  if(err){
                      console.log("error " +err);
                  }
                 // console.log(spreadsheet);
                  spreadsheet.add({1 : {1 : "Day" , 2 : "Date" , 3 : "Author" , 4 :"Total Commits" , 5 : "Issues Opened" , 6 : "Issues Updated" ,
                      7 : "Issues Closed" , 8 : "Comments"}});

                  spreadsheet.send(function(err){
                      if(err){
                          console.log("ERROR from spreadsheet" + err);
                      }else {
                          console.log("Header Row Created");
                      }
                  })
              });
          }
      },


      /**
       * Meteor method for updating project data
       * @params projectData {Object} project details send by Client
       * @params projectKey {String} unique project Key of each project
       * */

      'updateProject' : function(projectData , projectKey){
          Project.update({projectKey : projectKey} , {$set : projectData});
          console.log(projectData);
      },



      /**
       * Meteor method to remove selected project
       * @params projectKey {String} unique projectKey of each project
       *
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
              console.log(">>>>>>>>>>> Commit inserted !! >>>>>>>>>>>>>>>");
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


      /**
       * Meteor method for adding users Leave to their profile
       * @params data {Object} contains date and reason for leave
       * @params userId  {String} unique userId of each user
       *
       * */
      'userLeaveRecord' : function(data , userId){
          Profile.update({userId : userId} , {$push : {leaveRecord : { date : new Date(data.date) , reason : data.reason}}});
      },



      /**
       * Meteor method for adding  Public Holidays in publicHolidays Database
       * @params data {Object} contains date and description of holiday
       *
       * */
      'publicHolidays' : function(data){
          PublicHolidays.insert({name : data.name , date : new Date(data.date)});
      }
  });
});
