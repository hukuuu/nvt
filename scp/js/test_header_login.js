$(function () {

    $.findByName("type").click(function(event) {
        var type = $(event.target).attr("value");
        var checked = $(event.target).prop("checked");
        $.findById("cidnContainer").toggle(checked && type == "EXTERNAL");
        $.findById("escidContainer").toggle(checked && type == "EXTERNAL");
        $.findById("authenticationProfileContainer").toggle(checked && type == "INTERNAL");
    });
    $("[name='type'][value='INTERNAL']").prop("checked", true);
    $("[name='type']:checked").trigger("click");

    $.findById("signin").click(function() {
        var type = $("[name='type']:checked").attr("value");
        var cidn = $.findById("cidn").val();
        var escid = $.findById("escid").val();
        var username = $.findById("username").val();
        var authenticationProfile = $.findById("authenticationProfile").val();
        var data = {};
        if (type == "EXTERNAL") {
            data[ScpCommon.context.externalUserCidnHeader] = cidn;
            data[ScpCommon.context.externalUserUsernameHeader] = username;
            data[ScpCommon.context.externalUserEscidHeader] = escid;
        } else {
            data[ScpCommon.context.internalUserUsernameHeader] = username;
            data[ScpCommon.context.internalUserAuthProfileHeader] = authenticationProfile;
        }
        $.ajax({
            url: ScpCommon.baseUrl + "support/index.htm",
            headers: data,
            dataType: "html",
            success: function (data) {
                window.location.href = ScpCommon.context.signinurl;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                ScpCommon.showError(jqXHR.responseText);
            }
        });
    });


});