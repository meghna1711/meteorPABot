Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

Profile = new Meteor.Collection("profile" , {
  schema : {
    userId : {type :String},
    address : {type : String},
    verified : {type : Boolean},
    picture : {type : String},
    given_name : {type : String},
    family_name : {type : String},
    full_name : {type : String},
    number : {type : String},
    residence_address : {type : String},
    about : {type : String},
    created  : {type : Number , default : +new Date()},
    isEnabled : {type: Boolean , default : true},
    leaveRecord: [
      {type : Date}
    ],
    roles : [
      {type : String}
    ]
  }
});
