$(function () {

    var $navTree = $('#nav_tree');
    var $navChildren = $('#nav_children');
    var $navContainer = $navTree.closest('.span6');

    var tpl = _.template($("#agentStructureBreadcrumbTpl").html());
    var tpl2 = _.template($("#agentStructureSiblingTpl").html());
    var search = _.template($("#agentStructureSearchTpl").html());
    var fxDuration = 150;

    var Nav = {
        divisions: [],
        selected: 0,
        currentDepth: 0,
        searchLimit: ScpCommon.context.searchBoxMinItems,

        renderBreadcrumbs: function (selected) {
            selected = selected || this.selected;
            var division = _.findWhere(this.divisions, {id: selected}),
                breadcrumbs = [],
                _this = this;

            while (division) {
                breadcrumbs.push(division);
                division = _.findWhere(this.divisions, {id: division.parent});

                if (division && ! division.parent) {
                    breadcrumbs.push(division);
                    division = null;
                }
            }
            var currentLevel = breadcrumbs.length;
            this.currentDepth = currentLevel;

            function render (breadcrumbs, index) {
                if (! breadcrumbs[index]) {
                    return '';
                }
                var childElement = render(breadcrumbs, index - 1);
                var data = {
                    item: breadcrumbs[index],
                    children: childElement != '' ? [childElement] : [],
                    active: false,
                    index: Math.min(currentLevel, 4)
                };

                if (breadcrumbs[index].id === selected) {
                    if (_this.levelCount > _this.searchLimit) {
                        data.children.push($(search({count: _this.levelCount})));
                    }
                    data.active = true;
                }
                var result = $(tpl(data)),
                    marker = result.find("[data-id]");
                
                $.each(data.children, function(index, value) {
                    $(value).insertAfter(marker);
                });
                currentLevel--;
                return result;
            }

            $navTree.html(render(breadcrumbs, breadcrumbs.length - 1));
        },

        centerActive: function (animate) {
            var $el = $navTree.find('div[data-id]:last'),
                left = $navTree.parent().width() / 2 - ($el.offset().left - $navTree.offset().left + $el.width() / 2);

            if (animate) {
                $navTree.animate({left: left}, fxDuration);
            } else {
                $navTree.css({left: left});
            }
        },

        setBreadCrumbsHeight: function () {
            var $last = $navTree.find('.nav-item:last > .btn'),
                $first = $navTree.find('.nav-item:first > .btn'),
                top = $last.offset().top - $first.offset().top + $last.outerHeight() + 10,
                maxHeight = $navContainer.height() * 0.3;

            if (top > maxHeight) {
                $navTree.css({top: maxHeight - top});
                top = maxHeight;
            }
            else {
                $navTree.animate({top: 0}, fxDuration);
            }
            $navTree.parent().css({height: top});
        },

        setSiblingsScrollableHeight: function () {
            var $el = $navChildren.parent(),
                height = $navContainer.innerHeight() - 26;

            $el.siblings().each(function () {
                height -= $(this).outerHeight();
            });

            $el.css({height: (height < 40) ? 40 : height});
        },

        renderSiblings: function (children) {
            var html = [],
                index = $navTree.find('div[data-id="'+this.selected+'"]').attr('data-index');

            for (var i=0, l=children.length; i<l; i++) {
                html.push(tpl2({item: children[i], index: parseInt(index) + 1}));
            }
//            if (! children.length) {
//                html = ['<h5 class="text-center">No items to display</h5>'];
//            }
            $navChildren.html(html.join('')).css({top: 0});            
        },

        render: function (selected, animate) {
            this.selected = selected || this.selected;
            this.levelCount = _.where(Nav.divisions, {parent: this.selected}).length;

            if (! this.levelCount && !isMasterDistributer(this)) return;

            this.renderBreadcrumbs();
            this.renderSiblings(_.where(this.divisions, {parent: this.selected}));

            this.centerActive(animate);
            this.setBreadCrumbsHeight();
            this.setSiblingsScrollableHeight();
        },

        cd: function (ev) {
            ev.preventDefault();
            Nav.updateStructure($(ev.currentTarget).attr('data-id'));
        },

        search: function (e) {
            var val = $(e.currentTarget).val(),
                children = _.where(this.divisions, {parent: this.selected});

            if (! children.length) {
                var item = _.findWhere(this.divisions, {id: this.selected});
                children = _.where(this.divisions, {parent: item.parent});
            }

            this.renderSiblings(_.filter(children, function (item) {
                return item.name.toLowerCase().indexOf(val.toLowerCase()) >= 0;
            }));
        },
        
        updateStructure: function (id, skipUpdatingAgentInfo) {
            if (_.where(this.divisions, {id: id}).length === 1) {
                this.render(id, true);
                skipUpdatingAgentInfo || AgentMvcHelper.agentMvc.updateAgentInfo(id);
            }
        }
    };
    
    function isMasterDistributer (object){
    	division = object.divisions[0];
    	return object.divisions.length==1 && division.type =="MD";
    }

    /* Search nodes in structure (only on current level) */
    $(document).on('keyup', '#id_search', $.proxy(Nav.search, Nav));


    /* Navigate structure */
    $navTree.parent().on('mousedown', function (e) {
        var time = new Date().getTime(),
            coords = {x: e.pageX, y: e.pageY},
            left = parseFloat($navTree.css('left')),
            $el = $(this);

        $el.on('mousemove', function (e) {
            $navTree.css({left: left + e.pageX - coords.x});
        })
        .one('mouseup mouseleave', function () {
            var totalBtnWidth = Nav.currentDepth * $navTree.find('div.nav-item:first').width(), // assume all buttons have equal width
                left = parseFloat($navTree.css('left'));

            if (new Date().getTime() - time < 250) {
                Nav.updateStructure($(e.target).closest('.btn').attr('data-id'));
            }
            else if (left > $el.width() - 10 || left < 0 - totalBtnWidth + 10) {
                Nav.centerActive(true);
            }
        });
    }).on('mouseup', function () {
        $(this).off('mousemove');
    });

    $navChildren.parent().on('mousedown', function (e) {
        if ($navChildren.height() <= $(this).height()) {
            return;
        }

        var $el = $(this),
            coords = {x: e.pageX, y: e.pageY},
            top = parseFloat($navChildren.css('top'));

        $el.on('mousemove', function (e) {
            $navChildren.css({top: top + e.pageY - coords.y});
        })
        .one('mouseup mouseleave', function () {
            var top = parseFloat($navChildren.css('top')),
                diff = - ($navChildren.height() - $el.height());

            if(top > 0 || $navChildren.height() < $navChildren.parent().height()) {
                $navChildren.animate({top: 0}, fxDuration);
            }
            else if (top < diff) {
                $navChildren.animate({top: diff}, fxDuration);
            }
        });
    }).on('mouseup', function () {
        $(this).off('mousemove');
    });

    $navChildren
    .on('click', 'div.btn', function () {
        Nav.cd.apply(this, arguments);
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });

    /* Recalculate structure widget height on agent panel update */
    var $tooltips;

    $(document).on('agentinfo:update agentstate:close', _.debounce(function () {
            Nav.centerActive();
            Nav.setBreadCrumbsHeight();
            Nav.setSiblingsScrollableHeight();
        }, 200)).on('agentinfo:update', function () {
        if ($tooltips && $tooltips.length) {
            $('.tooltip').remove();
        }
        $tooltips = $('.nav-child .btn, #nav_tree .breadcrumb');
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

    /* Update structure view on window resize */
    $(window).on('resize', _.debounce(function () {
        Nav.render();
    }, 200));

    $.findById("agentMvcContainer").agentMvc();
    AgentMvcHelper.agentMvc = new AgentMvcWrapper($.findById("agentMvcContainer"));
    AgentMvcHelper.agentMvc.openState("agentStructureState");

    Nav.divisions = ScpCommon.context.structureNodes;
    ScpCommon.context.nav = Nav;
    if (Nav.divisions.length > 0){
        Nav.updateStructure(Nav.divisions[0].id);
    }
});

function loadDocumentContents(documentId){
	$.ajax({
	    url: ScpCommon.baseUrl + "agent/helpDocument.htm",
	    dataType: "html",
	    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	    data: {'code': documentId},
	    error: function (jqXHR, textStatus, errorThrown) {
	        if(jqXHR.status == 403){
	            ScpCommon.showError(JSON.parse(jqXHR.responseText).message);
	        } else {
	            ScpCommon.showError(errorThrown);
	        }
	    },
	    success: function (data) {
	        var helpDocumentContent = $("#helpDocumentContent");
	        helpDocumentContent.html(data);
	    }
	});
}

function setIeWarningMessageDisplayed()
{
	$.ajax({
        url: ScpCommon.baseUrl + "agent/ieWarning.json",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8"
    });	
}

function displayIeWarningMessage(){ 
	 $.ajax({
		 url: ScpCommon.baseUrl + "agent/isIeWarningDisplayed.json",
	     contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	     success: function (isMsgDisplayed) {
	        if (!isMsgDisplayed) {
	        	ScpCommon.showInfomationMessage(ScpCommon.context.messages.ie7.ie7warningMessage, ScpCommon.context.messages.ie7.ie7warningTitle);
	    		setIeWarningMessageDisplayed();
             }
	     }
	 });
}

$( document ).ready(function() {
	if ($('html').hasClass('ie7')){
		displayIeWarningMessage();
	}
});

