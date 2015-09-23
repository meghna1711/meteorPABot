Router.configure({
  loadingTemplate: 'loading',
  notFoundTemplate : '404',
  waitOn : function(){return Meteor.subscribe('profile')}

});

// Router.plugin('loading', {loadingTemplate: 'loading'});
Router.plugin('dataNotFound', {dataNotFoundTemplate: 'notFound'});
