let currentControl = $('.member-list-control'),
    dataGrid = null,
    roleActive = null;

getListDataPaging();
currentControl.find('.search-user-btn').on('click', function () {
    getListDataPaging("", true);
})

function getListDataPaging(userRoleCode = "", reset = false) {
    let userSearch = currentControl.find('#searchBoxUserName').val(),
        pageSize = currentControl.find('.page-size').val(),
        pageIndex = currentControl.find('.pageSelected').text();
    if (userRoleCode) {
        roleActive = userRoleCode;
    }
    if (reset) {
        pageIndex = 1;
    }

    callPostAPIAuthen('/Member/GetListUserByUserName', { userName: userSearch, userRoleCode: roleActive, pageIndex: pageIndex, pageSize: pageSize },
        function (response) {
            let htmlAppend = '';
            if (response && response.data && response.data && response.data.data.length) {
                var dataPaging = response.data;
                buildPagingData(dataPaging);
                dataGrid = dataPaging.data;

                for (var i = 0; i < dataGrid.length; i++) {
                    let item = dataGrid[i],
                        createdDate = new Date(item.createdDate),
                        createdDateString = item.createdDate ? createdDate.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
                        lastLogin = new Date(item.lastLogin),
                        lastLoginString = item.lastLogin ? lastLogin.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
                        classStatus = item.status == 0 ? 'btn-outline-success' : 'btn-outline-danger',
                        isActive = item.status == 0 ? 'checked' : '',
                        roleNamelocalize = i18next.t("Role" + item.roleCode),
                        classTextRole = '';

                    // set màu role
                    switch (item.roleCode) {
                        case 'Customer':
                            classTextRole = 'color-green'
                            break;
                        case 'Admin':
                            classTextRole = 'color-red'
                            break;
                        case 'SuperAdmin':
                            classTextRole = 'color-blue'
                            break;
                    };

                    htmlAppend += `<tr id="${item.id}">
                                       <td>${i + 1}</td>
                                       <td>${item.userName}</td>
                                       <td>${item.ipAddress ? item.ipAddress : ''}</td>
                                       <td>${item.coin}</td>
                                       <td class="${classTextRole} font-weight-bold">${roleNamelocalize}</td>
                                       <td>${lastLoginString}</td>
                                       <td>${createdDateString}</td>
                                       <td style="vertical-align: middle;">
                                           <button class="btn btn-outline-warning edit-member">
                                               <i class="far fa-edit fa-lg"></i>
                                           </button>
                                       </td>
                                       <td style="vertical-align: middle;">
                                           <input type='checkbox' class="isActive" ${isActive} hidden>
                                           <div class="toggle btn ${classStatus} btn-sm change-status" data-toggle="toggle" style="width: 84.7344px; height: 31px;">
                                               <div class="toggle-group">
                                                   <label class="btn btn-outline-success btn-sm toggle-on active">${i18next.t('StatusEnum_Actived')}</label>
                                                   <label class="btn btn-outline-danger btn-sm toggle-off lock">${i18next.t('StatusEnum_Deleted')}</label>
                                                   <span class="toggle-handle btn btn-light btn-sm"></span>
                                               </div>
                                           </div>
                                       </td>
                                    </tr>`;

                    shownDataOrPaging(false);
                }
            }
            else {
                shownDataOrPaging();
            }

            currentControl.find('.table-list-users tbody tr:not(.no-data)').remove();
            if (htmlAppend) {
                currentControl.find('.table-list-users tbody').append(htmlAppend);
                addHandleEditMember();
                addHandleChangeStatus();
            }
        });
}

function addHandleEditMember() {
    currentControl.find('.table-list-users tbody tr .edit-member').off('click').on('click', function (e) {
        let id = $(e.target).parents('tr').attr('id');
        let url = `${window.location.origin}/Member/EditMember?id=${id}`;
        window.open(url, '_blank');
    })
}

function addHandleChangeStatus() {
    currentControl.find('.table-list-users tbody tr .change-status').off('click').on('click', function (e) {
        let item = $(e.target),
            id = item.parents('tr').attr('id'),
            statusNew = updateBoxStatus(item);
        callPostAPIAuthen('/Member/UpdateStatus', { id: id, status: statusNew }, function () { }, function () {
            // khong thành công thì rollback nút
            updateBoxStatus(item);
        });
    })
}

function updateBoxStatus(itemSelected) {
    let statusCheckbox = itemSelected.parents('tr').find('.isActive'),
        status = 0;
    statusCheckbox.click();
    if (statusCheckbox.prop("checked")) {
        itemSelected.parents('.change-status').removeClass('btn-outline-success').removeClass('btn-outline-danger').addClass('btn-outline-success');
        status = 0;
    }
    else {
        itemSelected.parents('.change-status').removeClass('btn-outline-danger').removeClass('btn-outline-success').addClass('btn-outline-danger');
        status = 1;
    }

    return status;
}

function exportExcel() {
    var userName = currentControl.find('#searchBoxUserName').val();
    var urlWithParams = `/File/ExportMemberToExcel?userName=${userName}`;
    if (roleActive) {
        urlWithParams += `&userRoleCode=${roleActive}`;
    }
    window.open(window.location.origin + urlWithParams, "_blank");
}