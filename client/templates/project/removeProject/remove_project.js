Template.removeProject.helpers({
    'projects' : function(){
        if(_.isEmpty(this)) {
            return Project.find({});
        }
        else {
            console.log('projects called');
            return false;
        }
    },
    'project' : function(){
        return this;
    }
});

Template.removeProject.events({
    'submit form' : function(e){
        e.preventDefault();
        console.log("button pressed !!");

        var project = $(e.target).find('#selectedProject').val();
        Meteor.call('removeProject' , project , function(err){
            if(err){
                throwError("Project cannot be deleted !!");
            }else {
                throwError("Project is successfully Deleted !!");
            }
        });
    }
});