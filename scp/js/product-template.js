$(function () {

    var queryResult = new QueryResult($("#queryResultContainer"), $("#productTemplateTableTmpl"), ScpCommon.context.searchUrl);

    queryResult.initFilter();

    $(".productTemplates div.btn").click(function(event) {
        var code = event.target.id;
        $("#productTemplateId").val(code);
        queryResult.initFilterAfterAjaxResponse(new Object({productCode: code}));
        queryResult.postAjax();
    })

    var $tooltips;

    if ($tooltips && $tooltips.length) {
        $('.tooltip').remove();
    }
    $tooltips = $('.productTemplates .tmlp-btns');
    $tooltips.each(function () {
        var txt = $(this).find('div').get(0);

        if (txt.scrollHeight > txt.clientHeight) {
            $(this).tooltip({
                container: "body",
                placement: "top"
            });
        }
        else {
            $(this).removeAttr("title");
        }
    });

});