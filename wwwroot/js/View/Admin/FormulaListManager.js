let currentControl = $('.formula-list-manager-control');

currentControl.find('.table-formula-manager .file-upload-formula-button').on('click', function (e) {
    var tdElement = $(e.target).parents('td');
    tdElement.find('.file-upload-formula').click();
});

currentControl.find('.table-formula-manager .file-upload-formula').on('change', function (e) {
    var trElement = $(e.target).parents('tr');
    var formulaName = trElement.find('.formula-name').data('name');
    // Lấy danh sách các tệp đã chọn
    let files = e.target.files;
    if (!files || (Array.isArray(files) && files.length > 1)) {
        showWarningAlert(i18next.t('Warning'), i18next.t('AllowChooseOneFile'));
        return;
    }

    // gọi lưu file
    var formData = new FormData();
    formData.append('file', files[0]);
    formData.append('formulaName', formulaName);

    callPostAPIAuthen('/Formula/UpdateFormula', formData,
        function successMethod() {
            showSuccessAlert(i18next.t('Success'), i18next.t('UploadFormulaFileSuccess'));
            location.reload();
        },
        null,
        null,
        null,
        {
            processData: false,
            contentType: false,
            dataType: 'json'
        });
});

currentControl.find('.update-token').on('click', function (e) {
    var newToken = currentControl.find('#token').val();
    if (newToken) {
        callPostAPIAuthen('/Admin/UpdateToken', { token: newToken }, function () {
            showSuccessAlert(i18next.t('Success'), i18next.t('TokenUpdateSuccess'));
            currentControl.find('#token').val(newToken);
        });
    }
    else {
        showErrorAlert(i18next.t('Error'), i18next.t('TokenNotNull'));
    }
});