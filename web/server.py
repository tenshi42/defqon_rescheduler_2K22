import pymongo
from flask import Flask, render_template, current_app, g, jsonify
from werkzeug.local import LocalProxy
from flask_pymongo import PyMongo
from config import Config

app = Flask(__name__)


def get_db():
    """
    Configuration method to return db instance
    """
    db = getattr(g, "_database", None)

    if db is None:
        connection = pymongo.MongoClient(host=Config.MONGO_URI)
        db = g._database = connection['Defqon_2K22']

    return db


app.config['MONGO_URI'] = Config.MONGO_URI

# Use LocalProxy to read the global db instance with just `db`
db = LocalProxy(get_db)


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/users")
def users():
    return jsonify(list(db.users.find({}, {'_id': 0})))


@app.route("/users/")
def users_empty():
    return jsonify(list())


@app.route("/users/<included_users>")
def users_filtered(included_users):
    user_filter = included_users.split(",")
    return jsonify(list(db.users.find({"username": {"$in": user_filter}}, {'_id': 0})))


@app.route("/update_picks/<user>/<pick>")
def update_scheduler(user, pick):
    user_data = db.users.find_one({"username": {"$eq": user}})
    if not user_data:
        return jsonify({"status": "ko"})
    if "picks" not in user_data:
        picks = []
    else:
        picks = user_data["picks"]

    pick = int(pick)

    if pick in picks:
        picks.remove(pick)
    else:
        picks.append(pick)

    update_result = db.users.update_one({"username": {"$eq": user}}, {"$set": {
        "picks": picks}
    })

    if update_result.modified_count != 1:
        return jsonify({"status": "ko"})
    else:
        return jsonify({"status": "ok", "picks": picks})


@app.route("/search_users/<search>")
def search_users(search):
    users = db.users.find({"username": {'$regex': search, '$options': 'i'}}, {'_id': 0, "picks": 0})
    print(users)
    return jsonify(list(users))
