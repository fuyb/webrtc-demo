const HANDSHAKE = "handshake";
const SIGNALING = "msg";

/**
 * A chatroom provider which creates and manages a web socket connection
 * to the chatroom server.
 * @param {string} chatroomHost The url for the chatroom server
 * @param {string} username The username to associate chatroom updates with
 * @param {string} chatroomId The id associated with the chatroom.
 */
export function ChatroomProvider(chatroomHost, username, nickname, chatroomId) {
    this.username = username;
    this.nickname = nickname;
    this.chatroomId = chatroomId;
    this.chatroomHost = chatroomHost;

    this.connectionAttempts = 0;

    // A queue of messages to send which were received before the
    // connection was ready
    this.queuedData = [];

    this.exponentialTimeout = function() {
        return (Math.pow(2, Math.min(this.connectionAttempts, 5)) - 1) * 1000;
    };

    this.randomizeDuration = function(t) {
        return Math.random() * t;
    };

    this.setTimeout = function(fn, time) {
        this._connectionTimeout = window.setTimeout(fn, time);
    };
}

/**
 * Open a new websocket connection to the chatroom server.
 * @param {string} chatroomHost The chatroom server to connect to.
 */
ChatroomProvider.prototype.openConnection = function() {
    this.connectionAttempts += 1;

    try {
        this.connection = new WebSocket(`${this.chatroomHost}${this.chatroomId}`);
    } catch (e) {
        console.log(e);
        this.connection = null;
        return;
    }

    this.connection.onerror = this.onError.bind(this);
    this.connection.onmessage = this.onMessage.bind(this);
    this.connection.onopen = this.onOpen.bind(this);
    this.connection.onclose = this.onClose.bind(this);
}

ChatroomProvider.prototype.onError = function(event) {
    console.log(event);
    // Error is always followed by close, which handles reconnect logic.
}

ChatroomProvider.prototype.onMessage = function(event) {
    const messageString = event.data;
    this.parseMessage(JSON.parse(messageString));
}

ChatroomProvider.prototype.onOpen = function() {
    // Reset connection attempts to 1 to make sure any subsequent reconnects
    // use connectionAttempts=1 to calculate timeout
    this.connectionAttempts = 1;
    this.writeToServer(HANDSHAKE);

    // Go through the queued data and send off messages that we weren't
    // ready to send before
    this.queuedData.forEach(data => {
        this.sendData(data);
    });
    // Reset the queue
    this.queuedData = [];
}

ChatroomProvider.prototype.onClose = function(event) {
    if (event.code !== 1004 && event.code >= 1000 && event.code <= 1015) {
        const randomizedTimeout = this.randomizeDuration(this.exponentialTimeout());
        this.setTimeout(this.openConnection.bind(this), randomizedTimeout);
    } else {
        this.onFail(event.code);
        this.requestCloseConnection();
    }
}

/**
 * Format and send a message to the chatroom server.
 * @param {string} methodName The message method, indicating the action to perform.
 */
ChatroomProvider.prototype.writeToServer = function(methodName, sendto, message) {
    const msg = {};
    msg.method = methodName;
    msg.user = this.username;
    msg.nickname = this.nickname;
    msg.chatroom_id = this.chatroomId;
    msg.sendto = sendto;
    if (message) msg.message = message;

    const dataToWrite = JSON.stringify(msg);
    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
        this.sendData(dataToWrite);
    } else {
        this.queuedData.push(dataToWrite);
    }
};

/**
 * Send a formatted message to the chatroom server.
 * @param {string} data The formatted message to send.
 */
ChatroomProvider.prototype.sendData = function(data) {
    this.connection.send(`${data}\n`);
};

/**
 * Closes the connection to the web socket and clears the chatroom
 * provider of references related to the chatroom project.
 */
ChatroomProvider.prototype.requestCloseConnection = function() {
    if (this.connection &&
        this.connection.readyState !== WebSocket.CLOSING &&
        this.connection.readyState !== WebSocket.CLOSED) {
        // Remove listeners, after this point we do not want to react to connection updates
        this.connection.onclose = () => {};
        this.connection.onerror = () => {};
        this.connection.close();
    }
    this.clear();
};

/**
 * Clear this provider of references related to the project
 * and current state.
*/
ChatroomProvider.prototype.clear = function() {
    this.connection = null;
    this.username = null;
    this.chatroomId = null;
    if (this._connectionTimeout) {
        clearTimeout(this._connectionTimeout);
        this._connectionTimeout = null;
    }
    this.connectionAttempts = 0;
};

ChatroomProvider.prototype.parseMessage = function(message) {
    switch (message.method) {
        case HANDSHAKE: {
            break;
        }
        case SIGNALING: {
            this.onDataMessage(message);
            break;
        }
        default:
            break;
    }
}
