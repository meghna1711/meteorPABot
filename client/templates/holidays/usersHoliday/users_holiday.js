Template.usersHoliday.helpers({
    'Date' : function(){
        return ['01' , '02','03' , '04' , '05' , '06' , '07' , '08' , '09' , '10' , '11' ,'12' , '13' , '14' ,'15' , '16' , '17' ,'18' , '19',
        '20' , '21' ,'22','23','24','25','26','27','28','29','30','31'];
    },
    'Month' : function(){
        return ['00','01','02','03','04','05','06','07','08','09','10','11'];
    },
    'Year' : function(){
        var year=[];
        for(var i=2015 ; i<=2020 ; i++ ){
            year.push(i);
        }
        return year;
    },
    'user' : function(){
        return Profile.find({userId : Meteor.userId()}).fetch()[0];
    }
});

Template.usersHoliday.events({
    'submit form' : function(e){
        e.preventDefault();

        var date = +$(e.target).find('#selectDate').val(),
            month = +$(e.target).find('#selectMonth').val(),
            year = +$(e.target).find('#selectYear').val(),
            holidayData = {
                date : new Date(year , month , date+1).toISOString(),
                reason : $(e.target).find('#reason').val()
            };
        console.log(date +" "+ month + " " + year );
        console.log(holidayData);
        Meteor.call('userLeaveRecord' , holidayData , Meteor.userId() , function(err){
            if(err){
                console.log("user Leave Record not updated !!");
            }else {
                console.log('user leave record updated');
            }
        });
    }
});