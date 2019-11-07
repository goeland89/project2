import os

from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channel = {"user": "", "channels": ""}

@app.route("/")
def index():
    return render_template("index.html", channel=channel)

"""send chat to the channel
@socketio.on("submit chat")
def vote(data):
    selection = data["selection"]
    votes[selection] += 1
    emit("vote totals", votes, broadcast=True)
"""
