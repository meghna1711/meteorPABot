var permissionObj = {}, projectKey = "";


/**
 * Client side permission collection for defining users permission
 * */

Permission = new Mongo.Collection(null);

Template.addProject.rendered = function(){
    Session.set('showModal', false);
    Session.set('counter' , 0);
};


/**
 * Helpers of addPRoject Template
 * */


Template.addProject.helpers({
    'users' : function(){
        return Profile.find({});
    },

    'showModal' : function(){
        return Session.get('showModal');
    }
});



/**
 * Events of addProject Template
 * */

Template.addProject.events({
   'click .submit' : function(e){
       e.preventDefault();

       var projectData = {
           name : $('#project-name').val(),
           clientName : $('#client-name').val(),
           clientEmail : $('#client-email').val(),
           description : $('#project-description').val(),
           projectKey : Random.hexString(12),
           permission : permissionObj,
           release : [],
           repositories :
               [{
                   name : $('#repo-name').val(),
                   repoUrl : $('#repo-url').val()
               }] ,
           startDateTimeStamp : +new Date(),
           status : 'created'
           };

       projectKey = projectData.projectKey;

       console.log(projectKey);
       Meteor.call('addProject' , projectData , function(err){
           if(err){
               throwError("Project Not created Successfully")
           }
           else {
               Session.set('showModal' , true);
           }
       });

       $('#project-name').val("");
       $('#client-name').val("");
       $('#client-email').val("");
       $('#project-description').val("");
       $('#repo-name').val("");
       $('#repo-url').val();
       Permission.remove({});
   },

    'click .addUserAndPermission' : function(e){
        e.preventDefault();

        var permissionValue = $('#permissionfield').val(),
            userId = $('#UserId').val(),user,
            permission = [];

        permission = permissionValue.split(',');
        permissionObj[userId] = permission;
        user = Profile.find({userId : userId}).fetch()[0];
        Permission.insert({user : user.full_name , permission : permissionValue});
        $("#UserId").prop('selectedIndex' , -1);
        $('#permissionfield').val("");
    }
});



/**
 * usersWithPermission Template helpers
 * */

Template.usersWithPermission.helpers({
    'permissionTable' : function(){
        return Permission.find({});
    }

});


/**
 * popUpModal Template
 * */

Template.popUpModal.helpers({
   'projectData' : function(){
       return Project.find({projectKey : projectKey}).fetch()[0];
   }
});

Template.popUpModal.rendered = function(){
    $('#projectKeyModalPopup').modal('show');
};