String.prototype.formatString = function () {
    let args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
};

//---------------------------------//
// cache

function getCookie(name) {
    // Tách các cookie thành từng phần tử trong một mảng
    var cookies = document.cookie.split(";");

    // Duyệt qua mảng cookie và tìm cookie có tên cần lấy
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Kiểm tra xem cookie có bắt đầu bằng tên cần tìm không
        if (cookie.indexOf(name + "=") === 0) {
            // Trả về giá trị của cookie
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    // Trả về null nếu không tìm thấy cookie với tên đã cho
    return null;
}

function setCache(key, value) {
    if (key && value) {
        localStorage.setItem(key, value);
    }
}

function getCache(key) {
    return localStorage.getItem(key);
}

function setSessionItem(key, value) {
    if (key && value) {
        sessionStorage.setItem(key, value);
    }
}

function getSessionItem(key) {
    return sessionStorage.getItem(key);
}

function removeSessionItem(key) {
    return sessionStorage.removeItem(key);
}
//---------------------------------//

//---------------------------------//
// API
function callAPIAjax(url, data, type, hasAuthen, successMethod, errorMethod, customResponseMethod, beforeSendMethod, customOption) {
    objectAjax = {
        url: url,
        type: type,
        data: data,
        dataType: 'json',
        beforeSend: function () {

            if (beforeSendMethod && typeof beforeSendMethod == 'function') {
                beforeSendMethod();
            }
        },
        success: function (response) {
            if (customResponseMethod && typeof customResponseMethod == 'function') {
                customResponseMethod(response);
            }
            else {
                // Xử lý dữ liệu trả về từ máy chủ
                if (response && response.success) {
                    if (successMethod && typeof successMethod == 'function') {
                        successMethod(response);
                    }
                }
                else if (errorMethod && typeof errorMethod == 'function') {
                    errorMethod(response);
                }
                else if (response == null) {
                    showErrorAlert();
                }
                else {
                    showErrorAlert(i18next.t('Error'), i18next.t(response.message));
                }
            }
        },
        error: function (error) {
            switch (error.status) {
                case 429:
                    showErrorAlert(i18next.t('Error'), i18next.t('TooManyRequests'));
                    break;
                case 401:
                    showErrorAlert(i18next.t('Error'), i18next.t('Unauthorized'));
                    break;
                default:
                    showErrorAlert();
                    break;
            }

        }
    };

    if (hasAuthen && getCookie('access_token')) {
        var accessToken = getCookie('access_token');

        if (accessToken) {
            objectAjax.headers = {
                "Authorization": "Bearer " + accessToken
            }
        }
    }

    if (customOption && typeof customOption == 'object') {
        objectAjax = { ...objectAjax, ...customOption }
    }

    $.ajax(objectAjax);
}

function callPostAPIAuthen(url, data, successMethod, errorMethod, beforeSendMethod, customResponseMethod, customOption) {
    callAPIAjax(url, data, 'POST', true, successMethod, errorMethod, customResponseMethod, beforeSendMethod, customOption)
}

function callGetAPIAuthen(url, data, successMethod, errorMethod, beforeSendMethod, customResponseMethod) {
    callAPIAjax(url, data, 'GET', true, successMethod, errorMethod, customResponseMethod, beforeSendMethod)
}

function callPostAPIPublic(url, data, successMethod, errorMethod, beforeSendMethod, customResponseMethod) {
    callAPIAjax(url, data, 'POST', false, successMethod, errorMethod, customResponseMethod, beforeSendMethod)
}

function callGetAPIPublic(url, data, successMethod, errorMethod, beforeSendMethod, customResponseMethod) {
    callAPIAjax(url, data, 'GET', false, successMethod, errorMethod, customResponseMethod, beforeSendMethod)
}

//---------------------------------//

//---------------------------------//
// Thông báo
// Hàm hiển thị thông báo thành công
function showSuccessAlert(title = i18next.t('Success'), text = i18next.t('Donesuccessfully'), customOption) {
    var option = {
        icon: 'success',
        title: title,
        text: text,
        timer: 3000
    }
    if (customOption && typeof customOption == 'object') {
        option = { ...option, ...customOption }
    }
    Swal.fire(option);
}

// Hàm hiển thị thông báo lỗi
function showErrorAlert(title = i18next.t('Error'), text = i18next.t('AnErrorHasOccurred'), customOption) {
    var option = {
        icon: 'error',
        title: title,
        text: text,
        timer: 3000
    }
    if (customOption && typeof customOption == 'object') {
        if (customOption.timer) {
            delete option.timer;
        }
        option = { ...option, ...customOption }
    }
    Swal.fire(option);
}

function showMaintainAlert(title = i18next.t('Maintain'), text = i18next.t('TableMaintain'), customOption) {
    var option = {
        icon: 'error',
        title: title,
        text: text,
        timer: 0,
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
    }
    if (customOption && typeof customOption == 'object') {
        if (customOption.timer) {
            delete option.timer;
        }
        option = { ...option, ...customOption }
    }
    Swal.fire(option);
}

function showWarningAlert(title = i18next.t('Warning'), text = i18next.t('Pleasenote'), customOption) {
    var option = {
        icon: 'warning',
        title: title,
        text: text,
        timer: 3000
    }
    if (customOption && typeof customOption == 'object') {
        if (customOption.timer) {
            delete option.timer;
        }
        option = { ...option, ...customOption }
    }
    Swal.fire(option);
}

function showQuestionAlert(title, text, customOption) {
    var option = {
        icon: 'question',
        title: title,
        text: text,
        timer: 3000
    }
    if (customOption && typeof customOption == 'object') {
        if (customOption.timer) {
            delete option.timer;
        }
        option = { ...option, ...customOption }
    }
    Swal.fire(option);
}

function showStartLoadingAlert(title = 'Cảnh báo!', allowOutsideClick = false, customOption) {
    var option = {
        title: title,
        allowOutsideClick: allowOutsideClick
    }
    if (customOption && typeof customOption == 'object') {
        if (customOption.timer) {
            delete option.timer;
        }
        option = { ...option, ...customOption }
    }
    Swal.fire(option);

    swal.showLoading();
}

function showEndLoadingAlert() {
    swal.close();
}
//---------------------------------//

//---------------------------------//
// xử lý element
function showElement(element) {
    element.removeClass('hidden');
}
function hideElement(element) {
    element.removeClass('hidden').addClass('hidden');
}

//---------------------------------//