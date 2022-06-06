var users;
var currentUser;
var timeTableCached;

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function removeItemOnce(arr, value) {
  let index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function softReloadPage(){
    buildUserViewButtons(users)
    buildTable(timeTableCached)
    refreshSlotHeaderStates()
}

function buildUserViewButtons(users) {
    let view_users = $("#views_users")
    view_users.empty()

    this.users = users

    let usersButtons = $("<div id='user_view_buttons'></div>")

    for (let i = 0; i < users.length; i++) {
        let button = $(`<div class="user_view_button" id="user_view_button_${users[i].username}"></div>`)
        button.append($(`<span>${users[i].username}</span>`))

        let removeButton = $("<span class='remove_user'>X</span>")
        let username = users[i].username
        removeButton.click({removeButton, username}, onClickRemoveUser)

        button.append(removeButton)
        button.click({button, username}, onClickUserButton)

        usersButtons.append(button)
    }

    view_users.append(usersButtons)

    let addUserPanel = $("<span id='add_user_panel'>Add user : </span>")
    let addUserInput = $("<input type='text' placeholder='UserName' id='add_user_input'/>")
    addUserInput.bind('input', onChangeAddUserInput)

    let addUserResultPanel = $("<div id='add_user_result_panel'></div>")

    addUserPanel.append(addUserInput)
    addUserPanel.append(addUserResultPanel)
    view_users.append(addUserPanel)
}

function onClickRemoveUser(event){
    removeUserData(event.data.username)
    softReloadPage()
}

function onChangeAddUserInput(event){
    console.log(event.target.value)
    let search = event.target.value
    if(search.length >= 2){
        $.get(`/search_users/${search}`)
            .done(function (result){
                displayUserSearchResults(result)
            })
    }
    else{
        $("#add_user_result_panel").empty()
    }
}

function displayUserSearchResults(result){
    console.log(result)
    for(let user of result){
        let userPanel = $(`<div class="add_user_result_unit_panel">${user.username}</div>`)
        userPanel.click({userPanel, user}, onClickAddPanelUnitResult)
        $("#add_user_result_panel").append(userPanel)
    }
}

function onClickAddPanelUnitResult(event){
    let username = event.data.user.username
    if(!getCookie("included_users").split(',').includes(username)) {
        addUserData(event.data.user.username)
        loadUsers();
    }
    else{
        // Display popup to indicate that user in already displayed
    }
    $("#add_user_result_panel").empty()
    $("#add_user_input").val("")
}

function removeUserData(username){
    let userCookie = getCookie("included_users")
    userCookie = userCookie.split(',')
    userCookie = removeItemOnce(userCookie, username)
    userCookie = userCookie.join()
    setCookie("included_users", userCookie)

    if(username === currentUser){
        currentUser = undefined
    }

    for(let user of users){
        if(user.username === username){
            removeItemOnce(users, user)
            break
        }
    }
}

function addUserData(user){
    let userCookie = getCookie("included_users")
    userCookie = userCookie.split(',')
    userCookie.push(user)
    userCookie = userCookie.join()
    setCookie("included_users", userCookie)
}

function onClickUserButton(event){
    currentUser = event.data.username
    $(".user_view_button.selected").removeClass("selected")
    event.data.button.addClass("selected")
}

function buildTable(data) {
    timeTableCached = data
    buildTableHeader(data);
    $(`#day_tab_${data[0].day}`).click()
}

function buildTableHeader(data) {
    let header = $("#table_header")
    header.empty()

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

    refreshSlotHeaderStates()
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
    let slotPanel = $(`<div class="slot_panel" id='slot_${slotData.id}'></div>`)

    slotPanel.append(buildSlotHeader(day, slotData.id))

    let content = $('<div class="slot_panel_content"></div>')
    slotPanel.append(content)

    content.append(`<span>${slotData.title}<br/>${new Date(slotData.dateTimeStart * 1000).toTimeString().slice(0, 5)} - ${new Date(slotData.dateTimeEnd * 1000).toTimeString().slice(0, 5)}</span>`)

    slotPanel.css("height", `${slotData.duration * 3 - 5}px`)

    let slotId = slotData.id;

    slotPanel.click({slotPanel, slotId}, onClickSlot)

    return slotPanel
}

function buildSlotHeader(day, slot_id) {
    let header = $('<div class="slot_panel_header"></div>')

    for (let i = 0; i < users.length; i++) {
        let user = users[i]

        let tab = $(`<div class="slot_panel_header_tab" id="slot_header_${user.username}_${slot_id}"></div>`)
        tab.css("width", `${100 / users.length}%`)

        if (i === 0) {
            tab.css("border-top-left-radius", "15px")
        }
        if (i === users.length - 1) {
            tab.css("border-top-right-radius", "15px")
        }

        header.append(tab)
    }

    return header
}

function refreshSlotHeaderStates(){
    $(".slot_panel_header_tab").css("background-color", "");

    for (let i = 0; i < users.length; i++) {
        let user = users[i]

        if(user.picks !== undefined) {
            for (let pick of user.picks) {
                let selector = `#slot_header_${user.username}_${pick}`
                let tab = $(selector)
                tab.css("background-color", user.color)
            }
        }
    }
}

function onClickSlot(event){
    $.get(`/update_picks/${currentUser}/${event.data.slotId}`)
        .done(function (result){
            if(result.status === "ok"){
                for(let user of users){
                    if(user.username === currentUser){
                        user.picks = result.picks
                    }
                }
                refreshSlotHeaderStates()
            }
        })
}

function loadUsers() {
    let included_users = getCookie("included_users")
    $.get('/users/' + included_users)
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
            refreshSlotHeaderStates()
        })
}

$(function () {
    loadUsers()
})