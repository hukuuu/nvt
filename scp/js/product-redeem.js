$(function () {

    /*
    $("#redeem").click(function(){

        $.getScript("/scp-pwp-1.0/assets/scp/js/redeem.js", function(){
                 alert('loaded');
        });
    });
    */
    var parsleyBlock = $(".query-search-block");
    var queryResult = new QueryResult($("#queryResultContainer"), $("#productValidateImpl"), ScpCommon.context.searchUrl,parsleyBlock);

    queryResult.initFilter();

    var queryResultSecond = new QueryResultSecond($("#queryResultContainer"), $("#productRedeemImpl"), ScpCommon.context.searchUrl2);

    queryResultSecond.initFilter();

    $(".cancelButton,.okButton").click(function(){

        $(".validateButton").hide();
        $(".printButton").hide();
        $(".redeemButton").hide();
        $("#userPin").val('');
        $("#userPin").prop('disabled', false);
        $("#pinInputBox").show();
        $(this).hide();

        $(".statusIndicator>div>div").removeClass("active-point");
        $("#PinStatus").addClass("active-point");
        $("#queryResultContainer").html('');
    });

    $("#userPin").on("paste keyup keypress focus change blur", function(event){
        setTimeout(function(){
            var value = $("#userPin").prop("value").trim(); // in this instance better to prop() paste event was returning value with this.
            if(value){
                $(".validateButton").show();
            } else{
                $(".validateButton").hide();
            }
        },100); //timeout because it takes sometime to grab value from paste event (event.type) shows which event was fired.
    });

    $(".printButton").click(function(){
        $("#redeemReceipt").printThis();
    });

    /*
      ajaxComplete gets fired after any ajax request is completed and can only be evoked at document level.
      In this case it is used to determine whether or not  validation returned a valid pin.
    */

    $(document).ajaxComplete(function( event, xhr, settings ) {

        var obj = jQuery.parseJSON(xhr.responseText); // need to parse response to JSON.

        if ( settings.url === ScpCommon.context.searchUrl) {

            if(obj.dto.objects[0].responseHeaderDto.resultCode != "0"){

                var message = obj.dto.objects[0].responseHeaderDto.resultDescription;
                $(".notificationBox").show();
                $("div.notificationBox p").html(message);

            }
            else{
                    $(".validateButton").hide();
                    $(".notificationBox").hide();
                    $(".redeemButton").show();
                    $(".cancelButton").show();
                    $("#userPin").prop('disabled', true);
                    $(".statusIndicator>div>div").removeClass("active-point");
                    $("#DetailsStatus").addClass("active-point");
            }
        }
        else if ( settings.url === ScpCommon.context.searchUrl2) {

              if(obj.dto.objects[0].responseHeaderDto.resultCode != "0"){

                  var message = obj.dto.objects[0].responseHeaderDto.resultDescription;
                   // to do something with this response.
              }
              else{

                    $(".redeemButton").hide();
                    $(".cancelButton").hide();
                    $("#pinInputBox").hide();
                    $(".printButton").show();
                    $(".okButton").show();
                    $(".statusIndicator>div>div").removeClass("active-point");
                    $("#ReceiptStatus").addClass("active-point");
              }
        }
    });

 });