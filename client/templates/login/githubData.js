Template.githubData.events({
   'click .next' : function(e){
       e.preventDefault();

       var address = $('#github-email').val();
       console.log(address);
       Meteor.call('updateUser' , Meteor.userId() , "github" , address);
       Router.go('dashboard');
   }
});