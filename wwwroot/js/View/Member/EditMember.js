var currentControl = $('.edit-member-control');

currentControl.find('.btn-update-user').on('click', function () {
    var valid = true;
    var account = {};
    // validate form 
    $(".update-user input").each(function () {
        // Sử dụng validity để kiểm tra trạng thái hợp lệ của từng trường input
        if (!this.validity.valid) {
            valid = false; // Thoát khỏi vòng lặp nếu có ít nhất một trường không hợp lệ
        }
        else if ($(this).attr('name')) {
            account[$(this).attr('name')] = $(this).val();
        }
    });
    if (valid) {
        account['Id'] = currentControl.find('.member-id').val();
        callPostAPIAuthen('/Member/UpdateMember', { acc: JSON.stringify(account) }, function () {
            showSuccessAlert(i18next.t('Success'), i18next.t('EditedMemberSuccess'));
            setTimeout(function () {
               location.reload(true);
            }, 5000);
            
        });
    }
})

currentControl.find('.btn-delete-user').on('click', function () {
    var id = currentControl.find('.member-id').val();
    if (id) {
        callPostAPIAuthen('/Member/DeleteMember', { id: id }, function () {
            showSuccessAlert(i18next.t('Success'), i18next.t('DeletedMemberSuccess'));
            setTimeout(function () {
                window.close();
            }, 5000);
        });
    }
})

function closeCurrentTab() {
    window.close();
}