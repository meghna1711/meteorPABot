var projectKey="";
Template.removeProject.helpers({
    'project' : function(){
        projectKey = this.projectKey;
        return this;
    }
});

Template.removeProject.events({
    'submit form' : function(e){
        e.preventDefault();
        console.log("button pressed !!");

        Meteor.call('removeProject' , projectKey , function(err){
            if(err){
                throwError("Project cannot be deleted !!");
            }else {
                throwError("Project is successfully Deleted !!");
            }
        });

        Router.go('viewProject');
    }
});