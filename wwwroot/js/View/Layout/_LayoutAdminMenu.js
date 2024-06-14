$('#divMulti').hide();


// sự kiện logout
$('.logout').on('click', function () {
    // Lấy modal
    var modal = $('#OutModal');

    // on event đóng modal
    $(window).click(function (event) {
        if (event.target === modal[0]) {
            modal.modal('hide');
        }
    });
});

// sự kiện create-user
$('.create-user').on('click', function (e) {
    // Lấy modal
    let modal = $('#CreateModal');

    resetForm(modal);

    modal.find('.userType').empty();
    // lấy danh sách role
    callPostAPIAuthen('/Role/GetListRoleByRoleUser', null, function (response) {
        if (response && response.data && response.data.length) {
            let htmlOption = '';
            for (var i = 0; i < response.data.length; i++) {
                let item = response.data[i],
                    roleNamelocalize = i18next.t("Role" + item.roleCode);
                if (item) {
                    htmlOption += `<option value="${item.roleCode}">${roleNamelocalize}</option>`
                }
            }
            modal.find('.userType').append(htmlOption);
            modal.find('.userType').val(response.data[0].roleCode);
        }
    });

    modal.find('.register-user').off('click').on('click', function (event) {
        let valid = true,
            account = {};
        // validate form 
        modal.find("input, select").each(function () {
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
            else if (valid && $(this).attr('id') == 'rePassword' && $(this).val() != modal.find(`input[name="Password"]`).val()) {
                showErrorAlert(i18next.t('Error'), i18next.t('RepasswordNotMap'));
                valid = false;
            }
            else if ($(this).attr('name')) {
                account[$(this).attr('name')] = $(this).val();
            }
        });
        if (valid) {
            // gọi ajax đăng kí
            callPostAPIAuthen('/Account/RegisterForAdmin', { acc: JSON.stringify(account) },
                function successMethod() {
                    showSuccessAlert(i18next.t('Success'), i18next.t('AddedUser'));
                    modal.modal('hide');
                },
                function error(response) {
                    if (response.message) {
                        showErrorAlert(i18next.t('Error'), i18next.t(response.message));
                    }
                });
        }

        event.preventDefault();
    })
    // on event đóng modal
    $(window).click(function (event) {
        if (event.target === modal[0]) {
            modal.modal('hide');
        }
    });
});

// sự kiện create-code-coin
$('.create-code-coin').on('click', function () {
    // Lấy modal
    var modal = $('#CodeModal');
    resetForm(modal);

    // on event đóng modal
    $(window).click(function (event) {
        if (event.target === modal[0]) {
            modal.modal('hide');
        }
    });
});

$('.language-setting').on('click', function () {
    // Lấy modal
    var modal = $('#LanguageSettingModal');
    callGetAPIAuthen('/Admin/GetLanguageDefault', null, function (response) {
        if (response && response.data) {
            modal.find('#defautLanguage').val(response.data.optionValue);
        }
    });
    modal.find('.update-language').off('click').on('click', function () {
        if (modal.find('#defautLanguage').val()) {
            callPostAPIAuthen('/Admin/UpdateLanguageDefault', { languageCode: modal.find('#defautLanguage').val() }, function successMethod(response) {
                showSuccessAlert(i18next.t('Success'), i18next.t('UpdatedLanguageDefault'));
                location.reload(true);
            });
        }
    })
    // on event đóng modal
    $(window).click(function (event) {
        if (event.target === modal[0]) {
            modal.modal('hide');
        }
    });
});


function genCodeCredit(event) {
    var incredit = $('#creditcoin').val();
    var multipleCode = $('#multipleCode').val();
    if (isNaN(incredit) || incredit == "" || ($('#divMulti').is(":visible") && multipleCode != null && isNaN(multipleCode))) {
        showQuestionAlert(i18next.t('Invaliddata'), i18next.t('Allownumbersonly'));
    }
    else if (incredit < 1) {
        showQuestionAlert(i18next.t('Invaliddata'), i18next.t('Minimumtopup1bahtormore'));
    }
    else if ($('#divMulti').is(":visible") && (multipleCode < 1 || multipleCode > 1001)) {
        showWarningAlert(i18next.t('Invaliddata'), i18next.t('CreateCodeupto1000Codesatatime'));
    }
    else {
        callPostAPIAuthen('/Member/CreditCodeCoin', { coin: incredit, multipleCode: multipleCode },
            function success(response) {
                showEndLoadingAlert();
                if (response && response.data) {
                    if (response.message) {
                        showWarningAlert(i18next.t(response.message), '');
                    }
                    else {
                        showSuccessAlert(i18next.t('Codegenerated'), i18next.t('Codehasbeengeneratedsuccessfully'), { timer: 3000 });
                        updateCoin(response.data);
                    }
                    $('#createdCreditCode').val(response.data);
                }
                else {
                    showWarningAlert(i18next.t(response.message), '')
                }
            },
            null,
            function beforeSend() {
                document.getElementById("genbut").disabled = true;
                showStartLoadingAlert(i18next.t('CreatingCode'));
            });
    }
};

function copycode() {
    var copyText = $('#createdCreditCode');
    copyText.select();
    document.execCommand("copy", false, null);
};

function multiBtnClick() {
    $('#divMulti input').val(1);
    $('#divMulti').toggle();
}

function resetForm(component) {
    component.find("input").each(function () {
        $(this).val('');
    });
}

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

$('.change-infor').on('click', function () {
    // Lấy modal
    var modal = $('#UserModal');

    modal.modal('show');

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
                callPostAPIAuthen('/Account/UpdatePasswordAndUserNameCurrentUser', { oldPassword: oldPass, newPassword: newPass, userName: modal.find("input#userName").val() },
                    function successMethod(response) {
                        showSuccessAlert(i18next.t('Success'), i18next.t('Passwordchanged'));

                        // gọi logout sau khi thành công
                        window.location.href = window.location.origin + '/Account/Logout';
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

function restoreInforUser() {
    $('.user-infor-upload').click();
    $('.user-infor-upload').off('change').on('change', function (e) {
        // Lấy danh sách các tệp đã chọn
        let files = e.target.files;
        if (!files || (Array.isArray(files) && files.length > 1)) {
            showWarningAlert(i18next.t('Warning'), i18next.t('AllowChooseOneFile'));
            return;
        }

        // gọi lưu file
        var formData = new FormData();
        formData.append('file', files[0]);

        callPostAPIAuthen('/Member/RestoreFullUserInfor', formData,
            function successMethod(res) {
                if (res.data) {
                    showSuccessAlert(i18next.t('Success'), i18next.t(res.data));
                }
            },
            function errorMethod(res) {
                if (res.data) {
                    showErrorAlert(i18next.t('Error'), i18next.t(res.data));
                }
            },
            null,
            null,
            {
                processData: false,
                contentType: false,
                dataType: 'json'
            });
    })
}

window.addEventListener('load', function () {
    var navHeight = document.querySelector('nav').offsetHeight + 10;
    document.body.style.paddingTop = navHeight + 'px';
});

window.addEventListener('resize', function () {
    var navHeight = document.querySelector('nav').offsetHeight + 10;
    document.body.style.paddingTop = navHeight + 'px';
});