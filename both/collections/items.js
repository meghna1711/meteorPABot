Items = new Mongo.Collection('items');

Items.helpers({

});

Items.before.insert(function (userId, doc) {
  doc.createdAt = moment().toDate();
});


Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

Profile = new Meteor.Collection("profile");