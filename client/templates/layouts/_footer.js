Template._footer.events({
    'click .logout' : function(e){
        e.preventDefault();

        Meteor.logout(function(err){
            if(err){
                throwError("Logout unsuccessful !! please try again later");
            }
            else {
                Router.go('login');
            }
        })
    }
});



Template._footer.helpers({
    'user' : function(){
        var users = Profile.find({userId : Meteor.userId()}).fetch();
        return users[0] ;
    },
});