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

    onConnected(event) {
        const streams = this.state.streams;
        const stream = event.streams[0];
        if (!streams[stream.id]) {
            streams[stream.id] = stream;
        } else {
            streams[stream.id].addTrack(event.track);
        }
        this.setState({
            streams: streams
        });
    }

    onClose() {
        this.videoBox.onClose();
    }

    onStart() {
        this.webRTC.signnaling();
        this.webRTC.start().then(stream => {
            this.videoBox.addLocalVideoStream(stream);
        });
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
