currentControl.find('.next-back-page').on('click', function (e) {
    if (!$(e.target).hasClass('disableText')) {
        // đánh lại pageSelected
        let pageSelected = currentControl.find('.page-index>div.pageSelected'),
            pageList = currentControl.find('.page-index>div'),
            pageCurrent = parseInt(pageSelected.text()),
            pageNew = pageCurrent;
        if ($(e.target).hasClass('next-page')) {
            pageNew = pageCurrent + 1;
        }
        else {
            pageNew = pageCurrent - 1;
        }
        
        let pageNewElement = pageList.filter(function () {
            return $(this).text() === pageNew.toString();
        });
        if (pageNewElement) {
            pageSelected.removeClass('pageSelected');
            pageNewElement.addClass('pageSelected');
        }
        getListDataPaging();
    }
})

currentControl.find('.page-size').on('change', function () {
    getListDataPaging();
})

function getSelectedItem(item) {
    let id = $(item).parents('tr').attr('id');
    return dataGrid.find(i => i.id == id);
}

function shownDataOrPaging(isNodata = true) {
    if (isNodata) {
        currentControl.find('.table-list-users tbody tr.no-data').show();
        currentControl.find('.pagination').hide();
    }
    else {
        currentControl.find('.table-list-users tbody tr.no-data').hide();
        currentControl.find('.pagination').show();
        // update paging
    }
}

function buildPagingData(dataPaging) {
    let pagingControl = currentControl.find('.pagination');
    if (dataPaging && dataPaging.totalPages) {
        pagingControl.find('.total-item').text(dataPaging.totalRecord);
        if (dataPaging.totalPages) {
            pagingControl.find('.page-index div').remove();
            var htmlPaging = '';
            var begin = Math.max(dataPaging.currentPage - 4, 0);
            var end = Math.min(dataPaging.totalPages, dataPaging.currentPage + 5);
            for (var i = begin; i < end; i++) {
                let pageSelectedClass = '';
                if (dataPaging.currentPage == i + 1) {
                    pageSelectedClass = 'pageSelected'
                }
                htmlPaging += `<div class="pl-2 pr-2 cursor-pointer ${pageSelectedClass}">${i + 1}</div>`;
            }

            pagingControl.find('.page-index').append(htmlPaging);
        }

        let prePage = pagingControl.find('.pre-page'),
            nextPage = pagingControl.find('.next-page');

        prePage.removeClass('disableText');
        nextPage.removeClass('disableText');

        if (dataPaging.currentPage == 1) {
            prePage.addClass('disableText');
        }

        if (dataPaging.currentPage == dataPaging.totalPages) {
            nextPage.addClass('disableText');
        }

        currentControl.find('.page-index>div:not(.pageSelected)').off('click').on('click', function (e) {
            currentControl.find('.page-index>div.pageSelected').removeClass('pageSelected');
            $(e.target).addClass('pageSelected');
            getListDataPaging();
        })
    }
}
