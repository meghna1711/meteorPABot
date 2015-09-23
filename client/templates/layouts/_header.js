Template._header.helpers({
    'user' : function(){
        var user = Profile.find({userId : Meteor.userId()}).fetch();
        return user[0];
    }
});

Template._header.events({
    'click .logout_open' : function(e){
        e.preventDefault();

        Meteor.logout(function(err){
            if(err){
                throwError("Logout unsuccessful !! please try again later");
            }
            else {
                Router.go('login');
            }
        });

    }
});


Template._header.rendered = function(){
    $("#sidebar-toggle").click(function(e) {
        e.preventDefault();
        $(".navbar-side").toggleClass("collapsed");
        $("#page-wrapper").toggleClass("collapsed");
    });
};