function buildSlot(slotData){
    console.log(slotData)
    let slotPanel = $(`<div class="slot_panel" id='${slotData.title}'>${slotData.title}</div>`)

    slotPanel.css("top", `${slotData.startTimeFromZero}px`)
    slotPanel.css("height", `${slotData.duration}px`)

    return slotPanel
}

function buildScene(sceneData){
    let scenePanel = $("<div class='scene_panel'></div>")

    for(let slot in sceneData){
        scenePanel.append(buildSlot(sceneData[slot]))
    }

    return scenePanel
}

function buildDay(dayData){
    let dayPanel = $("<div class='day_panel'></div>")

    for(let stage in dayData["stages"]){
        dayPanel.append(buildScene(dayData["stages"][stage]))
    }

    return dayPanel
}

function buildTable(data){
    for(let day in data){
        let dayData = data[day]

        let dayTab = $(`<div class='day_tab' id='day_${day}'>${day}</div>`)
        $("#table_anchor").append(dayTab);
    }

    for(let day in data){
            $("#table_anchor").append(buildDay(data[day]))
        }
}

function loadTable(user){

}

function loadDefaultTable(){
    $.get('/static/json/TimeTableStructured.json')
        .done(function (data){
            console.log(data)
            buildTable(data)
        })
}

$(function (){
    loadDefaultTable()
})