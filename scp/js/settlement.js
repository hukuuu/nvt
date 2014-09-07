$(function () {

    var queryResultContainer = $("#queryResultContainer");
    var template = $("#settlementTableTmpl");
    var parsleyBlock = $(".query-search-block");
    ScpCommon.applySelect2(parsleyBlock, ScpCommon.context.select2options);

    var queryResult = new QueryResult(queryResultContainer, template, ScpCommon.context.searchUrl, parsleyBlock);

    new TimePeriods();

    queryResult.initFilter();

});