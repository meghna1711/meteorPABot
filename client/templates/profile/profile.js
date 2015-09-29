Template.profile.helpers({

    'user' : function(){
        var user = Profile.find({userId : Meteor.userId()}).fetch();
        return user[0];
    }

});

Template.profile.events({

    'submit .updateInformation' : function(e){
        e.preventDefault();

        var user = $(e.target),
            data={
                address : user.find('#email').val(),
                verified : true,
                picture : Profile.find({userId : Meteor.userId()}).fetch()[0].picture,
                given_name : user.find('#given_name').val(),
                family_name : user.find('#family_name').val(),
                full_name : user.find('#given_name').val() + " " + user.find('#family_name').val(),
                number : user.find('#number').val(),
                residence_address : user.find('#address').val(),
                about : user.find('#about').val(),
                website : user.find('#website').val(),
                github_username : user.find('#github_username').val()
    };

        Meteor.call('profileUpdate' , Meteor.userId() , data , function(err){
            if(err){
                throwError("Cannot update your profile . Please try again later !!");
            }
            throwError("Profile Updated Successfully !!");
            $('.overview').attr('aria-expanded' , "true");
        });

    },

        'submit .resetPassword': function(e) {
            e.preventDefault();

            console.log("submit works");
            var resetPasswordForm = $(e.target),
                oldPassword = resetPasswordForm.find('#oldPassword').val(),
                password = resetPasswordForm.find('#newPassword').val(),
                passwordConfirm = resetPasswordForm.find('#confirmPassword').val();

            if(password === passwordConfirm) {
                Meteor.call('passwordReset' , Meteor.userId() , password, function(err){
                    throwError("Login Again");
                    Router.go('login');
                });
            }
            return false;
        },

    /**
     * file upload event using cloudinary
     * */

    'change .cloudinary-fileupload' : function(e){
        var file = e.currentTarget.files;

        Cloudinary.upload(file, {} ,function(err , result){
            if(err){
                throwError("File upload stopped !! Try Again Later")
            }
            else {
                console.log(result.secure_url);
                Meteor.call('changeProfilePicture' ,Meteor.userId() , result.secure_url, function(err){
                    console.log("cannot call this method");
                })
            }
            });
    }
});