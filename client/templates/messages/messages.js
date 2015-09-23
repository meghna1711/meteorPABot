Template.messages.helpers({
    messages : function(){
        return Messages.find({room: Session.get("roomname")} , {sort : {ts : 1}});
    },

    todaysDate : function(){
        return new Date().toDateString();
    }
});

Template.message.helpers({
   time : function(){
       return this.ts.toLocaleTimeString();
   }
});