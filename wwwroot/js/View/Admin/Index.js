var currentControl = $('.credit-component');

currentControl.find('#changePassBtn').on('click', function () {
    // validate form 
    currentControl.find("input").each(function () {
        if (this.validity.valid && $(this).val()) {
            callPostAPIAuthen('/Member/UpdatePassword', { id: $(this).val() }, function () {
            });
        }
    });
})