Meteor.startup(function() {

  if(Rooms.find().count() === 0){
    Rooms.insert({roomname : 'admin'});
  }

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
    'updateUser': function (user , account , address) {
      var userData = Meteor.users.find({_id: user}).fetch();

      if(Profile.find({userId:user}).count() === 0) {
        if (account === "google") {
          var userProfile = {
                userId: user,
                address: userData[0].services.google.email,
                verified: userData[0].services.google.verified_email,
                picture: userData[0].services.google.picture,
                given_name: userData[0].services.google.given_name,
                family_name: userData[0].services.google.family_name,
                number: "",
                city: "",
                state: "",
                residence_address: "",
                zip: "",
                about: "",
                website: ""
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
              number: "",
              city: "",
              state: "",
              residence_address: "",
              zip: "",
              about: "",
              website: "",
              username : userData[0].services.github.username},
              emails = [{
                  address : address,
                  verified : true
              }];

          Profile.insert(userProfile);
          Meteor.users.update({_id: user}, {$set: {emails : emails}});
        }
      }

    },

    'passwordReset' : function(userId , password){
      Accounts.setPassword(userId, password, function (err) {
        if (err) {
          console.log('We are sorry but something went wrong.');
        }
      });
    },

    'profileUpdate' : function(userId, data){
      Profile.update({userId : userId} , {$set : data});
    },

    'changeProfilePicture' : function(userId , url){
      Profile.update({userId : userId} , {$set : {picture : url}});
    }


  });
});
