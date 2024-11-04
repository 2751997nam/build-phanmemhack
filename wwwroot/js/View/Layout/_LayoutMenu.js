// sự kiện mua coin 
$('.top-up-credit').on('click', function () {
    // Lấy modal
    var modal = $('#RefillModal');
    modal.modal('show');

    // on event đóng modal
    $(window).click(function (event) {
        if (event.target === modal[0]) {
            modal.modal('hide');
        }
    });
});

// sự kiện logout
$('.logout').on('click', function () {
    // Lấy modal
    var modal = $('#OutModal');
    modal.modal('show');

    // on event đóng modal
    $(window).click(function (event) {
        if (event.target === modal[0]) {
            modal.modal('hide');
        }
    });
});

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// register 
$('.btn-register').on('click', function () {
    // Lấy modal
    var modal = $('#modal-register');

    resetForm(modal);

    modal.modal('show');

    // on event đóng modal
    modal.find('.btn-close-register').off('click').on('click', function () {
        modal.modal('hide');
    });

    // on event đóng modal
    $(window).click(function (event) {
        if (event.target === modal[0]) {
            modal.modal('hide');
        }
    });

    modal.find('.btn-submit-register').off('click').on('click', function () {
        var valid = true;
        var account = {};
        // validate form 
        $("#regisform input").each(function () {
            // Sử dụng validity để kiểm tra trạng thái hợp lệ của từng trường input
            if (!this.validity.valid && valid && $(this).attr('name')) {
                valid = false; // Thoát khỏi vòng lặp nếu có ít nhất một trường không hợp lệ
                let titleField = $(this).data('title');

                if (!$(this).val()) {
                    showErrorAlert(i18next.t('Error'), i18next.t('NotAllowNull', { titleField: titleField }));
                }
                else if (this.validity.tooShort) {
                    showErrorAlert(i18next.t('Error'), i18next.t('FieldTooShort', { titleField: titleField }));
                }
                else if (this.validity.patternMismatch) {
                    showErrorAlert(i18next.t('Error'), i18next.t('FieldvalueMissing', { titleField: titleField }));
                }
            }
            else if (valid && $(this).attr('id') == 'rePassword' && $(this).val() != $(`#regisform input[name="Password"]`).val()) {
                showErrorAlert(i18next.t('Error'), i18next.t('RepasswordNotMap'));
                valid = false;
            }
            else if ($(this).attr('name')) {
                let value = $(this).val();
                if ($(this).attr('name') == 'PhoneNumber') {
                    value = modal.find('#countryCode').val() + value;
                }
                account[$(this).attr('name')] = value;
            }
        });
        if (valid) {
            // gọi ajax đăng kí
            callPostAPIPublic('/Account/Register', { acc: JSON.stringify(account) },
                function successMethod() {
                    showSuccessAlert(i18next.t('Success'), i18next.t('AddedUser'));
                    location.reload(true);
                },
                function error(response) {
                    if (response.message) {
                        showErrorAlert(i18next.t('Error'), i18next.t(response.message));
                    }
                }
            );
        }
    });
})

// sự kiện user-modal
$('.user-modal').on('click', function () {
    // Lấy modal
    var modal = $('#UserModal');

    resetForm(modal);

    modal.modal('show');

    // lấy thông tin tài khoản và bind lên
    callPostAPIAuthen('/Account/GetInforMember', null,
        function successMethod(response) {
            if (response && response.data) {
                let dataItem = response.data;
                modal.find('.user-name-infor').text(dataItem.userName);
                modal.find('.user-coin-infor').text(dataItem.coin);
                modal.find('.user-fullname-infor').text(dataItem.fullName);
                modal.find('.user-number-infor').text(dataItem.phoneNumber);
                modal.find('.user-email-infor').text(dataItem.email);
            }
        }
    );

    modal.find('.update-pass-button').off('click').on('click', function () {
        let newPass = modal.find("#newPassword").val(),
            reNewPass = modal.find("#reNewPassword").val(),
            oldPass = modal.find("#oldPassword").val(),
            valid = true;

        // validate
        modal.find("input").each(function () {
            // Sử dụng validity để kiểm tra trạng thái hợp lệ của từng trường input
            if (!this.validity.valid && valid && $(this).attr('id') != 'reNewPassword') {
                valid = false; // Thoát khỏi vòng lặp nếu có ít nhất một trường không hợp lệ
                let titleField = $(this).data('title');

                if (!$(this).val()) {
                    showErrorAlert(i18next.t('Error'), i18next.t('NotAllowNull', { titleField: titleField }));
                }
                else if (this.validity.tooShort) {
                    showErrorAlert(i18next.t('Error'), i18next.t('FieldTooShort', { titleField: titleField }));
                }
                else if (this.validity.patternMismatch) {
                    showErrorAlert(i18next.t('Error'), i18next.t('FieldvalueMissing', { titleField: titleField }));
                }
            }
        });
        if (valid) {
            if (newPass != reNewPass) {
                showErrorAlert(i18next.t('Error'), i18next.t("Thenewpasswordsdonotmatch"));
            }
            else {
                callPostAPIAuthen('/Account/UpdatePasswordCurrentUser', { oldPassword: oldPass, newPassword: newPass },
                    function successMethod(response) {
                        showSuccessAlert(i18next.t('Success'), i18next.t('Passwordchanged'));
                    },
                    function error(response) {
                        if (response.message) {
                            showErrorAlert(i18next.t('Error'), i18next.t(response.message));
                        }
                    }
                )
            }
        }
    });

    // on event đóng modal
    $(window).click(function (event) {
        if (event.target === modal[0]) {
            modal.modal('hide');
        }
    });
});

function sendcode() {
    var usercode = $('#usercode').val();
    if (usercode.length != 16) {
        showQuestionAlert(i18next.t('Invalidinformation'), i18next.t('SystemValidation'));
    }
    else {
        callPostAPIAuthen('/Account/ChangeCreditCode', { code: usercode },
            function success(response) {
                if (response.data != null && response.data != 'undefined') {
                    showSuccessAlert(i18next.t('Successfullytoppedup'), i18next.t('CreditRemainingUnit', { coin: response.data }));
                    $('#usercode').val('');
                    updateCoin(response.data);
                }
            },
            function error(response) {
                if (response.message == "used") {
                    showErrorAlert(i18next.t('Unabletotopup'), i18next.t('Codehasalreadybeenused'));
                }
            }
        );
    }
}

function resetForm(component) {
    component.find("input").each(function () {
        $(this).val('');
    });
    component.find("label").each(function () {
        $(this).text('');
    });
}

$(window).click(function (event) {
    if (!$(event.target).parents('button.navbar-toggler').length &&
        !$(event.target).parents('#mySidenav').length &&
        $(event.target) != $('#mySidenav')) {
        closeNav();
    }
});