import React from 'react';
import ButtonBox from './Button';
import VideoBox from './Video';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.onStart = this.onStart.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);

        this.videoBox = null;
        this.setVideoBoxRef = element => {
            this.videoBox = element;
        };
    }

    onStart() {
        this.videoBox.start();
    }

    onConnect(stream) {
    }

    onDisconnect() {
    }

    render () {
        return (
            <div>
                <ButtonBox 
                 onStart={this.onStart}
                 onConnect={this.onConnect}
                 onDisconnect={this.onDisconnect}
                />
                <VideoBox ref={this.setVideoBoxRef} />
            </div>
        );
    }
}

export default App;
