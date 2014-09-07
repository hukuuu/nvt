$(function () {

	var parsleyBlock = $(".query-search-block");
	ScpCommon.applySelect2(parsleyBlock, ScpCommon.context.select2options);
	
    var voucherResultContainer = $("#voucherResultContainer");
    var voucherTemplate = $("#voucherTableTmpl");
    var voucherResult = new VoucherResult(voucherResultContainer, voucherTemplate, ScpCommon.context.searchUrl, parsleyBlock, "VOUCHER", true);
    voucherResult.initFilter();
    
    var topupResultContainer = $("#topUpResultContainer");
    var topupTemplate = $("#topupTableTmpl");
    var topupResult = new TopupResult(topupResultContainer, topupTemplate, ScpCommon.context.searchUrl, parsleyBlock,"TOPUP", true);
    topupResult.initFilter();
    
    $("#tabContaier").tabs();
    $('#tabs').tab();
    
    $("#search").click();
   
    var noOfAgentOptions = _.keys(ScpCommon.context.select2options["select.agent-select2"]).length
    
    if(noOfAgentOptions <= 1){
    	$("#agentCodeDiv").hide();
    }
    
  
    
    
   
});

