$(function () {

    var queryResultContainer = $("#queryResultContainer");
    var template = $("#reportsTmpl");
    var parsleyBlock = $(".query-search-block");
    ScpCommon.applySelect2(parsleyBlock, ScpCommon.context.select2options);

    var queryResult = new QueryResult(queryResultContainer, template, ScpCommon.context.searchUrl, parsleyBlock, true);

    var timePeriods = new TimePeriods();

    queryResult.initFilter();

    if (ScpCommon.context.defaultTimePeriodIndex) {
        parsleyBlock.find("#period").select2("val", ScpCommon.context.defaultTimePeriodIndex);
        timePeriods.onChangeDatePeriod(ScpCommon.context.defaultTimePeriodIndex);
    }

    parsleyBlock.on("change", "#agentCode, #division", function() {
        if ($(this).attr("id") == "agentCode") {
            $("#division").select2('data', "");
        } else if ($(this).attr("id") == "division") {
            $("#agentCode").val("");
        }
        ScpCommon.showPlaceholderIfInputWithoutValue();
    });

    parsleyBlock.on("blur", "#agentCode", function () {
        $(this).val($(this).val().toUpperCase());
    });
    
    $("#reportType").change(function(e){

    	$("#division").select2('data', {}); 
    	$("#division").select2({ allowClear: true });
    	
    	$("#agentCode").val("");
    	$("#agentCode").focus().blur();
    	
    	$("#period").select2('data', {}); 
    	$("#period").select2({ allowClear: true });
    	$("#period").select2("val", 1);
    	setDefaultDate(1);
    	 
 	
    });
    
    function setDefaultDate(value){
    	$.each(ScpCommon.context.datePeriods, function(index, object) {
            if (object.index == value) {
                $("#dateFrom").val(object.startDateAsString);
                $("#dateTo").val(object.endDateAsString);
                ScpCommon.showPlaceholderIfInputWithoutValue();
            }
        });
    }

});