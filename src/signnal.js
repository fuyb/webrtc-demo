import { ChatroomProvider } from './chatroom-provider';


export function SignnalingChannel(channel, sender, peer) {
    const server = 'wss://app.bcjiaoyu.com/live/classroom/signaling/';
    this.chatroomProvider = new ChatroomProvider(server, sender, sender, channel);
    this.chatroomProvider.onDataMessage = this.onDataMessage.bind(this);
    this.chatroomProvider.openConnection();
}

SignnalingChannel.prototype.send = function(data, sendto) {
    this.chatroomProvider.writeToServer('msg', sendto, {
        data: data,
    });
};

SignnalingChannel.prototype.onDataMessage = function(message) {
    if (message.sendto === this.chatroomProvider.username || message.sendto === 'all') {
        const msg = message.message;
        msg.sender = message.user;
        this.onmessage(msg);
    }
};
