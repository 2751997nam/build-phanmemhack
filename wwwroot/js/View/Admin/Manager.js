var currentControl = $('.manager-component');

currentControl.find('#updateManager').on('click', function () {
    let valid = true;
    // validate form 
    currentControl.find("input").each(function () {

        let titleField = $(this).data('title');
        if (!$(this).val()) {
            showErrorAlert(i18next.t('Error'), i18next.t('NotAllowNull', { titleField: titleField }));
            valid = false;
        }
    });

    if (valid) {
        callPostAPIAuthen('/Admin/UpdateManager', { linkZalo: currentControl.find('#linkZalo').val(), linkFacebook: currentControl.find('#linkFb').val(), linkZalo: currentControl.find('#linkZalo').val(), linkTele: currentControl.find('#linkTele').val(), linkVideoHome: currentControl.find('#linkVideoHome').val() }, function () {
            showSuccessAlert(i18next.t('Success'), i18next.t('UpdatedManagerSuccess'));
        });
    }
})