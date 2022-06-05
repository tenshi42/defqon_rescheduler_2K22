function buildTable(data) {
    buildTableHeader(data);

    let body = $("<div id='table_body'></div>")
    $("#table_anchor").append(body)

    for (let day in data) {
        $("#table_body").append(buildDay(data[day]))
    }

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
    $(".day_tab").removeClass("day_selected")
    event.data.dayTab.addClass("day_selected")
    $(".day_panel").css("display", "none")
    $(`#day_panel_${event.data.day.day}`).css("display", "inline-block")
}

function buildDay(day) {
    let dayPanel = $(`<div class='day_panel' id='day_panel_${day.day}'></div>`)

    for (let stage in day["stages"]) {
        dayPanel.css("display", "none")
        dayPanel.append(buildStage(stage, day["stages"][stage]))
    }

    return dayPanel
}

function buildStage(stage, stageData) {
    let stagePanel = $("<div class='stage_panel'></div>")

    let stageHeader = $(`<div class='stage_header' id='stage_header_${stage}'>${stage}</div>`)
    stagePanel.append(stageHeader)

    for (let slot in stageData) {
        stagePanel.append(buildSlot(stageData[slot]))
    }

    return stagePanel
}

function buildSlot(slotData) {
    let slotPanel = $(`<div class="slot_panel" id='${slotData.title}'>${slotData.title}</div>`)

    slotPanel.css("top", `${slotData.startTimeFromZero}px`)
    slotPanel.css("height", `${slotData.duration}px`)

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