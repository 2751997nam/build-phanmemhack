var currentControl = $('.formula-div-component');

currentControl.find('.item-formula').on('click', function () {

    if (window.location.href.includes("Result")) {
        let roomCode = $('#roomCode').val();
        if (roomCode) {
            window.location.href = $(this).data('result-url') + `&roomCode=` + roomCode;
        }
    }
    else {
        window.location.href = $(this).data('url');
    }

});
