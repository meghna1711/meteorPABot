Meteor.publishComposite("items", function() {
  return {
    find: function() {
      return Items.find({});
    }
    // ,
    // children: [
    //   {
    //     find: function(item) {
    //       return [];
    //     }
    //   }
    // ]
  }
});

Meteor.publish("rooms", function () {
  return Rooms.find();
});
Meteor.publish("messages", function () {
  return Messages.find({}, {sort: {ts: 1}});
});

Meteor.publish("profile" , function(){
  return Profile.find({});
});

Meteor.publish('project' , function(){
  return Project.find({});
});

Meteor.publish('commits' , function(){
  return Commits.find({});
});