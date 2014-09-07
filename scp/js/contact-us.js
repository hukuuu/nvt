$(function () {

    var container = $.findById("contact-us-content");

    container.on("click", "#sendMessage", function () {
//        if (validateAgentDetails(container) & validateAgentProfile(container)) {
            postAjax(container);
//        }
    });

    function postAjax(container) {
    	var dto = inputDetailsValuesToDto(container);
        $.ajax({
            url: ScpCommon.context.saveUrl,
            data: JSON.stringify(dto),
            success: function (data) {
                if (data.status == 'ERROR') {
                    ScpCommon.showError(data.message);
                } else {
                	ScpCommon.showMessage("Sucessfully displayed");
                }
            }
        });
    }
    
    function inputDetailsValuesToDto(container) {
       var contactUsDto = {};
       $.each($("#contactUsDetailsContainer :input"), function (index, value) {
           value = $(value);
           if (ScpCommon.isAutomaticallyGeneratedElement(value)) {
               return;
           }
           if (value.attr("type") == "text" || value.attr("type") == "hidden" ) {
        	   contactUsDto[value.attr("id")] = value.val();
           }
       });
       contactUsDto["message"] = $("#message").val();
        return contactUsDto;
    }

});

