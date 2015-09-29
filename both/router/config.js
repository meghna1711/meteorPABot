Router.configure({
  loadingTemplate: 'loading',
  notFoundTemplate : '404',
  waitOn : function(){
    console.log('waiton is running!!');
    return Meteor.subscribe('profile')}
});

// Router.plugin('loading', {loadingTemplate: 'loading'});
Router.plugin('dataNotFound', {dataNotFoundTemplate: 'notFound'});
