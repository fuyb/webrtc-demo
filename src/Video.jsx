import React from 'react';

class VideoBox extends React.Component {
    constructor(props) {
        super(props);
        this.addLocalVideoStream = this.addLocalVideoStream.bind(this);
        this.addRemoteVideoStream = this.addRemoteVideoStream.bind(this);
        this.onClose = this.onClose.bind(this);

        this.localVideo = null;
        this.setLocalVideoRef = element => {
            this.localVideo = element;
            this.localVideo.onloadedmetadata = e => {
                this.localVideo.play();
            }
        };

        this.remoteVideo = null;
        this.setRemoteVideoRef = element => {
            this.remoteVideo = element;
            this.remoteVideo.onloadedmetadata = e => {
                this.remoteVideo.play();
            }
        };
    }

    componentDidMount() {
    }

    addLocalVideoStream(stream) {
        this.localVideo.srcObject = stream;
    }

    addRemoteVideoStream(stream) {
        this.remoteVideo.srcObject = stream;
    }

    onClose() {
        if (this.localVideo.srcObject !== null) {
            let tracks = this.localVideo.stream.getTracks();
             tracks.forEach(track => {
                 track.stop();
             });
            this.localVideo.srcObject = null;
        }

        if (this.remoteVideo.srcObject !== null) {
            let tracks = this.remoteVideo.stream.getTracks();
             tracks.forEach(track => {
                 track.stop();
             });
            this.remoteVideo.srcObject = null;
        }
    }

    render () {
        return (
            <div className={"card"}>
                <div className={"card_part card_part-two"}>
                    <video ref={this.setLocalVideoRef} controls={true}>
                    </video>
                </div>
                <div className={"card_part card_part-one"}>
                    <video ref={this.setRemoteVideoRef} controls={true}>
                    </video>
                </div>
            </div>
        );
    }
}

export default VideoBox;
