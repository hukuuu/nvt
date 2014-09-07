$( document ).ready(function() {
	var docCode = $("#docCode").val();
	loadDocumentContents(docCode);
	
 });

function loadDocumentContents(documentId){
	$.ajax({
	    url: ScpCommon.baseUrl + "support/getDocument.htm",
	    dataType: "html",
	    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	    data: {'code': documentId},
	    error: function (jqXHR, textStatus, errorThrown) {
	        if(jqXHR.status == 403){
	            ScpCommon.showError(JSON.parse(jqXHR.responseText).message);
	        } else {
	            ScpCommon.showError(errorThrown);
	        }
	    },
	    success: function (data) {
	        var helpDocumentContent = $("#documentContent");
	        helpDocumentContent.html(data);
	    }
	});
}