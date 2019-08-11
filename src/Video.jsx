import React from 'react';
import { WebRTC } from './connect';

class VideoBox extends React.Component {
    constructor(props) {
        super(props);
        this.start = this.start.bind(this);
        this.addLocalVideoStream = this.addLocalVideoStream.bind(this);
        this.removeLocalVideoStream = this.removeLocalVideoStream.bind(this);

        this.video = null;
        this.setVideoRef = element => {
            this.video = element;
            this.video.onloadedmetadata = e => {
                this.video.play();
            }
        };

        this.webRTC = new WebRTC();
    }

    componentDidMount() {
    }

    start() {
        this.webRTC.start().then(stream => {
            this.addLocalVideoStream(stream);
        });
    }

    addLocalVideoStream(stream) {
        this.video.srcObject = stream;
    }

    removeLocalVideoStream(stream) {
        this.video.srcObject = null;
    }

    render () {
        return (
            <div className={"card"}>
                <div id={"video-view"} className={"card_part card_part-two"}>
                    <video ref={this.setVideoRef} controls>
                    </video>
                </div>
            </div>
        );
    }
}

export default VideoBox;
