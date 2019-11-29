import os
import requests

from flask import Flask, jsonify, render_template, request, redirect
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
#socketio = SocketIO(app, engineio_logger=True, logger=True)

channels = {}
users = {}

@app.route("/", methods=["POST", "GET"])
def login():
    return render_template("login.html")

@app.route("/channels", methods=["POST", "GET"])
def channelroom():
    return render_template("channels.html")

@app.route("/channel", methods=["POST", "GET"])
def room():
    return render_template("channel.html")

@socketio.on("check_registration")
def on_check_registration(data):
    username = data["username"]
    print(users)
    if username in users:
        emit("user_already_exists")
    else:
        users[username] = ""
        emit("login", username)

#Register new user
@socketio.on("register")
def on_register():
    emit("registered1", users, broadcast=True)
    emit("registered2", channels)

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
    if channel_name in channels:
        emit("joined_room", (channel_name, channels[channel_name]))
        return redirect("/channel")
    else:
        emit("no_such_channel")    

@socketio.on("new_message")
def on_new_message(data):
    content = data["content"]
    channel_name = data["channel_name"]
    #save content in channel as the last item
    channels[channel_name].append(content)
    #remove 1st item if lenght is above 100
    if len(channels[channel_name]) > 100:
        channels[channel_name].pop(0)
    emit("new_message_sent", (channel_name, channels[channel_name]), broadcast=True)

@socketio.on("connected_to_room")
def on_connected_to_room(data):
    channel_name = data["channel_name"]
    if channel_name in channels:
        emit("open_room", channels[channel_name])
    else:
        emit("no_such_room")

@socketio.on("disco")
def on_disco(data):
    username = data["username"]
    users.pop(username)
