$(function () {

    var queryResult = new QueryResult($("#queryResultContainer"), $("#productTemplateTableTmpl"), ScpCommon.context.searchUrl);

    queryResult.initFilter();

    var IDs = [];
    $("#supplier").find("button").each(function(){ IDs.push(this.id);});

    var uniqueIDs = [];
    uniqueIDs = _.uniq(IDs); // underscore.js lib function _uniq to get list of unique ID's

    $.each( uniqueIDs, function( index, value ){
        $("#"+value).show();
    });

    $('.supplierButton').each(function() {
         $(this).click(function(){
              $.each( uniqueIDs, function( index, value ){
                   $("."+value).hide();
              });

              var elem = $(this).attr('id');
              var supplierDescription = $(this).attr('value');
              $("#supplier").hide(1000);
              $("#product").show(1000);
              $('.'+elem).show();
              $(".currentSupplier").text(supplierDescription);

              $(".statusIndicator>div>div").removeClass("active-point");
              $("#DenominationsStatus").addClass("active-point");
         });
     });

    $('.productInfo').each(function() {
         $(this).click(function(){

             var elem = $(this).attr('id');
             $("#product").hide();
             $("#productInfo").show();
             $('.'+elem).show();

         });
     });

    $('.productSelected').each(function(){
        $(this).click(function(){
            var elem = $(this).attr('id');
            var denomination = $(this).attr('value');
            $(".continueButton").attr('id',elem);
            $(".backButton").attr('id',elem);
            $("#productCode").attr('value',elem);
            $("#value").attr('value',denomination);
            $(".productOptionsListContainer").each(function(){
            $(this).children().removeClass("active"); // this is to make only one product selected
            });

            $(this).addClass("active");
        });
    });

    $('.continueButton').each(function(){
        $(this).click(function(){
            var elem = $(this).attr('id');
            if(elem == '')
            {
                //$.notify('Please select a product',"info");
                $(".notificationBox").show();
            }
            else
            {
                $("#product").hide();
                $("#productInfo").show();
                $('.'+elem).show(1000);

                $(".statusIndicator>div>div").removeClass("active-point");
                $("#ConfirmStatus").addClass("active-point");
            }

        });
    });

    $('.backButton').each(function() {
         $(this).click(function(){
              var elem = $(this).attr('value').split(',');
              var currentProduct = $(this).attr('id');
              var hideE= elem[0];
              var showE= elem[1];
              var currentStatus= elem[2];
              $('.'+currentProduct).hide();
              $(hideE).hide();
              $(showE).show();

              $(".statusIndicator>div>div").removeClass("active-point");
              $(currentStatus).addClass("active-point");
              $("#printOkSection").hide();
              $("#queryResultContainer").html('');

              $(".continueButton").attr('id','');
              $(".notificationBox").hide();

              $(".productSelected").each(function(){
                  $(this).removeClass("active");
              });
         });
    });


    $('.confirmButton').each(function() {
        $(this).click(function(){

          $("#productInfo").hide();

          $(".statusIndicator>div>div").removeClass("active-point");
          $("#ReceiptStatus").addClass("active-point");

        });
    });

    $('.printButton').click(function(){

        $("#productReceipt").printThis();

    });

    $("#product, #productInfo").hide();

    /* jQuery-ui stuff  */

    $( "#accordion" ).accordion({
          collapsible: true,
          active: false,
          heightStyle: "content"
    });

    $("#accordion").accordion({ activate: function(event, ui) {
              if(ui.newHeader.text().length > 0 ){
                $(".backButtonUnderAccordion").hide();
              }
              else {
                $(".backButtonUnderAccordion").show();
              }
      }
    });

    //$("#productInfoTab").tabs();

    $(document).ajaxComplete(function( event, xhr, settings ) {

        var obj = jQuery.parseJSON(xhr.responseText); // need to parse response to JSON.
        if(obj.status == "SUCCESS"){
            $("#printOkSection").show();
        }

    });

});
