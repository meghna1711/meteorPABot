Template.login.events({

    'submit form': function(e){
        e.preventDefault();

        var email = $(e.target).find('[name=email]').val(),
            password = $(e.target).find('[name=password]').val();

        Meteor.loginWithPassword(email , password , function(err){
            if(err){
                throwError("Login unsuccessful Due to incorrect password !!");
            } else {
                console.log("Account created successfully");
                Router.go('dashboard');
            }
        })
    },

    'click .login-google' : function(e){
        e.preventDefault();
        var account = "google";

        Meteor.loginWithGoogle({
            requestPermissions : ['email']
        } , function(err){
        if(err){
            throwError("Login unsuccessful !!");
        } else {
            console.log("Account created successfully");
            Meteor.call('updateUser' , Meteor.userId() , account);
            Router.go('dashboard');
        }
    });

},
    'click .login-github' : function(e){
        e.preventDefault();
        var account="github";

        Meteor.loginWithGithub({
            requestPermissions: ['user', 'public_repo']
        } , function(err){
            if(err){
                throwError("Login unsuccessful !!");
            } else {
                console.log("Account created successfully");
                Router.go('githubData');
            }
        });

    },

    'click .recovery' : function(e){
        e.preventDefault();
        var email = $('#email').val();
        Accounts.forgotPassword({email : email}, function(err) {
            if (err) {
                if (err.message === 'User not found [403]') {
                   throwError("This Email doesnot exist");
                } else {
                    throwError('We are sorry but something went wrong.');
                }
            } else {
                throwError('Email Sent. Check your mailbox.');
            }
        });

    }

});

