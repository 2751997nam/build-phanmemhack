var currentControl = $('.login-component');

// gọi ajax đăng nhập
currentControl.find('.btn-login').on('click', function () {
    if (check_Code()) {
        var emailOrUserName = currentControl.find('#txtEmailOrUserName').val(),
            password = currentControl.find('#txtPassword').val();
        if (emailOrUserName && password) {
            callPostAPIPublic('/Account/Login', { emailOrUserName: emailOrUserName, password: password },
                function successMethod(response) {
                    showEndLoadingAlert();
                    showSuccessAlert(i18next.t('Successfullyloggedin'), i18next.t('LogginginPleasewaitamoment'), { timer: 3000 });
                    if (response && response.data && response.data.isAdmin) {
                        window.location.href = window.location.origin + '/Member/Index'
                    }
                    else {
                        window.location.href = window.location.origin + '/Home/Index'
                    }
                },
                function errorMethod(response) {
                    if (response && response.message) {
                        showErrorAlert(i18next.t('Cannotlogin'), i18next.t(response.message));
                    }

                },
                function beforeSend() {
                    showStartLoadingAlert(i18next.t('Connecting'));
                });
        }
    }
    else {
        showErrorAlert(i18next.t('InvalidSecurityCode'), i18next.t('Pleasetryagain'));
    }
})

var sec_code = [];
$(document).ready(function () {
    var gen_code = [];
    for (var i = 0; i < 4; i++) {
        gen_code[i] = Math.floor(Math.random() * 9);
    }
    $("#secCode").html(gen_code);
    sec_code = gen_code;
});

function check_Code() {
    let inputCode = $("#input_code").val();
    let checkCode = inputCode.split("");
    for (var i = 0; i < 4; i++) {
        if (checkCode[i] != sec_code[i]) {
            return false;
        }
    }
    return true;
}

$(document).ready(function () {
    currentControl.on("keydown", function (event) {
        if (event.key === "Enter") {
            // Call your function or perform the desired action here
            currentControl.find('.btn-login').click();
        }
    });
})

currentControl.find('.btn-register').on('click', function () {
    $('a.btn-register').click();
})