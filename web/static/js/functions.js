var users;

function buildUserViewButtons(users) {
    this.users = users

    for (let i = 0; i < users.length; i++) {
        let button = $(`<button class="user_view_button">${users[i].username}</button>`);
        $("#views_users").append(button)
    }
}

function buildTable(data) {
    buildTableHeader(data);
    $(`#day_tab_${data[0].day}`).click()
}

function buildTableHeader(data) {
    let header = $("#table_header")

    for (let i in data) {
        let day = data[i]
        let dayTab = $(`<button class='day_tab' id='day_tab_${day.day}'>${day.day}</button>`)
        dayTab.click({dayTab, day}, onClickDayTab)
        header.append(dayTab);
    }
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

    let dayEndTimeFromZero = Math.max(...Object.entries(day.stages).map(stage => Object.entries(stage[1]).map(slot => slot[1])).flat().map(slot => slot.endTimeFromZero))

    for (let stage in day.stages) {
        dayPanel.append(buildStage(day, stage, dayEndTimeFromZero))
    }

    return dayPanel
}

function buildStage(day, stage, dayEndTimeFromZero) {
    let stageData = day.stages[stage]

    let stagePanel = $("<div class='stage_panel'></div>")
    stagePanel.css("height", `${dayEndTimeFromZero * 2}px`)

    let stageHeader = $(`<div class='stage_header' id='stage_header_${stage}'>${stage}</div>`)
    $("#table_body_header").append(stageHeader)

    stageData = Object.entries(stageData).map(stageData => stageData[1]).sort((a, b) => a.startTimeFromZero - b.startTimeFromZero)

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

        stagePanel.append(buildSlot(day.day, stageData[i]))

        if (i === stageData.length - 1 && dayEndTimeFromZero > stageData[i].endTimeFromZero) {
            stagePanel.append(buildEmptySlot(dayEndTimeFromZero - stageData[i].endTimeFromZero))
        }
    }

    return stagePanel
}

function buildEmptySlot(height) {
    let slotPanel = $(`<div class="empty_slot_panel"></div>`)

    slotPanel.css("height", `${height * 3}px`)

    return slotPanel
}

function buildSlot(day, slotData) {
    let slotPanel = $(`<div class="slot_panel" id='${slotData.title}'></div>`)

    slotPanel.append(buildSlotHeader(day, slotData.title))

    let content = $('<div class="slot_panel_content"></div>')
    slotPanel.append(content)

    content.append(`<span>${slotData.title}<br/>${new Date(slotData.dateTimeStart * 1000).toTimeString().slice(0, 5)} - ${new Date(slotData.dateTimeEnd * 1000).toTimeString().slice(0, 5)}</span>`)

    slotPanel.css("height", `${slotData.duration * 3 - 5}px`)

    return slotPanel
}

function buildSlotHeader(day, slot) {
    let header = $('<div class="slot_panel_header"></div>')

    for (let i = 0; i < users.length; i++) {
        let user = users[i]

        let tab = $(`<div class="slot_panel_header_tab"></div>`)
        tab.css("width", `${100 / users.length}%`)

        if (user.picks?.[day]?.includes(slot)) {
            tab.css("background-color", user.color)
        }

        header.append(tab)
    }

    return header
}

function loadUsers() {
    $.get('/users')
        .done(function (users) {
            buildUserViewButtons(users)
            loadDefaultTable()
        })
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
    loadUsers()
})