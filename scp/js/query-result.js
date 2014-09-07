function QueryResult(container, queryResultContainerTemplate, postAjaxUrl, parsleyBlock, pageLastIdAwareLocal, isArrangingColumns) {

    var outerThis = this;

    var postData = {};
    
    var pageNumber = 1;
    
    var rowCount =ScpCommon.context.rowCount;

    this.pageLastIdAware = pageLastIdAwareLocal != undefined && pageLastIdAwareLocal;
    
    this.pageLastIds = [];

    this.pushPageLastId = function(value) {
        this.pageLastIds.push(value);
    };

    this.isPreviousPageLastIdPresent = function() {
        return this.pageLastIds.length > 0;
    };

    this.getPreviousPageLastId = function() {
        this.pageLastIds.pop();
        this.pageLastIds.pop();
        return this.getNextPageLastId();
    };

    this.getNextPageLastId = function() {
        var size = this.pageLastIds.length;
        if (size > 0) {
            return this.pageLastIds[size - 1];
        }
        return undefined;
    };

    this.clearPaging = function() {
        if (this.pageLastIdAware) {
            this.pageLastIds = [];    
        }
        $('#recordCount').text("0");
            setPageNumber(1);
    };

    this.postAjax = function() {
        var template = _.template(queryResultContainerTemplate.html());
        $.ajax({
            url: postAjaxUrl,
            data: JSON.stringify(postData),
            success: function (data) {
                if (data.status == "SUCCESS") {
                    if (outerThis.pageLastIdAware) {
                        data.dto.isPreviousPageLastIdPresent = outerThis.isPreviousPageLastIdPresent();
                        outerThis.pushPageLastId(data.dto.pageTransId);
                    }
                    if(data.dto.totalCount =='0' || !isNaN(parseInt($('#numberOfRecords').text()))){
                    	var recordCount = parseInt($('#recordCount').text());
                    	data.dto.totalCount=recordCount;
                    }
                    data.dto.start=calculateStartRecordNumber(ScpCommon.context.rowCount);
                    data.dto.end=calculateEndRecordNumber(ScpCommon.context.rowCount, data.dto.totalCount );
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

        $(".pagination #next, .pagination #prev").click(function(event) {
            if ($(this).is(".page-navigation-disabled")) {
                return;
            } else {
                if (!outerThis.pageLastIdAware) {
                    var pageNumber = $("#pageNumber");
                    var currentPage = parseInt(pageNumber.val());
                    pageNumber.val(currentPage + ($(this).is(".thumb-right") ? 1 : -1));
                    setPageNumber(parseInt(pageNumber.val()));
               } else {
                    setPageNumber((getPageNumber() + ($(this).is(".thumb-right") ? 1 : -1)));
               }
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
        
         $("#print").click(function(event) {
        	 var tableDiv = $("a.print-button").closest('div');
        	 tableDiv.printThis();
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

            if (outerThis.pageLastIdAware) {
                if (e.currentTarget.id == "next") {
                    postData["pageLastId"] = outerThis.getNextPageLastId();
                } else if (e.currentTarget.id == "prev") {
                    postData["pageLastId"] = outerThis.getPreviousPageLastId();
                }else{
                	postData["pageLastId"] ="";
                }	
            }
            outerThis.postAjax();
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
        return this.pageNumber;
    }

    function setPageNumber(pageNumber){
        this.pageNumber = pageNumber;
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

}
