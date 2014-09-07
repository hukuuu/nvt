var ScpCommon = {};
ScpCommon.context = {};
ScpCommon.context.messages = {};

// base JSON for storing additional filter fields
ScpCommon.context.filter = {};
ScpCommon.context.filter.baseUrl = ""; // base path to url, which presents list of entities

//------------------------------- auto complete ----------------------------------------//
ScpCommon.applySelect2 = function(container, items) {
    $.each(items, function (selector, values) {
        var selects = container.find(selector);
        $.each(selects, function (index, value) {
            var select = $(value);
            var allowClear = select.attr("data-allow-clear") == "true";
            var dataValue = select.attr("data-value");
            if (allowClear) {
                select.append($("<option></option>"));
            }

            function appendOptionToSelect(container, key, value) {
                var option = $("<option></option>");
                option.attr("value", key).text(value);
                if (key == dataValue) {
                    option.attr("selected", "selected");
                }
                container.append(option);
            };

            $.each(values, function (key, value) {
                if (typeof value == 'string') {
                    appendOptionToSelect(select, key, value);
                } else {
                    var optgroup = $("<optgroup></optgroup>");
                    optgroup.attr("label", key);
                    for (var key in value) {
                        appendOptionToSelect(optgroup, key, value[key]);
                    }
                    select.append(optgroup);

                }


            });
            select.select2({
                allowClear : allowClear
            });
            if (select.attr("data-disabled") == "true") {
                select.select2("readonly", true);
            }

        });

    });
};
//------------------------------- auto complete  ----------------------------------------//


//------------------------------- jquery extension ----------------------------------------//
jQuery.extend(jQuery, {
    /**
     * Escape all special jQuery CSS selector characters in *selector*.
     * Useful when you have a class or id which contains special characters
     * which you need to include in a selector.
     */
    escapeSelector: (function () {
        var specials = ['#', '&', '~', '=', '>', "'", ':', '"', '!', ';', ','];
        var regexSpecials = ['.', '*', '+', '|', '[', ']', '(', ')', '/', '^', '$'];
        var sRE = new RegExp('(' + specials.join('|') + '|\\' + regexSpecials.join('|\\') + ')', 'g');

        return function (selector) {
            return selector.replace(sRE, '\\$1');
        }
    })()
});

/**shortcut for finding by id selector */
jQuery.extend(jQuery, {
    findById: (function () {
        return function (selector) {
            return jQuery("#" + jQuery.escapeSelector(selector));
        }
    })()
});

jQuery.extend(jQuery, {
    findByName: (function () {
        return function (selector) {
            return jQuery("[name='" + jQuery.escapeSelector(selector) + "']");
        }
    })()
});
//------------------------------- jquery extension ----------------------------------------//

//---------------------------------------- placeholder focus events ---------------------------------------//
ScpCommon.showPlaceholderIfInputWithoutValue = function () {
    $("input.withPlaceholder").each(function () {
        if (!$(this).val().length) {
            $(this).siblings(".label_wrapper").find("label").css("display", "block");
        } else {
            $(this).siblings(".label_wrapper").find("label").css("display", "none");
        }
    });

};

ScpCommon.applyPlaceholder = function () {

    $(document).on('click', 'div.input-wrapper label, div.clearfix label', function () {
        $(this).parent().siblings('input').focus();
    })
    .on("focus change blur input paste", "input.withPlaceholder", function () {
        var label = $(this).siblings('.label_wrapper').find("label");
        if (! $(this).val().length) {
            label.show();
        }
        else {
            label.hide();
        }
    });

    /*for input at login page in IE 8 */
    if (document.all && document.querySelector && !document.addEventListener) {
        $(document).on('click', 'div.input-wrapper label, div.clearfix label', function () {
            $(this).parent().siblings('input').focus();
        })
        .on("focus change blur keyup paste", "input.withPlaceholder", function () {
            var label = $(this).siblings('.label_wrapper').find("label");
            if (! $(this).val().length) {
                label.show();
            }
            else {
                label.hide();
            }
        });
    }

    ScpCommon.highLightSelect2 = function () {
        $('select').on("select2-open", function(e) {
            var $el = $("div.select2-drop, div.select2-drop div.select2-search"),
                method = ($(this).closest('div.dropdown').hasClass('error-input')) ? 'addClass' : 'removeClass';
            $el[method]("error");
        });
    };
   
    $(document).on('open:state', ScpCommon.highLightSelect2);
     ScpCommon.highLightSelect2();

    ScpCommon.disableTextSelect = function () {
        var disabledSelect = $(".select2-container-disabled");
        var disableTextSelect = disabledSelect.find("a.select2-chosen, a.select2-choice");

        disableTextSelect.addClass("select-disabled");
    }

    $(document).on('open:state', ScpCommon.disableTextSelect);
    $(document).on("agentinfo:update", ScpCommon.disableTextSelect);
    ScpCommon.disableTextSelect();
}

//---------------------------------------- placeholder focus events ---------------------------------------//


//---------------------------------------- messages ---------------------------------------//
$.pnotify.defaults.history = false;

ScpCommon.showError = function (message) {
    $.pnotify_remove_all();
    $.pnotify({
        title: ScpCommon.context.messages.titles.error,
        text: message,
        type: "error",
        hide: false,
        sticker: false,
        width: "84.6%",
        insert_brs: false,
        stack: {"dir1": "down", "dir2": "left", "push": "bottom", "spacing1": 25, "spacing2": 25, context: $("body")},
        before_open: function(pnotify){
            pnotify.css({
              "top":"71px", 
              "right": "27px"
            });
        }
    });
};

$.pnotify.defaults.insert_brs = false;

ScpCommon.showMessage = function (message, delayTime) {
	var timeDelay;
	
	if(delayTime != undefined){
		timeDelay=delayTime;
	}else{
		timeDelay=1000;
	}
	
    $.pnotify_remove_all();
    $.pnotify({
        title: ScpCommon.context.messages.titles.success,
        text: message,
        type: "success",
        hide: true,
        sticker: false,
        delay: delayTime != undefined ? delayTime :1000,
        width: "84.8%",
        insert_brs: false,
        stack: {"dir1": "down", "dir2": "left", "push": "bottom", "spacing1": 25, "spacing2": 25, context: $("body")},
        before_open: function(pnotify){
            pnotify.css({
              "top":"71px", 
              "right": "27px"
            });
        }
    });
};

//---------------------------------------- messages ---------------------------------------//

//---------------------------------------- validation ---------------------------------------//
ScpCommon.validate = function(container) {
    container.parsley("destroy");
    container.parsley(ScpCommon.parsleyConfigutation);
    return container.parsley("validate");
};

ScpCommon.validateCsv = function(container) {
    container.parsley("destroy");
    container.parsley(ScpCommon.parsleyCsvConfigutation);
    return container.parsley("validate");
};

ScpCommon.parsleyConfigutation = {
    validators: {
        datevalidator: function() {
            return {
                validate: function(val, regex) {
                    return new RegExp(regex).test(val);
                },
                priority: 22
            };
        },
        daysearlier: function() {
            return {
                validate: function(val, count) {
                    return ScpCommon.daysBetween(val, $('#dateTo').val()) >= parseInt(count);
                },
                priority: 19
            };
        },
        dayslater: function() {
            return {
                validate: function(val, count) {
                    return ScpCommon.daysBetween($('#dateFrom').val(), val) < parseInt(count);
                },
                priority: 20
            };
        },
        uniqueagentcode: function() {
            return {
                validate: function(val, data) {
                    var result = true;
                    for (var index in ScpCommon.context.structureNodes) {
                        if (ScpCommon.context.structureNodes[index].id == val.toUpperCase()) {
                            result = false;
                            break;
                        }
                    }
                    return result && val.length != 0;
                },
                priority: 21
            };
        },
        agentexist: function() {
            return {
                validate: function(val, data) {
                    var result = false;
                    for (var index in ScpCommon.context.structureNodes) {
                        if (ScpCommon.context.structureNodes[index].id == val.toUpperCase()) {
                            result = true;
                            break;
                        }
                    }
                    return result;
                },
                priority: 23
            };
        }
    },
    errors: {
        errorsWrapper: '<div class="error-message"></div>',
        errorElem: '<span></span>'
    },
    listeners: {
        onFieldError: function (elem, constraints, ParsleyField) {
            $(elem).closest(".input-wrapper").addClass("error-input");

            var targetElement = elem;
            if ($(elem).hasClass("select2")) {
                targetElement = $(elem).prevAll(".select2-container");
            }
            var errorImage = $(elem).siblings(".error-image");
            errorImage.css("display", "block");
            
            var errorReplaceArrow = $(elem).siblings(".select2-container").find("span.select2-arrow");
            
            if (errorReplaceArrow.is(":visible")) {
                errorImage.css("right", "25px");
            } else {
                errorImage.css("right", "9px");
            }

            $(targetElement).on("mouseenter focus",function (e) {
                $(elem).siblings(".error-message").css("display", "block");
                errorImage.toggleClass( "error-image_hover" );
            }).on("mouseleave", function (e) {
                $(elem).siblings(".error-message").css("display", "block"); // value was non but changed it even on mouse so message stays till next validation
                errorImage.removeClass( "error-image_hover" );
            })
        },
        onFieldValidate: function (elem, constraints, ParsleyField) {
            $(elem).off("keyup change");
            $(elem).closest(".input-wrapper").removeClass("error-input");

            var errorImage = $(elem).siblings(".error-image");
            errorImage.css("display", "none");

            var targetElement = elem;
            if ($(elem).hasClass("select2")) {
                targetElement = $(elem).prevAll(".select2-container");
            }
            $(targetElement).off("mouseenter").off("mouseleave");
        }
    }
};

ScpCommon.parsleyCsvConfigutation = {
    validators: {
        scvfileformat: function() {
            return {
                validate: function(val, regex) {
                    return new RegExp(regex).test(val);
                },
                priority: 27
            };
        }
    },
    errors: ScpCommon.parsleyConfigutation.errors,
    listeners: {
        onFieldError: function (elem, constraints, ParsleyField) {
            $(elem).closest("#file_name").addClass("errorCsvInput");
        
            $(elem).closest("#file_name").children("span.error-image").css(
                {"display": "block", "top": "0", "right": "9px"}
            );

            $(elem).on("mouseenter",function (e) {
                $(elem).siblings(".error-message").css({"display": "block", "width": "200px"});
                $(elem).closest("#file_name").children("span.error-image").toggleClass( "error-image_hover" );
            }).on("mouseleave", function (e) {
                $(elem).siblings(".error-message").css("display", "none");
                $(elem).closest("#file_name").children("span.error-image").removeClass( "error-image_hover" );
            })
        },
        onFieldValidate: function (elem, constraints, ParsleyField) {
            $(elem).off("keyup change");
        }
    }
};
//---------------------------------------- validation ---------------------------------------//

//---------------------------------------- date util  ---------------------------------------//
ScpCommon.daysBetween = function(dateFrom, dateTo) {
    return moment.utc(dateTo, "DD/MM/YY").diff(moment.utc(dateFrom, "DD/MM/YY"), 'days');
};
//---------------------------------------- date util  ---------------------------------------//

//----------------------------------------- autogen ----------------------------------------//
ScpCommon.isAutomaticallyGeneratedElement = function (element) {
    if (element.attr("id") == undefined || element.attr("id").indexOf("autogen") > -1) {
        return true;
    }
    return false;
}

//---------------------------------------- Logout -----------------------------------------//
ScpCommon.logout = function (element) {
    
	 window.location = ScpCommon.baseUrl + "login/session-timeout.htm";
}




//----------------------------- use filters to show action link --------------------------//

function isDisplayingActionLinkForRow(transaction, filter ){
	var status = false;
	if(!transaction.reversed && !transaction.refunded && transaction.statusCode == "0"){
		var filterVls = filter.split(':');
		
		for (var index = 0; index < filterVls.length; index++) {
		    
		    if(transaction.type == filterVls[index]){
				status = true;
				break;
		   } 
		    
		}
		
	}
	return status;
}

