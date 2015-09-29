Template.showProject.helpers({
    'project' : function(){
        return this;
    },

    'permissionTable' : function(){
        var project = this,
            repodata = project.permission, permissionTable = [];
        for(x in repodata){
            var permission = {
                user : Profile.find({userId : x}).fetch()[0].full_name,
                permission : repodata[x]
            };
            permissionTable.push(permission);
        }
        return permissionTable;
    }
});
