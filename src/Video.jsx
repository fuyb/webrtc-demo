import React from 'react';

class VideoBox extends React.Component {
    constructor(props) {
        super(props);
        this.addLocalVideoStream = this.addLocalVideoStream.bind(this);
        this.addRemoteVideoStream = this.addRemoteVideoStream.bind(this);
        this.onClose = this.onClose.bind(this);

        this.localVideo = React.createRef();
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps) {
        const elements = document.getElementsByName("remote-video");
        const streams = Object.values(this.props.streams);
        for (let i = 0; i < streams.length; ++i) {
            const video = elements[i];
            video.srcObject = streams[i];
        }
    }

    addLocalVideoStream(stream) {
        this.localVideo.current.srcObject = stream;
    }

    addRemoteVideoStream(stream) {
    }

    onClose() {
        if (this.localVideo.current.srcObject !== null) {
            let tracks = this.localVideo.current.stream.getTracks();
             tracks.forEach(track => {
                 track.stop();
             });
            this.localVideo.current.srcObject = null;
        }

        const elements = document.getElementsByName("remote-video");
        for (let i = 0; i < elements.length; ++i) {
            const video = elements[i];
            let tracks = video.stream.getTracks();
             tracks.forEach(track => {
                 track.stop();
             });
            video.srcObject = null;
        }
    }

    render () {
        return (
            <div className={"card"}>
                <video key="localVideo" ref={this.localVideo} controls={true} autoPlay={true}>
                </video>
                {Object.entries(this.props.streams).map(([key,value],i) =>
                <video key={key} name="remote-video" controls={true} autoPlay={true}>
                </video>
                )}
            </div>
        );
    }
}

export default VideoBox;
