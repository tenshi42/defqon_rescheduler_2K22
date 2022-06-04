import json


def json_reformat(json_file):
    with open(json_file, 'r') as file:
        data = json.load(file)

    with open(json_file, 'w') as file:
        json.dump(data, file, indent=4)


def file_lightener(input_json_file, output_json_file):
    with open(input_json_file, 'r') as file:
        data = json.load(file)

    data = data["data"]["eventEdition"]["days"]

    my_data = {}

    for day in data:
        day_data = {}
        for stage in day["stages"]:
            stage_data = {}
            for slot in stage["timeSlots"]:
                slot_data = {
                    "title": slot["title"],
                    "dateTimeStart": slot["dateTimeStart"],
                    "dateTimeEnd": slot["dateTimeEnd"],
                    "going": False
                }
                stage_data[slot["title"]] = slot_data
            day_data[stage["title"]] = stage_data
        my_data[day["day"]] = {"dateTimeStart": day["dateTimeStart"], "stages": day_data}

    with open(output_json_file, 'w') as file:
        json.dump(my_data, file, indent=4)


def file_structurer(input_json_file, output_json_file):
    with open(input_json_file, 'r') as file:
        data = json.load(file)

    for day in data:
        base_time = data[day]["dateTimeStart"]

        for scene in data[day]["stages"]:
            for slot in data[day]["stages"][scene]:
                slot_start = data[day]["stages"][scene][slot]["dateTimeStart"]
                slot_end = data[day]["stages"][scene][slot]["dateTimeEnd"]
                slot_start = int((slot_start - base_time) / 60)
                slot_end = int((slot_end - base_time) / 60)
                duration = slot_end - slot_start
                data[day]["stages"][scene][slot]["startTimeFromZero"] = slot_start
                data[day]["stages"][scene][slot]["endTimeFromZero"] = slot_end
                data[day]["stages"][scene][slot]["duration"] = duration

    with open(output_json_file, 'w') as file:
        json.dump(data, file, indent=4)


def main():
    json_file = "TimeTable.json"
    json_file_light = "TimeTableLight.json"
    json_file_structured = "TimeTableStructured.json"

    file_lightener(json_file, json_file_light)
    file_structurer(json_file_light, json_file_structured)


if __name__ == '__main__':
    main()
