function buildTable(data) {
    buildTableHeader(data);

    let body = $("<div id='table_body'></div>")
    $("#table_anchor").append(body)

    let bodyHeader = $("<div id='table_body_header'></div>")
    body.append(bodyHeader)

    let dayPanel = $(`<div id='day_panel'></div>`)
    body.append(dayPanel)

    $(`#day_tab_${data[0].day}`).click()
}

function buildTableHeader(data) {
    let header = $("<div class='table_header'></div>")

    for (let i in data) {
        let day = data[i]
        let dayTab = $(`<button class='day_tab' id='day_tab_${day.day}'>${day.day}</button>`)
        dayTab.click({dayTab, day}, onClickDayTab)
        header.append(dayTab);
    }

    $("#table_anchor").append(header)
}

function onClickDayTab(event) {
    buildDay(event.data.day)

    $(".day_tab").removeClass("day_selected")
    event.data.dayTab.addClass("day_selected")
}

function buildDay(day) {
    $("#table_body_header").empty()

    let dayPanel = $("#day_panel")
    dayPanel.empty()

    let dayEndTimeFromZero = Math.max(...Object.entries(day["stages"]).map(stage => Object.entries(stage[1]).map(slot => slot[1])).flat().map(slot => slot.endTimeFromZero))

    for (let stage in day["stages"]) {
        dayPanel.append(buildStage(stage, day["stages"][stage], dayEndTimeFromZero))
    }

    return dayPanel
}

function buildStage(stage, stageData, dayEndTimeFromZero) {
    let stagePanel = $("<div class='stage_panel'></div>")
    stagePanel.css("height", `${dayEndTimeFromZero * 2}px`)

    let stageHeader = $(`<div class='stage_header' id='stage_header_${stage}'>${stage}</div>`)
    $("#table_body_header").append(stageHeader)

    stageData = Object.entries(stageData).map(stageData => stageData[1]).sort((a, b) => a.startTimeFromZero - b.startTimeFromZero)
    console.log(stageData)

    for (let i = 0; i < stageData.length; i++) {
        if (i === 0) {
            if (stageData[0].startTimeFromZero > 0) {
                stagePanel.append(buildEmptySlot(stageData[0].startTimeFromZero))
            }
        } else {
            let breakBefore = stageData[i].startTimeFromZero - stageData[i - 1].endTimeFromZero

            if (breakBefore > 0) {
                stagePanel.append(buildEmptySlot(breakBefore))
            }
        }

        stagePanel.append(buildSlot(stageData[i]))

        if (i === stageData.length - 1 && dayEndTimeFromZero > stageData[i].endTimeFromZero) {
            stagePanel.append(buildEmptySlot(dayEndTimeFromZero - stageData[i].endTimeFromZero))
        }
    }

    return stagePanel
}

function buildEmptySlot(height) {
    let slotPanel = $(`<div class="empty_slot_panel"></div>`)

    slotPanel.css("height", `${height * 2}px`)

    return slotPanel
}

function buildSlot(slotData) {
    let slotPanel = $(`<div class="slot_panel" id='${slotData.title}'></div>`)

    let content = $('<div class="slot_panel_content"></div>')
    slotPanel.append(content)

    content.append(`<span>${slotData.title}<br/>${new Date(slotData.dateTimeStart * 1000).toTimeString().slice(0, 5)} - ${new Date(slotData.dateTimeEnd * 1000).toTimeString().slice(0, 5)}</span>`)

    slotPanel.css("height", `${slotData.duration * 2 - 12}px`)

    return slotPanel
}

function loadTable(user) {

}

function loadDefaultTable() {
    $.get('/static/json/TimeTableStructured.json')
        .done(function (data) {
            buildTable(Object.keys(data).map((key) => {
                return {day: key, ...data[key]}
            }))
        })
}

$(function () {
    loadDefaultTable()
})