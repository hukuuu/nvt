$(function () {
	
    var queryResultContainer = $.findById("queryResultContainer");
    
    queryResultContainer.on('click', "a.refund", function() {
    	
    	$.blockUI();
    	
    	var localThis = $(this);
    	(new PNotify({
            title: ScpCommon.context.messages.currentPage.confirmationMessageTitle,
            text: ScpCommon.context.messages.currentPage.confirmationMessage,
            icon: 'icon-warning-sign',
            hide: false,
            confirm: {
            	confirm: true
            },
            buttons: {
            	closer: false,
            	sticker: false
            },
            history: {
            	history: false
            }
            })).get().on('pnotify.confirm', function() {
            	 
                 var data = localThis.attr("data-reference");
                 $.ajax({
                     url: ScpCommon.context.refundUrl,
                     contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                     data: {"reference" : data},
                     success: function (isRefunded) {
                         if (isRefunded) {
                             localThis.closest("tr[id^='tableRow']").find("[id^='status']").html(ScpCommon.context.messages.currentPage.refunded);
                             localThis.hide();
                             ScpCommon.showMessage(ScpCommon.context.messages.currentPage.successfulRefund, ScpCommon.context.messageTimeOut);
                         } else {
                             ScpCommon.showError(ScpCommon.context.messages.currentPage.unsuccessfulRefund);
                         }
                     }
                 });
                 $.unblockUI();
             	
                 
            }).on('pnotify.cancel', function() {
            	$.unblockUI();
            	return false;
            });

    });

    var template = $("#transactionTableTmpl");
    var parsleyBlock = $("#transactionFilter");
    ScpCommon.applySelect2(parsleyBlock, ScpCommon.context.select2options);

    var queryResult = new QueryResult(queryResultContainer, template, ScpCommon.context.searchUrl, parsleyBlock, true, true);

    new TimePeriods();

    queryResult.initFilter();

    parsleyBlock.on("blur", "#mobilePhoneNumber", function () {
        $(this).val($(this).val().replace(/\+|\-|\s/g, ''));
    });
});

