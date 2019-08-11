import adapter from 'webrtc-adapter';
import { SignnalingChannel } from './signnal';

export function WebRTC() {
    const configuration = {
        iceServers: [{
            url: 'turn:stun.cxy61.com:3478',
            credential: 'LPBZMexvyfh4pM0r',
            username: 'VPr7xtVicirk'
        }, {
            urls: ['stun:stun.cxy61.com:3478']
        }],
        iceCandidatePoolSize: 0,
        /* https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration#RTCIceTransportPolicy_enum */
        iceTransportPolicy: 'all', 
        /* https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration#RTCBundlePolicy_enum */
        bundlePolicy: 'max-bundle'
    };

    const offerConfig  = {
        offerToReceiveAudio: true,
        offerToReceiveVidoe: true
    };

    const constraints = {
        audio: true, 
        video: { width: 1280, height: 720 }
    };

    this.getICEServices = function() {
        if (adapter.browserDetails.browser !== 'chrome') {
            return configuration.iceServices;
        }
        return configuration;
    }

    /* 建立signnal连接，用于交换数据 */
    this.signnaling = () => {
        /* channel */
        const channel = window.location.search.match(/channel=(\d+)/)[1];
        /* 本端ID */
        const id = window.location.search.match(/id=(\d+)/)[1];
        /* 对端ID */
        const peer = window.location.search.match(/peer=(\d+)/)[1];
        this.signnalingChannel = new SignnalingChannel(channel, id, peer);

        this.signnalingChannel.onmessage = async (data) => {
            try {
                if (data.sdp) {
                    console.log(data.sdp.type);
                    switch (data.sdp.type) {
                        case 'offer':
                            await this.pc.setRemoteDescription(data.sdp);
                            const stream =
                                await navigator.mediaDevices.getUserMedia(constraints);
                            stream.getTracks().forEach((track) =>
                                this.pc.addTrack(track, stream));
                            await this.pc.setLocalDescription(await this.pc.createAnswer());
                            this.signnalingChannel.send({sdp: this.pc.localDescription});
                            break;
                        case 'answer':
                            await this.pc.setRemoteDescription(data.sdp);
                            break;
                        default:
                            console.log('Unsupported SDP type');
                            break;
                    }
                } else if (data.candidate) {
                    await this.pc.addIceCandidate(data.candidate);
                } else if (data.ready) {
                    /* 收到对端Ready询问 */
                    this.createOffer();
                    this.signnalingChannel.send({readyACK: true});
                } else if (data.close) {
                    /* 收到对端Close消息 */
                    this.pc.close();
                }
            } catch (err) {
                console.log(err);
            }
        };
    }

    this.pc = new window.RTCPeerConnection(this.getICEServices());

    this.pc.onicecandidate = (event) => {
        // send candidate
        if (event.candidate) {
            this.signnalingChannel.send({candidate: event.candidate});
        }
    };

    this.pc.onconnectionstatechange = (event) => {
        console.log(this.pc.connectionState);
        switch(this.pc.connectionState) {
            case 'connected':
                break;
            case 'disconnected':
                break;
            case 'failed':
                break;
            case 'close':
                if (this.onClose !== null) {
                    this.onClose();
                }
                break;
            default:
                break;
        }
    };

    this.pc.onnegotiationneeded = async () => {
        // 可以开始协商连接
        console.log('onnegotiationneeded');
    };

    this.onConnect = null;
    this.onClose = null;

    // 对端视频流
    this.pc.ontrack = (event) => {
        console.log(event);
        try {
            if (this.onConnect !== null) {
                this.onConnect(event.streams[0]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    this.start = async function() {
        try {
            const stream =
                await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach((track) =>
                this.pc.addTrack(track, stream));
            return Promise.resolve(stream);
        } catch (err) {
            return Promise.reject(err);
        } 
    };

    this.createOffer = async function() {
        try {
            await this.pc.setLocalDescription(await this.pc.createOffer(offerConfig));
            this.signnalingChannel.send({sdp: this.pc.localDescription});
        } catch(error) {
            console.log(error);
        }
    }

    this.connect = async function() {
        this.signnalingChannel.send({ready: true});
    }

    this.disconnect = async function() {
        this.signnalingChannel.send({close: true});
    }
}
