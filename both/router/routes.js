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

Router.route('/payload', function(){
  var eventobj = this.request.body;
  this.response.end(JSON.stringify(eventobj));
  console.log(eventobj);
}, {
  where : 'server'
}).get(function(){
  var eventObj = this.request.query;
  this.response.end(JSON.stringify(eventObj));
  console.log(eventObj);
}).post(function(){
  var eventObj = this.request.body;
  this.response.end(JSON.stringify(eventObj));
  console.log(eventObj);
});

Router.plugin('ensureSignedIn', {
  only: ['dashboard']
});

