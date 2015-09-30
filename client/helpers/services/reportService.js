reportService = {};
reportService.setReportData = function(data){
    console.log("setReportData function is called");
    reportData = data;
};

reportService.getReportdata = function(){
    console.log("getReportData function called!!");
    return reportData;
};