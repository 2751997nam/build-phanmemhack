$('.countryCode').on('change', function () {
    var languageCode = $(this).val();
    if (languageCode) {
        callPostAPIPublic('/Account/SelectLanguage', { languageCode: languageCode }, function (response) {
            i18next.changeLanguage(languageCode);
            $('.countryCode').val(languageCode);
            location.reload();
        });
    }
})

function initLocalize() {
    var cookieLanguageCode = $('.countryCode').val(),
        languageCode = cookieLanguageCode ? cookieLanguageCode : 'vi';

    // Khởi tạo i18next và cấu hình
    i18next.init({
        lng: languageCode,
        debug: true,
        resources: {
            en: {
                translation: translationEN,
            },
            vi: {
                translation: translationVI,
            },
            th: {
                translation: translationTH,
            },
            zh: {
                translation: translationZH,
            },
        },
    });
}

function updateCoin(coin) {
    $('.credit-text').text(coin);
}


$(document).ready(function () {
    initLocalize();
})
