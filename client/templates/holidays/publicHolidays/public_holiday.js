Template.publicHolidays.helpers({
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
    'holidays' : function(){
        var holidays = PublicHolidays.find({} , {$sort : {date : 1}}).fetch();
        holidays.forEach(function(value){
            value.date = moment(value.date).format('DD-MM-YYYY');
        });
        return holidays;
    }
});


Template.publicHolidays.events({
    'submit form' : function(e){
        e.preventDefault();
        var date = +$(e.target).find('#selectDate').val(),
            month = +$(e.target).find('#selectMonth').val(),
            year = +$(e.target).find('#selectYear').val(),
            holidayData = {
                name : $(e.target).find('#name').val(),
                date : new Date(year , month , date).toISOString()
            };

        Meteor.call('publicHolidays' , holidayData , function(err){
            if(err){
                throwError("Public Holidays List cannot be updated");
            }
            else{
                console.log("data updated successfully");
            }
        });

    }
});