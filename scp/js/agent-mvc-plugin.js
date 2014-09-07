$(function() {
    $.widget("custom.agentMvc", {
        options: {
            states: {},
            currentState: undefined,
            latestViewState: undefined,
            currentAgentDto: undefined,
            agentDetailsViewTpl: undefined,
            agentEditDataTpl: undefined,
            agentCsvImportResult: undefined
        },
        /*initializes plugin based on some element which contains divs with states*/
        _create: function() {
            var stateContainers = this.element.find("div[data-agent-mvc-state-type]");
            var outerThis = this;
            $.each(stateContainers, function(index, value) {
                var state = new AgentMvcState($(value));
                outerThis.options.states[state.getId()] = state;
            });
            this.options.agentDetailsViewTpl = _.template($("#agentInfoTpl").html());
            this.options.agentEditDataTpl = _.template($("#agentEditDataTpl").html());
            this.options.agentCsvImportResult = _.template($("#agentCsvImportResult").html());

            var editData = {
                agentEditDetailsStateAlias: "agentEditDetailsState",
                agentEditProfileStateAlias: "agentEditProfileState",
                mode: "edit"
            };
            $("#rightSideContentId").on("click", ".changeAgent", this._prepareAgentEditingView);
        },
        _refresh: function() {
        },
        _destroy: function() {
        },
        _setOptions: function() {
        },
        _setOption: function( key, value ) {
        },
        /*event handler for displaying agent edit/create state */
        _prepareAgentEditingView: function(event) {
            var target = $(event.target);
            if (target.hasClass("disabled")) {
                return;
            }
            var agentMvc = AgentMvcHelper.agentMvc;
            var agentMvcOptions =  agentMvc.getOptions();

            var newAgent = target.attr("data-new-agent") == "true";
            var newAgentType = target.attr("data-new-agent-type");
            var agentCode = target.attr("data-agent-code");

            var outerThis = this;
            $.ajax({
                url: ScpCommon.baseUrl + "agent/agent-info-for-editing.json",
                data: JSON.stringify({
                    newAgent : newAgent,
                    newAgentType : newAgentType,
                    agentCode : agentCode
                }),
                success: function (data) {
                    if (data.status == 'SUCCESS') {
                        var state = agentMvc.findState(newAgent ? "agentCreateDetailsState" : "agentEditDetailsState");
                        state.getContainer().empty();
                        state.getContainer().append($(agentMvcOptions.agentEditDataTpl(data.dto)));
                        state.getContainer().find("#agentEditDetailsContainer").parsley(ScpCommon.parsleyConfigutation);
                        if (data.dto.agentProfileVisible) {
                            state.getContainer().find("#agentEditProfileContainer").parsley(ScpCommon.parsleyConfigutation);
                            $.each(data.dto.profiles, function(name, value) {
                                ScpCommon.context.select2options[name] = value;
                            });
                        }
                        ScpCommon.applySelect2(state.getContainer(), ScpCommon.context.select2options);
                        agentMvc.enableButtonsInAgentInfoBlock();
                        target.parents("div.td-btn").first().addClass("current-button-div");
                        target.parents("div.td-btn").first().addClass("disable");
                        target.addClass("current-button");
                        target.addClass("disabled details-disable");
                        agentMvc.openState(state.getId());
                    } else {
                        ScpCommon.showError(data.message);
                    }
                }
            });
        },

        /*public methods*/
        /*enables all buttons for editing in agent info view*/
        enableButtonsInAgentInfoBlock: function() {
            $("#rightSideContentId .current-button").removeClass("disabled details-disable").removeClass("current-button");
            $("#rightSideContentId .current-button-div").removeClass("disable").removeClass("current-button-div");
        },

        /*updates agent info on code, performs ajax call to server*/
        updateAgentInfo: function(agentCode) {
            var outerThis = this;
            $.ajax({
                url: ScpCommon.baseUrl + "agent/agent-info.json",
                data: JSON.stringify({"agentCode" : agentCode}),
                success: function (data) {
                    if (data.status == 'SUCCESS') {
                        outerThis.updateDetailsView(data.dto);
                    } else {
                        ScpCommon.showError(data.message);
                    }
                }
            });
        },

        /*updates agent info view based on dto. can be called after receiving data from server*/
        updateDetailsView: function(dto) {
            this.options.currentAgentDto = dto;
            var agentContainer = this.element.find("#rightSideContentId");
            var result = $(this.options.agentDetailsViewTpl(this.options.currentAgentDto));
            if (dto.structureNodes) {
                ScpCommon.context.nav.divisions = dto.structureNodes;
            }

            agentContainer.html(result);
            $(document).trigger('agentinfo:update');
            $('body').tooltip({
                container: "body",
                placement: "top",
                selector: ".address td"
            });
        },

        /*updates help document content after changing state. performs ajax call to server*/
        updateHelpDocumentForCurrentState: function() {
            var outerThis = this;
            $.ajax({
                url: ScpCommon.baseUrl + "agent/helpDocument.htm",
                dataType: "html",
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                data: {'code': this.options.currentState.getHelpDocumentId()},
                error: function (jqXHR, textStatus, errorThrown) {
                    if(jqXHR.status == 403){
                        ScpCommon.showError(JSON.parse(jqXHR.responseText).message);
                    } else {
                        ScpCommon.showError(errorThrown);
                    }
                },
                success: function (data) {
                    var helpDocumentContent = outerThis.element.find("#helpDocumentContent");
                    helpDocumentContent.html(data);
                }
            });
        },

        /*finds state by id*/
        findState: function(stateId) {
          return this.options.states[stateId];
        },

        /*opens state by id*/
        openState: function(stateId) {
            ScpCommon.applyPlaceholder();
            ScpCommon.showPlaceholderIfInputWithoutValue();
            if (this.options.currentState && this.options.currentState.getId() == stateId) {
                return;
            }
            for (var key in this.options.states) {
                this.options.states[key].toggle(key == stateId);
            }
            this.options.currentState = this.findState(stateId);

            this.element.removeClass();
            if (this.options.currentState.isSearchState()) {
                this.element.addClass("span6 right");
            } else if(this.options.currentState.isLoadFromCsvState()) {
                this.element.addClass("span6 right-load");
            } else if (this.options.currentState.isViewState()) {
                this.element.addClass("span6 right");
            } else if (this.options.currentState.isEditDetailsState()) {
                this.element.addClass("span6 right-edit");
            } else {
                this.element.addClass("span6 right-create");
            }

            if (this.options.currentState.isViewState()) {
                this.options.latestViewState = this.options.currentState;
                this.enableButtonsInAgentInfoBlock();
            }
            this.updateHelpDocumentForCurrentState();
            $(document).trigger('open:state');
        },

        /*closes state by id*/
        closeState: function(stateId) {
            var state = this.findState(stateId);
            if (!state.isPreviousStateDefined()) {
                return;
            }
            this.openState(state.isPreviousStateLatestView() ? this.options.latestViewState.getId() : state.getPreviousState());
            $(document).trigger('agentstate:close');
        },

        /*sets current dto with agent data to options*/
        setCurrentAgentDto: function(agent) {
            this.options.currentAgentDto = agent;
        },

        /*returns options for plugin*/
        getOptions: function() {
            return this.options;
        }
    });
});

/*wrapper for easier calling methods of agent-mvc-plugin*/
function AgentMvcWrapper(container) {
    this.container = container;

    /*basic. Call of method on reflaction mechanisms*/
    this.callWidgetMethod = function (methodName) {
        var arguments2Pass = Array.prototype.slice.call(arguments, 1)
        var methodResult = null;
        if (arguments2Pass.length == 0) {
            methodResult = container.agentMvc(methodName);
        } else if (arguments2Pass.length == 1) {
            methodResult = container.agentMvc(methodName, arguments2Pass[0]);
        } else if (arguments2Pass.length == 2) {
            methodResult = container.agentMvc(methodName, arguments2Pass[0], arguments2Pass[1]);
        } else if (arguments2Pass.length == 3) {
            methodResult = container.agentMvc(methodName, arguments2Pass[0], arguments2Pass[1], arguments2Pass[2]);
        } else if (arguments2Pass.length == 4) {
            methodResult = container.agentMvc(methodName, arguments2Pass[0], arguments2Pass[1], arguments2Pass[2], arguments2Pass[3]);
        }
        return methodResult;
    };

    /*methods from widget*/
    this.enableButtonsInAgentInfoBlock = function() {return this.callWidgetMethod("enableButtonsInAgentInfoBlock");};
    this.updateAgentInfo = function(agentCode) {return this.callWidgetMethod("updateAgentInfo", agentCode);};
    this.updateDetailsView = function(dto) {return this.callWidgetMethod("updateDetailsView", dto);};
    this.updateHelpDocumentForCurrentState = function() {return this.callWidgetMethod("updateHelpDocumentForCurrentState");};
    this.setCurrentAgentDto = function(agent) {return this.callWidgetMethod("setCurrentAgentDto", agent);};
    this.findState = function(stateId) {return this.callWidgetMethod("findState", stateId);};
    this.openState = function(stateId) {return this.callWidgetMethod("openState", stateId);};
    this.closeState = function(stateId) {return this.callWidgetMethod("closeState", stateId);};
    this.getOptions = function() {return this.callWidgetMethod("getOptions");};
    /*methods from widget*/
}

/*represents state fro agent mvc plugin*/
var AgentMvcState = (function() {
    function AgentMvcState(container) {
        this._container = container;
        this._id = container.attr("id");
        this._type = container.attr("data-agent-mvc-state-type");
        this._previousState = container.attr("data-agent-mvc-previous-state");
        this._helpDocumentId = container.attr("data-agent-mvc-help-document-id");
        var initFunction = container.attr("data-agent-mvc-init-function");
        if (AgentMvcHelper[initFunction]) {
            AgentMvcHelper[initFunction](this);
        }
    }

    /*hides main container for a state*/
    AgentMvcState.prototype.toggle = function(flag) {
        this._container.toggle(flag);
    };

    /*returns flag if there a state to which we can go back*/
    AgentMvcState.prototype.isPreviousStateDefined = function() {
        return this._previousState != undefined;
    };

    /*specifies if we must return to latest view state*/
    AgentMvcState.prototype.isPreviousStateLatestView = function() {
        return this._previousState === "latestView";
    };

    AgentMvcState.prototype.isEditState = function() {
        return this._type === "edit";
    };

    AgentMvcState.prototype.isViewState = function() {
        return this._type === "view";
    };

    AgentMvcState.prototype.isEditDetailsState = function() {
        return this._id == "agentEditDetailsState";
    };

    AgentMvcState.prototype.isCreateDetailsState = function() {
        return this._id == "agentCreateDetailsState";
    };

    AgentMvcState.prototype.isLoadFromCsvState = function() {
        return this._id == "agentCreateDetailsFromCsvState";
    };

    AgentMvcState.prototype.isProfileState = function() {
        return this._id == "agentEditProfileState";
    };

    AgentMvcState.prototype.isSearchState = function() {
        return this._id == "agentSearchState";
    };

    AgentMvcState.prototype.isStructureState = function() {
        return this._id == "agentStructureState";
    };

    //getters
    AgentMvcState.prototype.getContainer = function() {return this._container;};
    AgentMvcState.prototype.getId = function() {return this._id;};
    AgentMvcState.prototype.getType = function() {return this._type;};
    AgentMvcState.prototype.getPreviousState = function() {return this._previousState;};
    AgentMvcState.prototype.getHelpDocumentId = function() {return this._helpDocumentId;};

    return AgentMvcState;
})();

/*initialization of states please see corresponding methods*/
var AgentMvcHelper = {};

AgentMvcHelper.agentMvc = undefined;

AgentMvcHelper.initAgentStructureState = function(state) {
    var container = state.getContainer();

    new QueryResult($("#queryResultContainer"), $("#agentSearchStateTableTpl"), ScpCommon.context.searchUrl).initFilter();

    container.find("#agentSearchStateSwitcher").click(function(){
        AgentMvcHelper.agentMvc.openState("agentSearchState");
        ScpCommon.showPlaceholderIfInputWithoutValue();
    });
};

AgentMvcHelper.initAgentSearchState = function(state) {
    var container = state.getContainer();
    container.on("blur", "#searchAgentCode", function () {
        $(this).val($(this).val().toUpperCase());
    });
    container.find("#agentStructureStateSwitcher").click(function() {
        AgentMvcHelper.agentMvc.openState("agentStructureState");
        $(document).trigger('agentinfo:update');
    });

    $(".switch").on("click", function(e) {
        var isOff = $(".onoffswitch");

        if (isOff.hasClass("off")) {
            $(".onoffswitch").removeClass("off").addClass("on"),
                $(".onoffswitch").css("left", ""),
                $(".onoffswitch-switch").addClass("s-on").removeClass("s-off"),
                $(".onoffswitch-switch").css({"position": "absolute", "left": "4px", "right": ""})
        }
        else {
            $(".onoffswitch").removeClass("on").addClass("off"),
                $(".onoffswitch-switch").addClass("s-off").removeClass("s-on"),
                $(".onoffswitch-switch").css({"position": "absolute", "right": "4px","left": ""})
        };
    });

    ScpCommon.applySelect2(container, ScpCommon.context.select2options);

    container.on("click", "#agentSearchResult tr td a", function () {
        var agentCode = $(this).attr("data-id");
        AgentMvcHelper.agentMvc.updateAgentInfo(agentCode);
    });

};

AgentMvcHelper.toggleAgentTab = function (container, containerShowId, containerHideId) {
    var tabToShowId = container.find("#" + containerShowId + "Tab");
    if (tabToShowId.hasClass("active")) {
        return;
    }

    var tabToHideId = container.find("#" + containerHideId + "Tab");
    tabToShowId.addClass("active");
    tabToHideId.removeClass("active");

    container.find("#" + containerShowId).toggle(true);
    container.find("#" + containerHideId).toggle(false);

    var agentMvcContainer = this.agentMvc.container;
    agentMvcContainer.removeClass();

    if ("agentEditDetailsContainer" ==  containerShowId) {
        if ("agentEditDetailsState" == container.attr("id")) {
            agentMvcContainer.addClass("span6 right-edit");
        } else if ("agentCreateDetailsState" == container.attr("id")) {
            agentMvcContainer.addClass("span6 right-create");
        }
    } else if ("agentEditProfileContainer" == containerShowId) {
        agentMvcContainer.addClass("span6 right");
    }
};

AgentMvcHelper.initAgentEditDetailsState = function(state) {
    var container = state.getContainer();
    container.on("click", "#agentEditDetailsContainerTab", function () {
        AgentMvcHelper.toggleAgentTab(container, "agentEditDetailsContainer", "agentEditProfileContainer");
        loadDocumentContents("SCPHLP03");
    });
    container.on("click", "#agentEditProfileContainerTab", function () {
        AgentMvcHelper.toggleAgentTab(container, "agentEditProfileContainer", "agentEditDetailsContainer");
        loadDocumentContents("SCPHLP04");
    });
    this.initAgentDetailsState(state, "agent/save-agent-details.json", ScpCommon.context.messages.currentPage.successfulDetailsUpdate);
};

AgentMvcHelper.initAgentCreateDetailsState = function(state) {
    this.initAgentDetailsState(state, "agent/create-agent-details.json", ScpCommon.context.messages.currentPage.successfulDetailsCreate);
};

AgentMvcHelper.initAgentDetailsState = function(state, ajaxUrl, successMessage) {
    var container = state.getContainer();
    container.on("blur", "#agentCode", function () {
        $(this).val($(this).val().toUpperCase());
    });
    container.on("click", "#cancelAgentDetailsEditingButton,#cancelAgentEditingButton", function () {
        AgentMvcHelper.agentMvc.closeState(state.getId());
    });
    container.on("click", "#nextDetailsEditingButton", function () {
        if (validateAgentDetails(container)) {
            AgentMvcHelper.toggleAgentTab(container, "agentEditProfileContainer", "agentEditDetailsContainer");
        }
    });
    container.on("click", "#cancelAgentProfileEditingButton", function () {
        AgentMvcHelper.toggleAgentTab(container, "agentEditDetailsContainer", "agentEditProfileContainer");
    });
    container.on("click", "#agentDetailsLoadFromFileButton", function () {
        var agentCreateDetailsFromCsvState = AgentMvcHelper.agentMvc.findState("agentCreateDetailsFromCsvState");
        var agentCsvStateContainer = agentCreateDetailsFromCsvState.getContainer();
        var fileInput = agentCsvStateContainer.find(":input");
        fileInput.val("");
        agentCsvStateContainer.find("#importResultContainer").html("");

        var fileName = agentCsvStateContainer.find("#file_name");
        if (fileName.is(".errorCsvInput")) {
            fileName.removeClass("errorCsvInput");
            agentCsvStateContainer.find(".error-image").hide();
            fileInput.off("mouseenter").off("mouseleave");
        }
        AgentMvcHelper.agentMvc.openState(agentCreateDetailsFromCsvState.getId());
    });
    container.on("click", "#saveAgentDetailsButton,#saveAgentEditingButton", function () {
        if (validateAgentDetails(container)) {
            postAjax(container);
        }
    });
    container.on("click", "#saveAgentProfileButton", function () {
        if (validateAgentProfile(container)) {
            postAjax(container);
        }
    });
    container.on("click", "#saveAgentEditingWithProfileButton", function () {
        if (validateAgentDetails(container) & validateAgentProfile(container)) {
            postAjax(container);
        }
    });

    function postAjax(container) {
        var dto = AgentMvcHelper.inputDetailsValuesToDto(container);
        $.ajax({
            url: ScpCommon.baseUrl + ajaxUrl,
            data: JSON.stringify(dto),
            success: function (data) {
                if (data.status == 'ERROR') {
                    ScpCommon.showError(data.message);
                } else {
                    AgentMvcHelper.agentMvc.updateDetailsView(data.dto);
                    if (AgentMvcHelper.agentMvc.getOptions().latestViewState.isStructureState()) {
                        var levelCount = _.where(ScpCommon.context.nav, {parent: data.dto.agentDto.agentCode}).length;
                        if (levelCount) {
                            ScpCommon.context.nav.updateStructure(data.dto.agentDto.agentCode, false);
                        } else {
                            ScpCommon.context.nav.updateStructure(data.dto.agentDto.parentCode, true);
                            $("[data-id='" + data.dto.agentDto.agentCode.toUpperCase() + "']").click();
                        }
                        $(document).trigger('agentinfo:update');
                    }
                    ScpCommon.showMessage(successMessage,ScpCommon.context.messageTimeOut );
                    AgentMvcHelper.agentMvc.closeState(state.getId());
                }
            }
        });
    }

    function validateAgentDetails(container) {
        var agentEditDetailsContainerTab = $("#agentEditDetailsContainerTab");
        if (!ScpCommon.validate(container.find("#agentEditDetailsContainer"))) {
            agentEditDetailsContainerTab.addClass("errorTab");
            agentEditDetailsContainerTab.find("a").addClass("errorTabLink");
            return false;
        } else {
            agentEditDetailsContainerTab.removeClass("errorTab");
            agentEditDetailsContainerTab.find("a").removeClass("errorTabLink");
            return true;
        }
    }

    function validateAgentProfile(container) {
        var agentEditProfileContainerTab = $("#agentEditProfileContainerTab");
        if (!ScpCommon.validate($(container.find("#agentEditProfileContainer")))) {
            agentEditProfileContainerTab.addClass("errorTab");
            agentEditProfileContainerTab.find("a").addClass("errorTabLink");
            return false;
        } else {
            agentEditProfileContainerTab.removeClass("errorTab");
            agentEditProfileContainerTab.find("a").removeClass("errorTabLink");
            return true;
        }
    }
};

AgentMvcHelper.initAgentCreateDetailsFromCsvState = function(state) {
    var container = state.getContainer();
    container.find("#cancelAgentCreateDetailsFromCsvButton").click(function(){AgentMvcHelper.agentMvc.closeState(state.getId());});

    container.find("form").iframePostForm
    ({
        json : true,
        post : function () {
            $(".modal").modal("show");
        },
        complete : function (response) {
            if (response.status == "SUCCESS") {
                ScpCommon.showMessage(ScpCommon.context.messages.currentPage.successfulImport, ScpCommon.context.messageTimeOut);
                var result = $(AgentMvcHelper.agentMvc.getOptions().agentCsvImportResult(response.dto));
                var importResultContainer = container.find("#importResultContainer");
                importResultContainer.empty();
                importResultContainer.append(result);
                if (response.dto.structureNodes) {
                    ScpCommon.context.nav.divisions = response.dto.structureNodes;
                }
            } else {
                ScpCommon.showError(response.message);
            }
            $(".modal").modal("hide");
        }
    });

    container.find("#saveAgentCreateDetailsFromCsvButton").click(function() {
        if (ScpCommon.validateCsv(container.find("#agentCreateDetailsFromCsvContainer"))) {
            container.find("form").submit();
            var fileContainer = container.find("#file_name");
            fileContainer.removeClass("errorCsvInput");
            fileContainer.children("span.error-image").css("display", "none");
        }
    });

    /* download file from directory */
    container.find("#csv").change(function () {
        container.find("#csv").each(function () {
            var name = this.value;
            reWin = /.*\\(.*)/;
            var fileTitle = name.replace(reWin, "$1");
            reUnix = /.*\/(.*)/;
            fileTitle = fileTitle.replace(reUnix, "$1");
            container.find("#file_name input").val(fileTitle);
            ScpCommon.showPlaceholderIfInputWithoutValue();
        });
    });
};

AgentMvcHelper.inputDetailsValuesToDto = function(container) {
    var agentDto = {};
    var agentInputs = container.find("#generalDetailsContainer :input");
    $.each(agentInputs, function (index, value) {
        if (!ScpCommon.isAutomaticallyGeneratedElement($(value))) {
            agentDto[$(value).attr("id")] = $(value).val();
        }
    });

    var billingDeliveryEmail = $("#billingDeliveryEmail");
    if (billingDeliveryEmail.size() > 0) {
        agentDto[billingDeliveryEmail.attr("id")] = billingDeliveryEmail.val();
    }

    var agentAddressDto = {};
    var agentAddressesInputs = container.find("#physicalAddressContainer :input");
    $.each(agentAddressesInputs, function (index, value) {
        if (!ScpCommon.isAutomaticallyGeneratedElement($(value))) {
            agentAddressDto[$(value).attr("id")] = $(value).val();
        }
    });

    if (agentAddressesInputs.size() > 0) {
        agentDto["agentAddress"] = agentAddressDto;
    }

    var agentProfile = AgentMvcHelper.inputProfileValuesToDto(container);
    if (!$.isEmptyObject(agentProfile)) {
        agentDto["profile"] = agentProfile;
    }

    return agentDto;
};

AgentMvcHelper.inputProfileValuesToDto = function(container) {
    var agentProfileDto = {};
    var inputs = container.find("#agentEditProfileContainer :input:not(#billingDeliveryEmail)");
    $.each(inputs, function (index, value) {
        if (!ScpCommon.isAutomaticallyGeneratedElement($(value))) {
            agentProfileDto[$(value).attr("id")] = $(value).val();
        }
    });
    return agentProfileDto;
}
