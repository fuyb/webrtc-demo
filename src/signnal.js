import io from 'socket.io-client';


export function SignnalingChannel(channel, sender, peer) {
    const server = 'https://webrtc.bcjiaoyu.com:9559';
    this.channel = channel;
    this.sender = sender;
    this.peer = peer;

    io.connect(server).emit('new-channel', {
        channel: channel,
        sender: sender
    });

    this.socket = io(`${server}/${channel}`);
    this.socket.on('connect', () => {
        console.log('socket io connect.');
    });

    this.socket.on('disconnect', () => {
        console.log('socket io disconnect.');
    });

    this.onmessage = data => {
    };

    this.send = (data, sendto) => {
        this.socket.emit('message', {
            sender: this.sender,
            data: {
                data: data,
                sender: this.sender,
                sendto: sendto
            }
        });
    };

    this.socket.on('message', message => {
        console.log('sendto: ', message.sendto);
        if (message.sendto === this.sender || message.sendto === 'all') {
          console.log(message);
          this.onmessage(message);
        }
    });
}
