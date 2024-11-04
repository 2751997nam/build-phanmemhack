var roomControl = $('.room-div-component');

roomControl.find('.room-card').on('click', function () {
    let formulaIdActive = $('.nav-link-formula-active').parents('li').attr('id'),
        url = $(this).data('url');
    if (formulaIdActive) {
        url += '&formulaId=' + formulaIdActive;
    }
    window.location.href = url;
});
