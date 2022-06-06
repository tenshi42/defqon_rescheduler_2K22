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
        db = g._database = PyMongo(current_app).db

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
