function TimePeriods() {

    var outerThis = this;

    this.onChangeDatePeriod = function(value) {
        if (value) {
            $.each(ScpCommon.context.datePeriods, function(index, object) {
                if (object.index == value) {
                    $("#dateFrom").val(object.startDateAsString);
                    $("#dateTo").val(object.endDateAsString);
                    ScpCommon.showPlaceholderIfInputWithoutValue();
                }
            });
        }
    };

    $("#period").change(function() {
        outerThis.onChangeDatePeriod($(this).val());
    });

    $(".select2-input").on("focusin", function() {
        var datepicker = $("#ui-datepicker-div");
        datepicker.hide();
    });

    $(".hasDatepicker").on("focusin", function() {
        var select = $("#select2-drop");
        select.hide();
    });
    
    $(".date-wrapper").on("change", "#dateFrom, #dateTo", function() {
        $("#period").select2('data', null);
        ScpCommon.showPlaceholderIfInputWithoutValue();
    });

    var checkin = $('#dateFrom').datepicker({
        dateFormat: ScpCommon.context.formats.date
    }).on('changeDate', function(ev) {
            if (ev.date.valueOf() > checkout.date.valueOf()) {
                var newDate = new Date(ev.date);
                newDate.setDate(newDate.getDate() + 1);
                checkout.setValue(newDate);
            }
            checkin.hide();
            $('#dateTo')[0].focus();
        }).data('datepicker');

    var checkout = $('#dateTo').datepicker({
        dateFormat: ScpCommon.context.formats.date,
        onRender: function(date) {
            return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
        }
    }).on('changeDate', function(ev) {
            checkout.hide();
        }).data('datepicker');

    var throttled = _.throttle(function() {
      var field = $(document.activeElement);
      if (field.is('.hasDatepicker')) {
            field.datepicker("hide").datepicker("show");
      }
    }, 500);

    $(window).resize(throttled);

}