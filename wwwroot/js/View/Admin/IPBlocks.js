let currentControl = $('.member-list-control'),
    dataGrid = null,
    roleActive = null;

getListDataPaging();
currentControl.find('.search-ip-address-btn').on('click', function () {
    getListDataPaging();
})

function getListDataPaging() {
    let ipSearch = currentControl.find('#searchBoxIPAddress').val(),
        pageSize = currentControl.find('.page-size').val(),
        pageIndex = currentControl.find('.pageSelected').text();

    callPostAPIAuthen('/Admin/GetListIpBlocks', { ipSearch: ipSearch, pageIndex: pageIndex, pageSize: pageSize },
        function (response) {
            let htmlAppend = '';
            if (response && response.data && response.data && response.data.data.length) {
                var dataPaging = response.data;
                buildPagingData(dataPaging);
                dataGrid = dataPaging.data;

                for (var i = 0; i < dataGrid.length; i++) {
                    let item = dataGrid[i],
                        lastRequest = new Date(item.lastRequest),
                        createdDateString = item.lastRequest ? lastRequest.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
                        classStatus = item.isBlocked == 0 ? 'btn-outline-danger' : 'btn-outline-success',
                        isActive = item.isBlocked == 0 ? 'checked' : '';

                    htmlAppend += `<tr id="${item.id}" data-ip="${item.ipAddress}"><td>${item.id}</td>
                                       <td>${item.ipAddress}</td>
                                       <td>${createdDateString}</td>
                                       <td>${item.totalRequest}</td>
                                       <td style="vertical-align: middle;">
                                           <input type='checkbox' class="isActive" ${isActive} hidden>
                                           <div class="toggle btn ${classStatus} btn-sm change-status" data-toggle="toggle" style="width: 84.7344px; height: 31px;">
                                               <div class="toggle-group">
                                                   <label class="btn btn-outline-success btn-sm toggle-on active">${i18next.t('StatusEnum_UnBlocked')}</label>
                                                   <label class="btn btn-outline-danger btn-sm toggle-off lock">${i18next.t('StatusEnum_Blocked')}</label>
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
                addHandleChangeStatus();
            }
        });
}

function addHandleChangeStatus() {
    currentControl.find('.table-list-users tbody tr .change-status').off('click').on('click', function (e) {
        let item = $(e.target),
            ipAddress = item.parents('tr').data('ip');
        callPostAPIAuthen('/Admin/UpdateStatusIpBlock', { ipAddress: ipAddress }, function () {
            getListDataPaging();
        }, function () {
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

currentControl.find('#updateLimit').on('click', function () {
    let limitRequest = currentControl.find('#limitPerMinusConfig').val();

    if (limitRequest) {
        callPostAPIAuthen('/Admin/UpdateLimitRequestIP', { limitRequest: limitRequest }, function () {
            showSuccessAlert(i18next.t('Success'), i18next.t('UpdatedManagerSuccess'));
        });
    }
})