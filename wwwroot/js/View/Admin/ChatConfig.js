let currentControl = $('.member-list-control'),
    appCode = currentControl.find('#appCode').val();

addHandleAddMessage();
addHandleAddUser();
addHandleUpdateChatConfig();
getListChatMessageData();
addHandleEditUser();
addHandleDeleteUser();

function getListChatMessageData() {
    callPostAPIAuthen('/Chat/GetListChatTemplate', { appCode: appCode },
        function (response) {
            let htmlAppend = '';
            if (response && response.data && response.data.length) {
                var dataGrid = response.data;

                for (var i = 0; i < dataGrid.length; i++) {
                    let item = dataGrid[i];

                    htmlAppend += `<tr id="${item.id}">
                                       <td class="message-row">${item.message}</td>
                                        <td style="vertical-align: middle;">
                                            <button class="btn btn-outline-warning edit-message" data-toggle="modal" data-target="#EditMessage">
                                                <i class="far fa-edit fa-lg"></i>
                                            </button>
                                            <button class="btn btn-outline-warning delete-message">
                                                <i class="far fa-trash-alt fa-lg"></i>
                                            </button>
                                        </td>
                                    </tr>`;

                    currentControl.find('.table-list-message tbody tr.no-data').hide();
                }
            }
            else {
                currentControl.find('.table-list-message tbody tr.no-data').show();
            }

            currentControl.find('.table-list-message tbody tr:not(.no-data)').remove();
            if (htmlAppend) {
                currentControl.find('.table-list-message tbody').append(htmlAppend);
                addHandleEditMessage();
                addHandleDeleteMessage();
            }
        });
}

function getListChatUserData() {
    callPostAPIAuthen('/Chat/GetListChatUserTemplate', {},
        function (response) {
            let htmlAppend = '';
            if (response && response.data && response.data.length) {
                var dataGrid = response.data;

                for (var i = 0; i < dataGrid.length; i++) {
                    let item = dataGrid[i];

                    htmlAppend += `<tr id="${item.id}">
                                       <td class="user-row">${item.userName}</td>
                                        <td style="vertical-align: middle;">
                                            <button class="btn btn-outline-warning edit-user" data-toggle="modal" data-target="#EditUserName">
                                                <i class="far fa-edit fa-lg"></i>
                                            </button>
                                            <button class="btn btn-outline-warning delete-user">
                                                <i class="far fa-trash-alt fa-lg"></i>
                                            </button>
                                        </td>
                                    </tr>`;

                    currentControl.find('.table-list-user tbody tr.no-data').hide();
                }
            }
            else {
                currentControl.find('.table-list-user tbody tr.no-data').show();
            }

            currentControl.find('.table-list-user tbody tr:not(.no-data)').remove();
            if (htmlAppend) {
                currentControl.find('.table-list-user tbody').append(htmlAppend);
                addHandleEditUser();
                addHandleDeleteUser();
            }
        });
}

function addHandleEditMessage() {
    currentControl.find('.table-list-message tbody tr .edit-message').off('click').on('click', function (e) {
        let modal = $('#EditMessage');
        let trElement = $(e.target).parents('tr'),
            id = trElement.attr('id');
        modal.find('.message-template-input').val(trElement.find('.message-row').text());
        modal.find('.update-message').off('click').on('click', function (event) {
            let messageUpdate = modal.find('.message-template-input').val();
            callPostAPIAuthen('/Chat/UpdateTemplateMessage', { id: id, message: messageUpdate },
                function successMethod() {
                    showSuccessAlert(i18next.t('Success'), i18next.t('UpdateMessageTemplateSuccess'));
                    modal.modal('hide');
                    trElement.find('.message-row').text(messageUpdate)
                },null)
        })
        $(window).click(function (event) {
            if (event.target === modal[0]) {
                modal.modal('hide');
            }
        });
    })
}

function addHandleDeleteMessage() {
    currentControl.find('.table-list-message tbody tr .delete-message').off('click').on('click', function (e) {
        let trElement = $(e.target).parents('tr'),
            id = trElement.attr('id');
        callPostAPIAuthen('/Chat/DeleteTemplateMessage', { id: id }, function () {
            showSuccessAlert(i18next.t('Success'), i18next.t('DeleteMessageTemplateSuccess'));
            trElement.remove();
        });
    })
}

function addHandleEditUser() {
    currentControl.find('.table-list-user tbody tr .edit-user').off('click').on('click', function (e) {
        let modal = $('#EditUserName');
        let trElement = $(e.target).parents('tr'),
            id = trElement.attr('id');
        modal.find('.user-template-input').val(trElement.find('.user-row').text());
        modal.find('.update-user').off('click').on('click', function (event) {
            let userName = modal.find('.user-template-input').val();
            callPostAPIAuthen('/Chat/UpdateUserNameChatTemplate', { id: id, userName: userName },
                function successMethod() {
                    showSuccessAlert(i18next.t('Success'), i18next.t('UpdateUserTemplateSuccess'));
                    modal.modal('hide');
                    trElement.find('.user-row').text(userName)
                }, function errorMethod(res) {
                    if (res.message) {
                        if (res.message == 'UserNameNull') {
                            showErrorAlert(i18next.t('Error'), i18next.t('UserNameNull'));
                        }
                        else if (res.message == 'UserNameExists') {
                            showErrorAlert(i18next.t('Error'), i18next.t('UserNameExists'));
                        }
                    }
                })
        })
        $(window).click(function (event) {
            if (event.target === modal[0]) {
                modal.modal('hide');
            }
        });
    })
}

function addHandleDeleteUser() {
    currentControl.find('.table-list-user tbody tr .delete-user').off('click').on('click', function (e) {
        let trElement = $(e.target).parents('tr'),
            id = trElement.attr('id');
        callPostAPIAuthen('/Chat/DeleteUserNameTemplate', { id: id }, function () {
            showSuccessAlert(i18next.t('Success'), i18next.t('DeleteUserTemplateSuccess'));
            trElement.remove();
        });
    })
}

function addHandleAddMessage() {
    currentControl.find('#addMessageButton').off('click').on('click', function (e) {
        let modal = $('#AddMessage');

        modal.find('.add-message').off('click').on('click', function (event) {
            let message = modal.find('.message-template-input').val();
            callPostAPIAuthen('/Chat/InsertChatTemplateMessage', { appCode: appCode, message: message },
                function successMethod() {
                    showSuccessAlert(i18next.t('Success'), i18next.t('AddMessageTemplateSuccess'));
                    modal.modal('hide');
                    getListChatMessageData();
                }, null)
        })
        $(window).click(function (event) {
            if (event.target === modal[0]) {
                modal.modal('hide');
            }
        });
    })
}

function addHandleAddUser() {
    currentControl.find('#addUserButton').off('click').on('click', function (e) {
        let modal = $('#AddUserName');

        modal.find('.add-user').off('click').on('click', function (event) {
            let userName = modal.find('.user-template-input').val();
            callPostAPIAuthen('/Chat/InsertUserNameChatTemplate', { userName: userName },
                function successMethod() {
                    showSuccessAlert(i18next.t('Success'), i18next.t('AddUserTemplateSuccess'));
                    modal.modal('hide');
                    getListChatUserData();
                }, function errorMethod(res) {
                    if (res.message) {
                        if (res.message == 'UserNameNull') {
                            showErrorAlert(i18next.t('Error'), i18next.t('UserNameNull'));
                        }
                        else if (res.message == 'UserNameExists') {
                            showErrorAlert(i18next.t('Error'), i18next.t('UserNameExists'));
                        }
                    }
                })
        })
        $(window).click(function (event) {
            if (event.target === modal[0]) {
                modal.modal('hide');
            }
        });
    })
}

function addHandleUpdateChatConfig() {
    currentControl.find('#updateChatConfig').off('click').on('click', function (e) {
        let valid = true,
            chatConfig = {
                appCode: appCode
            };
        currentControl.find("#changeChatMessage input").each(function () {
            // Sử dụng validity để kiểm tra trạng thái hợp lệ của từng trường input
            if (!this.validity.valid && valid && $(this).attr('id')) {
                valid = false; // Thoát khỏi vòng lặp nếu có ít nhất một trường không hợp lệ
                let titleField = $(this).data('title');

                if (!$(this).val()) {
                    showErrorAlert(i18next.t('Error'), i18next.t('NotAllowNull', { titleField: titleField }));
                }
            }
            else if (valid && $(this).attr('id') == 'MinChatRandom' && parseInt($(this).val()) > parseInt(currentControl.find("#changeChatMessage #MaxChatRandom").val())) {
                showErrorAlert(i18next.t('Error'), i18next.t('MinChatRandomNotOverMax'));
                valid = false;
            }
            else if (valid && $(this).attr('id') == 'MaxChatRandom' && parseInt($(this).val()) < parseInt(currentControl.find("#changeChatMessage #MinChatRandom").val())) {
                showErrorAlert(i18next.t('Error'), i18next.t('MaxChatRandomNotUnderMin'));
                valid = false;
            }
            else if (valid && $(this).attr('id') == 'MinViewRandom' && parseInt($(this).val()) > parseInt(currentControl.find("#changeChatMessage #MaxViewRandom").val())) {
                showErrorAlert(i18next.t('Error'), i18next.t('MinViewRandomNotOverMax'));
                valid = false;
            }
            else if (valid && $(this).attr('id') == 'MaxViewRandom' && parseInt($(this).val()) < parseInt(currentControl.find("#changeChatMessage #MinViewRandom").val())) {
                showErrorAlert(i18next.t('Error'), i18next.t('MaxViewRandomNotUnderMin'));
                valid = false;
            }
            else if (valid && $(this).attr('id') == 'MinView' && parseInt($(this).val()) > parseInt(currentControl.find("#changeChatMessage #MaxView").val())) {
                showErrorAlert(i18next.t('Error'), i18next.t('MinViewNotOverMax'));
                valid = false;
            }
            else if (valid && $(this).attr('id') == 'MaxView' && parseInt($(this).val()) < parseInt(currentControl.find("#changeChatMessage #MinView").val())) {
                showErrorAlert(i18next.t('Error'), i18next.t('MaxViewNotUnderMin'));
                valid = false;
            }
            else if ($(this).attr('id')) {
                chatConfig[$(this).attr('id')] = $(this).val();
            }
        });

        if (valid) {
            callPostAPIAuthen('/Chat/UpdateChatConfig', { chatConfig: JSON.stringify(chatConfig) },
                function successMethod() {
                    showSuccessAlert(i18next.t('Success'), i18next.t('UpdateChatConfigSuccess'));
                }, null)
        }
    })
}

function changeAppCode() {
    var selectappCode = currentControl.find('#appCode'),
        newappCode = currentControl.find('#appCode').val(),
        url = selectappCode.data('url');

    window.location.href = url + '?appCode=' + newappCode;
}


function addUserMulti() {
    $('.add-user-upload').click();
    $('.add-user-upload').off('change').on('change', function (e) {
        // Lấy danh sách các tệp đã chọn
        let files = e.target.files;
        if (!files || (Array.isArray(files) && files.length > 1)) {
            showWarningAlert(i18next.t('Warning'), i18next.t('AllowChooseOneFile'));
            return;
        }

        // gọi lưu file
        var formData = new FormData();
        formData.append('file', files[0]);

        callPostAPIAuthen('/Chat/AddMultiUser', formData,
            function successMethod(res) {
                if (res.data) {
                    showSuccessAlert(i18next.t('Success'), i18next.t(res.data));
                    location.reload()
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

function addMessageMulti() {
    $('.add-message-upload').click();
    $('.add-message-upload').off('change').on('change', function (e) {
        // Lấy danh sách các tệp đã chọn
        let files = e.target.files;
        if (!files || (Array.isArray(files) && files.length > 1)) {
            showWarningAlert(i18next.t('Warning'), i18next.t('AllowChooseOneFile'));
            return;
        }

        // gọi lưu file
        var formData = new FormData();
        formData.append('file', files[0]);
        formData.append('appCode', appCode);

        callPostAPIAuthen('/Chat/AddMultiMessage', formData,
            function successMethod(res) {
                if (res.data) {
                    showSuccessAlert(i18next.t('Success'), i18next.t(res.data));
                    location.reload();
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