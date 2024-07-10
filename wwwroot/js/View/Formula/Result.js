let resultComponent = $('.crawl-voucher-component'),
    lastIdPositionResult = 0,
    lastIdResult = null,
    countBResult = 0,
    countPResult = 0,
    countTResult = 0,
    sumResultWin = 0,
    sumResultLose = 0,
    axisY = 25,
    axisLine = 25,
    axisX = 1,
    axisCenterY = 26,
    appCode = resultComponent.find('#appCode').val(),
    roomCode = resultComponent.find('#roomCode').val(),
    userName = $($('.username')[0]).text(),
    lastTimeGetMessage = '';
let countDownSec = 20;
let coundDownInterval = null;
const enableCountDown = checkEnableCountDown();
let isAlreadyShowMaintainAlert = false;
let maintainLimit = 60;
let maintainCount = 0;
let maintainMinutesLimit = 5;
document.querySelector('.div-graph_tbl').insertAdjacentHTML('beforeend', `<div id="graph_line"></div>`)

resultComponent.find('.exit-room').on('click', function () {
    var appId = $('#appId').val(),
        formulaId = $('#formulaId').val(),
        url = $('.exit-room').data('url');
    if (formulaId && appId && url) {
        window.location.href = url + `?appId=` + appId + `&formulaId=` + formulaId;
    }
});

resultComponent.find('.bet-run-button').on('click', function () {
    // xử lý khi ấn nút cược
    let betMoney = resultComponent.find('.bet-money').val();
    // kiemr tra validate
    if (!isNaN(parseInt(betMoney))) {
        if (parseInt(betMoney) > 0) {
            callPostAPIAuthen('/Result/BetStartAction/',
                { roomId: $('#roomId').val(), betMoney: betMoney });

            // hiển thị nút dừng cược
            showBetStartOrEnd(true);
        }
        else {
            showErrorAlert(i18next.t('Error'), i18next.t('BetMoneyMustOverZero'));
        }
        
    }
    else {
        showErrorAlert(i18next.t('Error'), i18next.t('InvalidBetMoney'));
    }
})

resultComponent.find('.bet-stop-button').on('click', function () {
    callPostAPIAuthen('/Result/BetEndAction/',
        { roomId: $('#roomId').val() });

    showBetStartOrEnd(false);
})

function checkEnableCountDown() {
    var appId = parseInt($('#appId').val());
    return [1, 2, 3, 4, 5].includes(appId);
}
function resetCountDown() {
    clearMaintainAlert();
    if (!enableCountDown) {
        return;
    }
    clearInterval(coundDownInterval);
    countDownSec = 20;
    $("#countdown-sec").html(`${countDownSec}s`);
    coundDownInterval = setInterval(() => {
        if (countDownSec <= 0) {
            clearInterval(coundDownInterval);
        } else {
            countDownSec--;
            $("#countdown-sec").html(`${countDownSec}s`);
        }
    }, 1000);
}

function clearMaintainAlert() {
    isAlreadyShowMaintainAlert = false;
    maintainCount = 0;
}

function clearCountDown() {
    $("#countdown-sec").html('');
    clearInterval(coundDownInterval);
}
function parseDateTime(dateTimeStr) {
    return new Date(dateTimeStr + "Z");
}

function isOutdateResult(item) {
    try {
        let resultDate = parseDateTime(item.time);
        let currentDate = new Date();
        const differenceInMilliseconds = Math.abs(currentDate - resultDate);
        const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

        return differenceInMinutes >= maintainMinutesLimit;
    } catch {
        return true;
    }
}
function handleAfterGetInitData(response) {
    if (response.data && response.data) {
        $("#countdown2").css('color', 'Green');
        $("#countdown2").text(i18next.t('GetSuccessResult'));
        clearCountDown();
        let htmlTBLStack = '';

        if (response.data.betMoney != null) {
            if (parseInt(response.data.betMoneyResult) >= 0) {
                resultComponent.find('.bet-money-result').removeClass('green-color').addClass('green-color');
            }
            else {
                resultComponent.find('.bet-money-result').removeClass('red-color').addClass('red-color');
            }
            resultComponent.find('.bet-money-result').text(response.data.betMoneyResult);
            resultComponent.find('.bet-money').val(response.data.betMoney);

            showBetStartOrEnd(true);
        }
        else {
            showBetStartOrEnd(false);
        }
        updateCoin(response.data.coinAcc);
        if (response.data.results && response.data.results.length) {
            let data = response.data.results;
            if (data[0].resultValue == 'deletedata') {
                resetAllData(data[0].newPredict);
            }
            else {
                data.forEach(function (item, index) {
                    if (item) {

                        // chỉ lên dự đoán cuối cùng

                        if (index == data.length - 1) {
                            if (item.newPredict) {
                                handlePredict(item.newPredict);
                            }
                        }

                        if (['b', 't', 'c', 'l', 'p', 'x'].includes(item.resultValue)) {
                            // update từng dòng kq
                            handleTableResult(item.resultValue);

                            // xử lý bảng vòng
                            if (item.loopResult) {

                                htmlTBLStack += genHtmlTableTBLStack(item.loopResult.handsLose, item.loopResult.isWin, item.loopResult.loopIndex);
                            }

                            // chỉ lên dự đoán cuối cùng
                            if (index == data.length - 1) {

                                if (item.countStack) {
                                    if (htmlTBLStack) {
                                        handleUpdateToTableTBLStack(htmlTBLStack);
                                    }
                                    else {
                                        updateWinRate('100%');
                                    }
                                    resultComponent.find('.title-result-header #nextPre').text(`(Stack ${item.countStack} / 3)`);
                                }
                                else {
                                    updateWinRate('100%');
                                }
                            }

                            //xử lý đồ thị
                            handleBoardResult(item.isMatchPredict, item.resultValue);

                            lastIdResult = item.id;
                        }
                       
                    }
                });

                drawGraphLine();

                // update tiếp thanh process
                data.forEach(function (item, index) {
                    // update từng dòng kq
                    handleProcessBar();
                });
            }

            $("#countdown2").css('color', 'Orange');
            $("#countdown2").text(i18next.t('PendingResult'));
            if (isOutdateResult(data[data.length - 1])) {
                setTimeout(() => {
                    showMaintainAlert();
                    isAlreadyShowMaintainAlert = true;
                }, 5000);
            }
        }
        else {
            resetAllData();
        }
    }
}

function handleAfterGetNewData(response) {
    // tăng số lượng kết quả 
    if (response.data && response.data.resultValue != null && response.data.resultValue != 'underfined') {
        $("#countdown2").css('color', 'Green');
        $("#countdown2").text(i18next.t('GetSuccessResult'));
        clearCountDown();
        var dataResponse = response.data;
        if (lastIdResult && (!dataResponse.resultValue || dataResponse.resultValue == 'deletedata')) {
            resetAllData(dataResponse.newPredict);
        }
        else if (dataResponse.resultValue && dataResponse.resultValue !== 'deletedata') {
            if (dataResponse.betMoney != null) {
                if (parseInt(dataResponse.betMoneyResult) >= 0) {
                    resultComponent.find('.bet-money-result').removeClass('green-color').removeClass('red-color').addClass('green-color');
                }
                else {
                    resultComponent.find('.bet-money-result').removeClass('green-color').removeClass('red-color').addClass('red-color');
                }
                resultComponent.find('.bet-money-result').text(dataResponse.betMoneyResult);
                resultComponent.find('.bet-money').val(dataResponse.betMoney);

                showBetStartOrEnd(true);
            }
            else {
                showBetStartOrEnd(false);
            }
            if (['b', 't', 'c', 'l', 'p', 'x'].includes(dataResponse.resultValue)) {
                // xử lý bảng kết quả
                handleTableResult(dataResponse.resultValue);
                // xử lý thanh process
                handleProcessBar();

                // xử lý bảng vòng
                if (dataResponse.loopResult) {
                    let loopResult = dataResponse.loopResult;
                    let htmlTBLStack = genHtmlTableTBLStack(loopResult.handsLose, loopResult.isWin, loopResult.loopIndex);
                    handleUpdateToTableTBLStack(htmlTBLStack);
                }

                if (dataResponse.countStack != null && dataResponse.countStack != undefined) {
                    resultComponent.find('.title-result-header #nextPre').text(`(Stack ${dataResponse.countStack} / 3)`);
                }

                //xử lý đồ thị
                let currentX = axisX;
                handleBoardResult(dataResponse.isMatchPredict, dataResponse.resultValue);
                if (currentX > 1) {
                    handleGraphLine(currentX);
                }

                // update lại coin
                updateCoin(response.data.coinAcc);
                lastIdResult = dataResponse.id;
            }

            // xử lý lên dự đoán
            handlePredict(dataResponse.newPredict);

            $("#countdown2").css('color', 'Orange');
            $("#countdown2").text(i18next.t('PendingResult'));
        }
        if (dataResponse.id && !lastIdResult) {
            lastIdResult = dataResponse.id;
        }
    } else if (response.data && (!lastIdResult || response.data.id <= lastIdResult) && !isAlreadyShowMaintainAlert) {
        if (lastIdResult && response.data.id) {
            response.data.id = lastIdResult;
        }
        if (maintainCount >= maintainLimit) {
            showMaintainAlert();
            isAlreadyShowMaintainAlert = true;
        } else {
            maintainCount++;
        }
    }
}

function handleTableResult(resultValue) {
    let htmlResult = `<img src="/image/symbol_${resultValue}_small.png" />`;
    switch (resultValue) {
        case 'p':
        case 'x':
        case 'c':
            countPResult++;
            break;
        case 'b':
        case 'l':
            countBResult++;
            break;
        case 't':
            if (appCode.indexOf('bcr') > 0) {
                countTResult++;
            }
            else {
                countBResult++;
            }

            break;
    }

    if (['x', 'c', 'l', 't'].includes(resultValue) && appCode.indexOf('bcr') == -1) {
        htmlResult = `<div class="flex justify-content-center"><div class="result-val-small result-val-${resultValue}"><span>${resultValue.toUpperCase()}</span></div></div>`;
    }
    resultComponent.find('#pfoot .count-result').text(countPResult);
    resultComponent.find('#bfoot .count-result').text(countBResult);
    resultComponent.find('#tfoot .count-result').text(countTResult);
    // gán link kết quả
    

    // nếu là ô cuối thì chuyển txxt o sau lên ô trước
    if (lastIdPositionResult > 71) {
        let tdElement = resultComponent.find(`.main-result .result-table .result-turn`);
        for (var i = 0; i < tdElement.length; i++) {
            $(tdElement[i]).html($(tdElement[i + 1]).html());
            $(tdElement[i]).attr('id', parseInt($(tdElement[i]).attr('id')) + 1);
            lastIdPositionResult = $(tdElement[i]).attr('id');
        }
    }

    resultComponent.find(`#${lastIdPositionResult} `).empty();
    resultComponent.find(`#${lastIdPositionResult} `).append(htmlResult);
    lastIdPositionResult++;
}

function handleProcessBar() {
    let countResult = countPResult + countBResult + countTResult;
    // xử lý count kết quả
    resultComponent.find('#pfoot .count-result').text(countPResult);
    //xử lý processBar
    var percentP = Math.round((countPResult / countResult) * 100).toFixed(2);
    percentP = isNaN(percentP) ? 0 : percentP;
    resultComponent.find('.process-result #percentP').text(percentP);
    resultComponent.find('.process-result #countP').text(countPResult);
    resultComponent.find('.process-result .processBarP').css('width', percentP + '%');

    // xử lý count kết quả
    resultComponent.find('#bfoot .count-result').text(countBResult);
    //xử lý processBar
    var percentB = Math.round((countBResult / countResult) * 100).toFixed(2);
    percentB = isNaN(percentB) ? 0 : percentB;
    resultComponent.find('.process-result #percentB').text(percentB);
    resultComponent.find('.process-result #countB').text(countBResult);
    resultComponent.find('.process-result .processBarB').css('width', percentB + '%');

    // xử lý count kết quả
    resultComponent.find('#tfoot .count-result').text(countTResult);
    //xử lý processBar
    var percentT = Math.round((countTResult / countResult) * 100).toFixed(2);
    percentT = isNaN(percentT) ? 0 : percentT;
    resultComponent.find('.process-result #percentT').text(percentT);
    resultComponent.find('.process-result #countT').text(countTResult);
    resultComponent.find('.process-result .processBarT').css('width', percentT + '%');
}

function handlePredict(resultValue) {
    resetCountDown();
    let htmlPredict = '';
    resultValue = resultValue.toLowerCase();
    switch (resultValue) {
        case 'b':
        case 'p':
        case 't':
            if (appCode.indexOf('bcr') > 0) {
                htmlPredict = `<img src="/image/symbol_${resultValue}.png">`;
            }
            else if (resultValue == 't') {
                htmlPredict = `<div class="flex justify-content-center"><div class="result-val result-val-${resultValue}"><span>${resultValue.toUpperCase()}</span></div></div>`;
            }
            break;
        case 'x':
        case 'c':
        case 'l':
            htmlPredict = `<div class="flex justify-content-center"><div class="result-val result-val-${resultValue}"><span>${resultValue.toUpperCase()}</span></div></div>`;
            break;
        default:
            htmlPredict = "Analyzing..";
            break;
    }

    resultComponent.find(' .new-prediction-title').show();
    resultComponent.find(' .waitting-result').hide();

    resultComponent.find(`#predict`).empty();
    resultComponent.find(`#predict`).append(htmlPredict);

    // bật form dự đoán
    Swal.fire({
        html: htmlPredict,
        animation: false,
        width: 200,
        background: "rgba(0,0,0,0)",
        showConfirmButton: false,
        timer: 2000,
        customClass: {
            popup: "animated flip",
        },
    });
}

function handleUpdateToTableTBLStack(htmlTBLStack) {
    
    resultComponent.find('#tbl_stack').append(htmlTBLStack);
    resultComponent.find('#tbl_stack').scrollTop(resultComponent.find('#tbl_stack').prop('scrollHeight'));

    // update table-sum-result
    resultComponent.find('.table-sum-result #total').text(sumResultLose + sumResultWin)
    resultComponent.find('.table-sum-result #win').text(sumResultWin)
    resultComponent.find('.table-sum-result #lose').text(sumResultLose);
    
    updateWinRate();
}

function updateWinRate(winRateFormat) {
    // cập nhật winrate
    if (!winRateFormat) {
        winRateFormat = Math.round((sumResultWin / (sumResultLose + sumResultWin)) * 100) + '%';
    }
    resultComponent.find('.cal-result #winrate').text(winRateFormat);
    resultComponent.find('.footer-table-result #prestat').text(winRateFormat);

    if (winRateFormat < 50) {
        resultComponent.find('.cal-result #winrate').removeClass('green-color').removeClass('yellow-color').addClass('yellow-color');
    }
    else {
        resultComponent.find('.cal-result #winrate').removeClass('green-color').removeClass('yellow-color').addClass('green-color');
    }
}

function genHtmlTableTBLStack(lose, isWin, loopIndex) {
    var htmlTr = '';
    if (lose) {
        var tdResult = '';
        if (isWin) {
            tdResult = '<td style="background-color: rgb(40, 167, 69);">win</td>';
            sumResultWin++;
        }
        else {
            tdResult = '<td style="background-color: rgb(220, 53, 69);">lose</td>';
            sumResultLose++;
        }
        var htmlTr = `<tr>
                    <td>${loopIndex}</td>
                    <td>${lose}</td>
                    ${tdResult}
                  </tr>`;
    }
    return htmlTr;
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function handleBoardResult(isMatchPredict, resultValue) {
    let colorBoard = "";
    let height = 4;
    let operator = 'sumb';
    if (resultValue == 't' && appCode.indexOf('bcr') > 0) {
        // nếu kq là T thì gán luôn màu
        colorBoard = "rgb(40, 167, 69)";
        axisCenterY = axisY + 1;
    }
    else if (isMatchPredict) {
        axisY--;
        if (axisY == axisLine) {
            axisY--;
        }
        axisCenterY = axisY - 1;
        colorBoard = "rgb(255 229 0)";
        // height = randomInt(3, 6);
        operator = 'sub';
    }
    else {
        axisY++;
        if (axisY == axisLine) {
            axisY++;
        }
        axisCenterY = axisY + 1;
        colorBoard = "#ff00cc";
        // height = randomInt(3, 6);
    }

    let axisYCurrent = axisY;

    // xử lý mở rộng chiều rộng chiều dài đồ thị nếu bị tràn
    if (!document.getElementById("graph_tbl").rows[axisY + height]) {
        for (let row = 0; row < height; row++) {
            // count td của dòng dầu
            let countTd = resultComponent.find("#graph_tbl tbody tr:first-child td").length,
                htmlTr = '';
            for (var i = 0; i < countTd; i++) {
                htmlTr += '<td class="origin"></td>'
            }
            if (htmlTr) {
                htmlTr = `<tr>${htmlTr}</tr>`;
                if (axisY < axisLine) {
                    resultComponent.find("#graph_tbl tbody").prepend(htmlTr);
                }
                else {
                    resultComponent.find("#graph_tbl tbody").append(htmlTr);
                }
            }
            if (axisY <= 0) {
                axisY = 0;
                axisYCurrent = 0;
            }
            else {
                axisYCurrent = axisY - 1;
            }
        }

    }

    if (document.getElementById("graph_tbl").rows[axisYCurrent] && !document.getElementById("graph_tbl").rows[axisYCurrent].cells[axisX]) {
        // nếu axistX hết thì tăng bên phải
        // quét từng tr rồi thêm 1 td
        let trListElement = resultComponent.find("#graph_tbl tbody tr");
        let addNumbers = axisX - ($(trListElement[0]).find('td').length - 1);
        for (var i = 0; i < trListElement.length; i++) {
            for (let j = 0; j < addNumbers; j++) {
                $(resultComponent.find("#graph_tbl tbody tr")[i]).append('<td class="origin"></td>')
            }
        }
    }

    if (colorBoard && document.getElementById("graph_tbl").rows[axisYCurrent]) {
        for (let i = 0; i <= height; i++) {
            let currentY = operator == 'sumb' ? axisYCurrent + i : axisYCurrent - i;
            document.getElementById("graph_tbl").rows[currentY].cells[axisX].style.backgroundColor = colorBoard;
            if (i == parseInt(height / 2)) {
                document.getElementById("graph_tbl").rows[currentY].cells[axisX].classList.add('center-point');
            }
        }
        axisX += 2;
    }
}

function drawGraphLine() {
    let graph = document.getElementById("graph_line");
    graph.innerHTML = '';
    let table = document.getElementById("graph_tbl");
    graph.style.width = table.clientWidth + 'px';
    let rows = table.rows.length;
    let columns = table.rows[0].cells.length;
    for (let i = 3; i < columns; i += 2) {
        handleGraphLine(i);
    }
}

function handleGraphLine(currentX) {
    let prevColumn = document.querySelectorAll(`td.origin:nth-child(${currentX - 1})`);
    let currentColumn = document.querySelectorAll(`td.origin:nth-child(${currentX + 1})`);

    let prevX = currentX - 2;
    let prevY = null;
    prevColumn.forEach((element, index) => {
        if (element.classList.contains('center-point')) {
            prevY = index;
        }
    })
    let currentY = null;
    currentColumn.forEach((element, index) => {
        if (element.classList.contains('center-point')) {
            currentY = index;
        }
    })

    let unitX = currentColumn[0].getBoundingClientRect().width;
    let unitY = currentColumn[0].getBoundingClientRect().height;
    let startCellPos = {
        x: (prevX + 0.5) * unitX,
        y: prevY * unitY
    }
    let endCellPos = {
        x: (currentX + 0.5) * unitX,
        y: currentY * unitY
    }

    let curve = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    curve.setAttribute("width", "100%");
    curve.setAttribute("height", "100%");
    curve.setAttribute("class", "drawn-curve");
    curve.setAttribute("pointer-events","none");
    curve.setAttribute("data-start-x", prevX);
    curve.setAttribute("data-start-y", prevY);
    curve.setAttribute("data-end-x", currentX);
    curve.setAttribute("data-end-y", currentY);
    curve.style.position = "absolute";
    curve.style.top = "0";
    curve.style.left = "0";

    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M " + startCellPos.x + " " + startCellPos.y + " Q " + (startCellPos.x + endCellPos.x) / 2 + " " + startCellPos.y + " " + endCellPos.x + " " + endCellPos.y);
    path.setAttribute("stroke", "yellow");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");

    curve.appendChild(path);

    let table = document.getElementById("graph_line");

    table.appendChild(curve);
}

function handleErrorData(response) {
    if (response.message == "NotEnoughCoin") {
        showErrorAlert(i18next.t('Error'), i18next.t('NotEnoughCoin'));
        setInterval(function () {
            resultComponent.find('.exit-room').click();
        }, 3000);
        
    }
}

function resetAllData(predictResult) {
    console.log('resetAllData', predictResult);
    // clear predict
    updateWinRate('100%');
    if (predictResult) {
        handlePredict(predictResult);
    }
    else {
        resultComponent.find(`#predict`).empty();
    }
    // clear bảng kết quả
    resultComponent.find('.result-div-table .result-turn').empty();
    resultComponent.find('.footer-table-result .count-result').text(0);
    resultComponent.find('.footer-table-result #prestat').text('0%');

    resultComponent.find('.table-count-result tbody').empty();
    resultComponent.find('.table-sum-result tbody tr td').text(0);

    resultComponent.find('#graph_tbl tbody tr td').css('background-color', '');
    resultComponent.find('#graph_tbl tbody tr td:not(.origin)').empty();

    resultComponent.find('.process-result .title-process span').text(0);
    resultComponent.find('.process-result .text-right .title-process').text(0);
    resultComponent.find('.process-result .process-table td div').css('width', '0%');

    resultComponent.find(' .new-prediction-title').hide();
    resultComponent.find(' .waitting-result').show();
    lastIdPositionResult = 0;
    lastIdResult = null;
    countBResult = 0;
    countPResult = 0;
    countTResult = 0;
    axisY = 25;
    axisX = 0;
    lastTimeGetMessage = '';
}

function getNewDataResult() {
    console.log('getNewDataResult');
    $("#countdown2").css('color', 'Orange');
    $("#countdown2").text(i18next.t('PendingResult'));
    callPostAPIAuthen('/Result/GetNewDataResult/',
        { roomId: $('#roomId').val(), formulaId: $('#formulaId').val(), lastIdResult: lastIdResult, appCode: appCode }, handleAfterGetNewData, handleErrorData);
}

function getInitDataResult() {
    $("#countdown2").css('color', 'Orange');
    $("#countdown2").text(i18next.t('PendingResult'));
    callPostAPIAuthen('/Result/GetInitDataResult/',
        { roomId: $('#roomId').val(), formulaId: $('#formulaId').val(), appCode: appCode }, handleAfterGetInitData, handleErrorData);
}

function showBetStartOrEnd(isStart) {
    if (isStart) {
        resultComponent.find('.bet-stop-button').show();
        resultComponent.find('.bet-money-result').show();

        resultComponent.find('.bet-run-button').hide();

        resultComponent.find('.bet-money').attr('disabled', true);
    }
    else {
        resultComponent.find('.bet-run-button').show();

        resultComponent.find('.bet-stop-button').hide();
        resultComponent.find('.bet-money-result').hide();
        resultComponent.find('.bet-money-result').text(0);
        resultComponent.find('.bet-money').attr('disabled', false);
    }

}

function registerEventChatBox() {
    let chatBox = $('.div-box-chat');
    let iconChat = chatBox.find('.message-collapse');
    iconChat.hide();
    chatBox.find('.close-button').on('click', function () {
        chatBox.find('.chat-box').hide();
        iconChat.show();
    })

    chatBox.find('.send-message').on('click', function () {
        if (chatBox.find('.input-message').val()) {
            handleInsertChat(chatBox.find('.input-message').val())
        }
    })

    chatBox.find('.message-collapse').on('click', function () {
        chatBox.find('.chat-box').show();
        iconChat.hide();
    })

    $('body').on("keydown", function (event) {
        if (event.key === "Enter") {
            // Call your function or perform the desired action here
            chatBox.find('.send-message').click();
        }
    });
}


function getChatConfig() {
    callPostAPIAuthen('/Chat/GetChatConfig/',
        { appCode: appCode }, function afterGetChatConfig(response) {
            if (response.data) {
                let data = response.data,
                    minChatRandom = parseInt(data.minChatRandom),
                    maxChatRandom = parseInt(data.maxChatRandom),
                    minViewRandom = parseInt(data.minViewRandom),
                    maxViewRandom = parseInt(data.maxViewRandom);

                if (minChatRandom < maxChatRandom) {
                    setInterval(handleInsertChatRandom, getRandomInt(minChatRandom, maxChatRandom));
                }

                if (minViewRandom < maxViewRandom) {
                    setInterval(handleUpdateViewChat, minViewRandom);
                }
            }
        }, null);
}

function handleInsertChat(messageChat) {
    // lấy tin nhắn vào đây
    callPostAPIAuthen('/Chat/InsertChatMessage/', { appCode: appCode, message: messageChat },
        function updateMessageAfterInsertChat(response) {
            if (response.data) {
                // xử lý thành công
                let chatBox = $('.div-box-chat .chat-box .chat-messages');
                let messageIdDup = chatBox.find('.bot-message, .user-message').toArray().some(item => $(item).data('id') == response.data.id);
                // phải chưa có id thì mới bind
                if (!messageIdDup && response.data.userName) {
                    let htmlMessage = `<div class="message user-message" data-id="${response.data.id}">${messageChat}</div>`;
                    chatBox.append(htmlMessage);
                    chatBox.scrollTop(chatBox.prop('scrollHeight'));
                }

                lastTimeGetMessage = response.data.createdDate;
                $('.input-message').val('');
            }
        })
}

function handleInsertChatRandom() {
    callPostAPIAuthen('/Chat/InsertRandomChatMessage/', { appCode: appCode },
        function updateMessageAfterInsertChat(response) {
            if (response.data != null) {
                // xử lý thành công
                let chatBox = $('.div-box-chat .chat-box .chat-messages');
                // nếu userName là họ luôn thì bắn kiểu khác
                let htmlMessage = '';
                let messageIdDup = chatBox.find('.bot-message, .user-message').toArray().some(item => $(item).data('id') == response.data.id);
                // phải chưa có id thì mới bind
                if (!messageIdDup && response.data.userName) {
                    if (response.data.userName == userName) {
                        htmlMessage = `<div class="message user-message" data-id="${response.data.id}">${response.data.message}</div>`;
                    }
                    else {
                        htmlMessage = `<div class="bot-message">
                                        <span class="user-name"  data-id="${response.data.id}">${response.data.userName}:</span> 
                                        <span class="message-content"> ${response.data.message} </span>
                                    </div>`;
                    }

                    lastTimeGetMessage = response.data.createdDate;

                    if (htmlMessage) {
                        chatBox.append(htmlMessage);
                        chatBox.scrollTop(chatBox.prop('scrollHeight'));
                    }
                }
                
            }
        })
}

function handleUpdateViewChat() {
    callPostAPIAuthen('/Chat/UpdateViewChatRoom/', { appCode: appCode },
        function updateViewChatAfterUpdateViewChat(response) {
            if (response.data != null) {
                // có message thì xử lý vào đống tin nhắn
                $('.count-user-onl').text(response.data);
            }
        })
}

function handleGetNewChat() {
    callPostAPIAuthen('/Chat/GetNewChatMessage/', { appCode: appCode, lastTimeGet: lastTimeGetMessage }, updateMessageAfterGetChat)
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getAllChatInit() {
    callPostAPIAuthen('/Chat/GetAllChatMessage/', { appCode: appCode }, updateMessageAfterGetChat)
}

function updateMessageAfterGetChat(response) {
    if (response.data && response.data.length) {
        let lstData = response.data;
        let htmlMessage = '';
        // xử lý thành công
        let chatBox = $('.div-box-chat .chat-box .chat-messages');
        for (var i = 0; i < lstData.length; i++) {
            // nếu userName là họ luôn thì bắn kieeur khác
            if (lstData[i].userName || lstData[i].message) {
                if (lstData[i].userName == userName) {
                    htmlMessage += `<div class="message user-message" data-id="${lstData[i].id}">${lstData[i].message}</div>`;
                }
                else {
                    htmlMessage += `<div class="bot-message" data-id="${lstData[i].id}">
                                            <span class="user-name">${lstData[i].userName}:</span> 
                                            <span class="message-content"> ${lstData[i].message} </span>
                                        </div>`;
                }
            }
        }

        lastTimeGetMessage = lstData[lstData.length - 1].createdDate;

        if (htmlMessage) {
            chatBox.append(htmlMessage);
            chatBox.scrollTop(chatBox.prop('scrollHeight'));
        }
    }
}

$(document).ready(function () {
    resultComponent.find('.waitting-result').hide();
    getInitDataResult();
    setInterval(getNewDataResult, 3000);
    getChatConfig();
    registerEventChatBox();
    getAllChatInit();
    setInterval(handleGetNewChat, 5000);
})
