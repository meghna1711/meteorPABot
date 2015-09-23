Template._errors.helpers({
    errors: function() {
        return Errors.find();
    }
});

Template.error.rendered = function() {
    console.log("errors rendered");
    var error = this.data;
    Meteor.setTimeout(function () {
        Errors.remove(error._id);
    }, 10000);
};