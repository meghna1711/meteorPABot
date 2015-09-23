Items.allow({
  'insert': function(userId, doc) {
    return userId;
  },
  'update': function(userId, doc, fields, modifier) {
    return userId;
  },
  'remove': function(userId, doc) {
    return userId;
  }
});

Rooms.deny({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc, fieldNames, modifier) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  }
});

Messages.deny({
  insert: function (userId, doc) {
    return (userId === null);
  },
  update: function (userId, doc, fieldNames, modifier) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  }
});

Messages.allow({
  insert: function (userId, doc) {
    return (userId !== null);
  }
});