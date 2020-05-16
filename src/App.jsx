import React from 'react';
import ButtonBox from './Button';
import VideoBox from './Video';
import { WebRTC } from './connect';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.onConnected = this.onConnected.bind(this);
        this.onStart = this.onStart.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);

        this.videoBox = null;
        this.setVideoBoxRef = element => {
            this.videoBox = element;
        };

        this.webRTC = new WebRTC();
        this.webRTC.onConnect = this.onConnected;
        this.webRTC.onClose = this.onClose;

        this.state = {
            streams: {}
        };
    }

    onConnected(id, event) {
        const streams = this.state.streams;
        const stream = event.streams[0];
        const streamId = `stream-${id}`;
        if (!streams[streamId]) {
            streams[streamId] = stream;
        } else {
            streams[streamId].addTrack(event.track);
        }
        console.log(streams);
        this.setState({
            streams: streams
        });
    }

    onClose(id) {
        const streamId = `stream-${id}`;
        this.videoBox.onClose();
        this.setState((state, props) => {
            const streams = state.streams;
            delete streams[streamId];
            return Object.assign({}, {streams: streams});
        });
    }

    onStart() {
        console.log('onStart');
        try {
            this.webRTC.signnaling();
            this.webRTC.start().then(stream => {
                this.videoBox.addLocalVideoStream(stream);
            });
        } catch (e) {
            console.log(e);
        }
    }

    onConnect() {
        this.webRTC.connect();
    }

    onDisconnect() {
        this.webRTC.disconnect();
    }

    render () {
        return (
        <div style={{display: 'flex', 'flexDirection': 'column'}}>
            <div>
                <ButtonBox 
                 onStart={this.onStart}
                 onConnect={this.onConnect}
                 onDisconnect={this.onDisconnect}
                />
            </div>
            <div>
                <VideoBox
                ref={this.setVideoBoxRef}
                streams={this.state.streams}
                />
            </div>
        </div>
        );
    }
}

export default App;
