Router.route('/', {
  name: 'login',
  layoutTemplate : 'loginTemplate'
});

Router.route('/github-signin' ,{
  name:'githubData',
  layoutTemplate : 'loginTemplate'
});


Router.route('/dashboard', {
  name: 'dashboard',
  layoutTemplate : 'mainLayout',
  data : function(){return Profile.find({}) }
});

Router.route('/dashboard/profile', {
  name:'profile',
  layoutTemplate : 'mainLayout'
});

Router.route('/project/addproject' , {
  name : 'addProject',
  layoutTemplate : 'mainLayout',
  waitOn : function(){
    return Meteor.subscribe('project');
  }
});






/**
 * edit project when project key is passed
 * */
Router.route('/project/editProject/:projectKey' , {
  name : 'editProject',
  layoutTemplate : 'mainLayout',
  data : function(){return Project.findOne({projectKey : this.params.projectKey})},
  waitOn : function(){
    return Meteor.subscribe('project');
  }
});





/**
 * edit project when project key is not passed
 * */


Router.route('/project/viewProject',{
  name : 'viewProject',
  layoutTemplate : 'mainLayout',
  waitOn : function(){
    return Meteor.subscribe('project');
  }
});




Router.route('/project/viewProject/showProject/:projectKey',{
  name : 'showProject',
  layoutTemplate : 'mainLayout',
  data : function(){return Project.findOne({projectKey : this.params.projectKey})},
  waitOn : function(){
    return Meteor.subscribe('project');
  }
});




Router.route('/project/removeProject/:projectKey',{
  name : 'removeProject',
  layoutTemplate : 'mainLayout',
  data : function(){
    return Project.findOne({projectKey : this.params.projectKey});
  },
  waitOn : function(){
    return Meteor.subscribe('project');
  }
});







/**
 * Routes for generating Report
 * */



Router.route('/report/dateReport' , {
  name : 'dateReport',
  layoutTemplate : 'mainLayout',
  waitOn : function(){
    return [
      Meteor.subscribe('project'),
      Meteor.subscribe('issues'),
      Meteor.subscribe('commits')
    ];
  }
});

Router.route('/user/leave' , {
  name : 'usersHoliday',
  layoutTemplate : 'mainLayout'
});


Router.route('/report/showReport/:projectKey' , {
  name : 'showReport',
  layoutTemplate : 'mainLayout',
  data : function(){
    return Project.findOne({projectKey : this.params.projectKey});
  },
  waitOn : function(){
    return [
      Meteor.subscribe('project'),
      Meteor.subscribe('issues'),
      Meteor.subscribe('comments'),
      Meteor.subscribe('commits')
    ];
  }
});






/**
 *
 * Server side Routes
 *
 * */



Router.route('/payload/settings/hooks/:id', function(){
  var eventobj = this.request.body;
  console.log("Github sends data to project with id >>>>>>>  " + this.params.id);
  Meteor.call('repoData' , eventobj , this.params.id , function(err){
    if(err){
      console.log("Data from github cannot be saved !!" + err);
    }else {
      console.log("Data from Github saved successfully !!");
    }
  });
  console.log(">>>>>>>>>>> Database updated >>>>>>>>>>>>");
  this.response.end("Good Work Github");
  this.response.end(eventobj);
 // console.log(eventobj);
}, {
  where : 'server'
});





Router.plugin('ensureSignedIn', {
  only: ['dashboard']
});

