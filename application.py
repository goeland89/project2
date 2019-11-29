import os
import requests

from flask import Flask, jsonify, render_template, request, redirect
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
#socketio = SocketIO(app, engineio_logger=True, logger=True)

channels = {}

@app.route("/", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        return redirect("/channels")
    return render_template("login.html")

@app.route("/channels", methods=["POST", "GET"])
def channelroom():
    return render_template("channels.html")

@app.route("channel", methods=["POST", "GET"])
def room():
    return render_template("channel.html")

#Register new user
@socketio.on("register")
def on_register():
    emit("registered", channels)

@socketio.on("newchannel")
def on_new_channel(data):
    channel_name = data["channel_name"]
    if channel_name in channels:
        emit("channel_already_exists")
    else:
        #create a new empty channel
        channels[channel_name] = []
        emit("channel_created", channel_name, broadcast=True)

@socketio.on("join")
def on_join(data):
    channel_name = data["channel_name"]
    emit("joined_room", (channel_name, channels[channel_name]))

@socketio.on("new_message")
def on_new_message(data):
    content = data["content"]
    channel_name = data["channel_name"]
    #save content in channel as the last item
    channels[channel_name].append(content)
    #remove 1st item if lenght is above 100
    if channels[channel_name].length() > 100:
        channels[channel_name].pop(0)
    emit("new_message_sent", channels[channel_name], broadcast=True)
