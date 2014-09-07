function VoucherResult(container, queryResultContainerTemplate, postAjaxUrl, parsleyBlock, propertyOverrides, isPaginating, isArrangingColumns) {

    var outerThis = this;

    var postData = {};
    
    var pageNumber = 1;
    
    var noOfRecords =0;
    
    var props = propertyOverrides;
    
    var limit =ScpCommon.context.rowCount;

    this.pageNumberAware = isPaginating != undefined && isPaginating;

    this.isPreviouslyPaginatedRequest = function() {
        return pageNumber > 1;
    };

    this.clearPaging = function() {
    	noOfRecords =0;
        pageNumber = 1;
    };
    
    this.addPageNumber = function (){
    	pageNumber ++;
    }
    
    this.substractPageNumber = function (){
    	pageNumber --;
    }

    this.postAjax = function() {
        var template = _.template(queryResultContainerTemplate.html());
        $.ajax({
            url: postAjaxUrl,
            data: JSON.stringify(postData),
            success: function (data) {
                if (data.status == "SUCCESS") {
                	if(isPaginating){
                		data.dto.isPreviousPageLastIdPresent = outerThis.isPreviouslyPaginatedRequest();
	                    
                		if(data.dto.isPreviousPageLastIdPresent){
	                    	data.dto.totalCount=noOfRecords;
	                    }else{
	                    	noOfRecords =data.dto.totalCount;
	                    }
	                    data.dto.start=calculateStartRecordNumber(limit);
                        data.dto.end=calculateEndRecordNumber(limit,data.dto.totalCount );
                        container.empty();
                        container.append(template({"queryResult": data.dto}));
                	}
                	if(data.dto.totalCount==0){
                		$('#voucher').hide();
                	    $('#tabs a[href="#topupResultContainer"]').tab('show').focus();
                	}else{
                		$('#voucher').show();
                
                	}
                   
                    if(isArrangingColumns != undefined && isArrangingColumns){
                    	outerThis.arrangeColumnDisplay(data.dto.columns);
                    }
                    
                    outerThis.initFilterAfterAjaxResponse(data.dto.filter);
                } else {
                    ScpCommon.showError(data.message);
                }
            }
        });
    };

    this.initFilter = function() {
        $("a.search-button,#searchButton").not(".no-query").click(function(event) {
            outerThis.clearPaging();
            outerThis.search(event);
            $("#tabContaier").removeClass("hidden-tabs").addClass("display-tabs");
        });

    };

    this.initFilterAfterAjaxResponse = function (filter) {
        $.each(filter, function (data, value) {
            var selector = $(":input#" + data + "[type='hidden'], :input[name='" + data + "'][type='hidden']");
            if (selector) {
                selector.val(value);
                postData[data] = value;
            }
        });

        $(".pagination #vou_next, .pagination #vou_prev").click(function(event) {
            if ($(this).is(".page-navigation-disabled")) {
                return;
            } else {   
                pageNumber= (getPageNumber() + ($(this).is(".thumb-right") ? 1 : -1));
                outerThis.search(event);
            }
        });
        
        
        $("#exportCsv").click(function(event) {

        	var filterVals = getFilterValues();
        	var url = ScpCommon.context.exportUrl + "?";
        	for (var key in filterVals) {
        		  if (filterVals.hasOwnProperty(key)&& !filterVals[key]=="") {
        			  url= url + key + "=" + filterVals[key]+"&";
        		  }
        		}
            window.location = url;
        })
    };
    
    this.arrangeColumnDisplay = function (columns){
    	var table = queryResultContainerTemplate.find('table');
    	var rowCount = 0;
    	$.each(columns, function(i, column) {
    		if(column.displaying){
	    		var currentindex = $("#" + column.columnId).index();	    		
	    		moveColumn(table, currentindex, rowCount);
	    		$("." + column.columnId).removeClass( "hide-column" ).addClass( "show-column" );
	    		rowCount++;
    		}
    	});
    	
    };
    

    this.search = function(e) {
        if (parsleyBlock != undefined ? ScpCommon.validate(parsleyBlock) : true) {
            $.each($("#querySearchFilter :input"), function (index, value) {
                value = $(value);
                if (ScpCommon.isAutomaticallyGeneratedElement(value)) {
                    return;
                }
                if (value.attr("type") == "text" || value.attr("type") == "hidden" || value.is("select") ) {
                    postData[value.attr("id")] = value.val();
                }
            });

            $.each($("div.onoffswitch-switch"), function (index, value) {
                postData[value.id] = $(value).is(".s-on");
            });

            if (outerThis.pageNumberAware) {
            		postData["limit"] =limit;
                	postData["pageNumber"] =pageNumber;
            }
            if(propertyOverrides != undefined){
            	postData["typeCode"] = propertyOverrides;
            }
            this.postAjax();
        }
    }
    
    function getFilterValues() {
    	var filterData = {};
        if (parsleyBlock != undefined ? ScpCommon.validate(parsleyBlock) : true) {
            $.each($("#querySearchFilter :input"), function (index, value) {
                value = $(value);
                if (ScpCommon.isAutomaticallyGeneratedElement(value)) {
                    return;
                }
                if (value.attr("type") == "text" || value.attr("type") == "hidden" || value.is("select") ) {
                	filterData[value.attr("id")] = value.val();
                }
            });

            $.each($("div.onoffswitch-switch"), function (index, value) {
            	filterData[value.id] = $(value).is(".s-on");
            });

            return filterData;
        }
    }
    
    
    function getPageNumber(){
        return pageNumber;
    }
    
    function calculateStartRecordNumber(noOfRecords){
    	return ((getPageNumber() - 1) * noOfRecords) + 1;
    }
    
    function calculateEndRecordNumber(noOfRecords, totalRecordCount){
    	endRecordNumber =  getPageNumber() * noOfRecords;
    	if (endRecordNumber > totalRecordCount){
    		endRecordNumber = totalRecordCount;
    	}
    	return endRecordNumber;
    }

}

function TopupResult(container, queryResultContainerTemplate, postAjaxUrl, parsleyBlock, propertyOverrides, isPaginating, isArrangingColumns) {

    var outerThis = this;

    var postData = {};
    
    var pageNumber = 1;
    
    var noOfRecords =0;
    
    var props = propertyOverrides;
    
    var limit =ScpCommon.context.rowCount;

    this.pageNumberAware = isPaginating != undefined && isPaginating;

    this.isPreviouslyPaginatedRequest = function() {
        return pageNumber > 1;
    };

    this.clearPaging = function() {
    	noOfRecords =0;
       // $('#recordCount').text("0");
        pageNumber = 1;
    };
    
    this.addPageNumber = function (){
    	pageNumber ++;
    }
    
    this.substractPageNumber = function (){
    	pageNumber --;
    }

    this.postAjax = function() {
        var template = _.template(queryResultContainerTemplate.html());
        $.ajax({
            url: postAjaxUrl,
            data: JSON.stringify(postData),
            success: function (data) {
                if (data.status == "SUCCESS") {
                	if(isPaginating){
                		data.dto.isPreviousPageLastIdPresent = outerThis.isPreviouslyPaginatedRequest();
	                    
                		if(data.dto.isPreviousPageLastIdPresent){
	                    	data.dto.totalCount=noOfRecords;
	                    }else{
	                    	noOfRecords =data.dto.totalCount;
	                    }
	                    data.dto.start=calculateStartRecordNumber(limit);
                        data.dto.end=calculateEndRecordNumber(limit,data.dto.totalCount );
                	}
                	
                	if(data.dto.totalCount==0){
                		$('#topup').hide();
                	    $('#tabs a[href="#voucherResultContainer"]').tab('show').focus();
                	}else{
                		$('#topup').show().focus();
                		$('#tabs a[href="#topupResultContainer"]').tab('show');
                	}

                    container.empty();
                    container.append(template({"queryResult": data.dto}));
                    
                    if(isArrangingColumns != undefined && isArrangingColumns){
                    	outerThis.arrangeColumnDisplay(data.dto.columns);
                    }
                    
                    outerThis.initFilterAfterAjaxResponse(data.dto.filter);
                } else {
                    ScpCommon.showError(data.message);
                }
            }
        });
    };

    this.initFilter = function() {
        $("a.search-button,#searchButton").not(".no-query").click(function(event) {
            outerThis.clearPaging();
            outerThis.search(event);
        });

    };

    this.initFilterAfterAjaxResponse = function (filter) {
        $.each(filter, function (data, value) {
            var selector = $(":input#" + data + "[type='hidden'], :input[name='" + data + "'][type='hidden']");
            if (selector) {
                selector.val(value);
                postData[data] = value;
            }
        });

        $(".pagination #top_next, .pagination #top_prev").click(function(event) {
            if ($(this).is(".page-navigation-disabled")) {
                return;
            } else {   
                pageNumber= (getPageNumber() + ($(this).is(".thumb-right") ? 1 : -1));
                outerThis.search(event);
            }
        });
        
        
        $("#exportCsv").click(function(event) {

        	var filterVals = getFilterValues();
        	var url = ScpCommon.context.exportUrl + "?";
        	for (var key in filterVals) {
        		  if (filterVals.hasOwnProperty(key)&& !filterVals[key]=="") {
        			  url= url + key + "=" + filterVals[key]+"&";
        		  }
        		}
            window.location = url;
        })
    };
    
    this.arrangeColumnDisplay = function (columns){
    	var table = queryResultContainerTemplate.find('table');
    	var rowCount = 0;
    	$.each(columns, function(i, column) {
    		if(column.displaying){
	    		var currentindex = $("#" + column.columnId).index();	    		
	    		moveColumn(table, currentindex, rowCount);
	    		$("." + column.columnId).removeClass( "hide-column" ).addClass( "show-column" );
	    		rowCount++;
    		}
    	});
    	
    };
    

    this.search = function(e) {
        if (parsleyBlock != undefined ? ScpCommon.validate(parsleyBlock) : true) {
            $.each($("#querySearchFilter :input"), function (index, value) {
                value = $(value);
                if (ScpCommon.isAutomaticallyGeneratedElement(value)) {
                    return;
                }
                if (value.attr("type") == "text" || value.attr("type") == "hidden" || value.is("select") ) {
                    postData[value.attr("id")] = value.val();
                }
            });

            $.each($("div.onoffswitch-switch"), function (index, value) {
                postData[value.id] = $(value).is(".s-on");
            });

            if (outerThis.pageNumberAware) {
            		postData["limit"] =limit;
                	postData["pageNumber"] =pageNumber;
            }
            if(propertyOverrides != undefined){
            	postData["typeCode"] = propertyOverrides;
            }
            this.postAjax();
        }
    }
    
    function getFilterValues() {
    	var filterData = {};
        if (parsleyBlock != undefined ? ScpCommon.validate(parsleyBlock) : true) {
            $.each($("#querySearchFilter :input"), function (index, value) {
                value = $(value);
                if (ScpCommon.isAutomaticallyGeneratedElement(value)) {
                    return;
                }
                if (value.attr("type") == "text" || value.attr("type") == "hidden" || value.is("select") ) {
                	filterData[value.attr("id")] = value.val();
                }
            });

            $.each($("div.onoffswitch-switch"), function (index, value) {
            	filterData[value.id] = $(value).is(".s-on");
            });

            return filterData;
        }
    }
    
    
    function getPageNumber(){
        return pageNumber;
    }
    
    function calculateStartRecordNumber(noOfRecords){
    	return ((getPageNumber() - 1) * noOfRecords) + 1;
    }
    
    function calculateEndRecordNumber(noOfRecords, totalRecordCount){
    	endRecordNumber =  getPageNumber() * noOfRecords;
    	if (endRecordNumber > totalRecordCount){
    		endRecordNumber = totalRecordCount;
    	}
    	return endRecordNumber;
    }

}

function moveColumn(table, from, to) {
	if(from != to){
        var rows = jQuery('tr', table);
        var cols;
        rows.each(function() {
            cols = jQuery(this).children('th, td');
            cols.eq(from).detach().insertBefore(cols.eq(to));
        });
	}
}
