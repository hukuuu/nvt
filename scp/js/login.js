$( document ).ready(function() {
		
	$("#back").click(function () {
		window.location.replace(ScpCommon.baseUrl + "login/index.htm");
    });
		
		
	$("#signin").click( function () {
		var loginControls = $("#loginFormDetails");
		var detailsIsValid = ScpCommon.validate(loginControls);
		
	    if (!detailsIsValid){
            loginControls.find("a").addClass("errorTabLink");
            return false;
        } else 
        {
            loginControls.find("a").removeClass("errorTabLink")
        }
	});
	
	
	$("#pinValidate").click( function () {
		var pinControls = $("#pinFormDetails");
		var detailsIsValid = ScpCommon.validate(pinControls);
		
	    if (!detailsIsValid){
	    	pinControls.find("a").addClass("errorTabLink");
            return false;
        } else 
        {
        	pinControls.find("a").removeClass("errorTabLink")
        }
	});
		
});
