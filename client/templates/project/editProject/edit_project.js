var projectKey, permissionObj = {};

Permission = new Mongo.Collection(null);

Template.editProject.rendered = function(){
  Session.set('showModal' , false);
};

Template.editProject.helpers({
    'project' : function(){
        projectKey = this.projectKey;
        return this;
    },

    'users': function(){
        return Profile.find({});
    },

    'showModal' : function(){
       return Session.get('showModal');
    }
});

Template.editProject.events({
    'click .addUserAndPermission' : function(e){
        e.preventDefault();

        var permissionValue = $('#permissionfield').val(),
            userId = $('#UserId').val(),user,
            permission = [];

        permission = permissionValue.split(',');
        permissionObj[userId] = permission;
        console.log(permissionObj);
        user = Profile.find({userId : userId}).fetch()[0];
        Permission.insert({user : user.full_name , permission : permissionValue});
        $("#UserId").prop('selectedIndex' , -1);
        $('#permissionfield').val("");
    },

    'click #updateProject' : function(e){
        e.preventDefault();

        var projectData = {
            clientName : $('#client-name').val(),
            clientEmail : $('#client-email').val(),
            description : $('#project-description').val(),
            permission : permissionObj,
            release : [],
            repositories :
                [{
                    name : $('#repo-name').val(),
                    repoUrl : $('#repo-url').val()
                }] ,
            status : $('#status').val()
        };

        Meteor.call('updateProject' , projectData , projectKey , function(err){
            if(err){
                throwError("Project cannot be updated !!");
            }else {
                Session.set('showModal' , true);
            }
        });

        Permission.remove({});
    }
});


Template.popUpModal.helpers({
    'projectKey' : function(){
        return projectKey;
    }
});
