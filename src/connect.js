import adapter from 'webrtc-adapter';
import { SignnalingChannel } from './signnal';
import queryString from 'query-string';

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
        audio: true, //{ echoCancellation: true }, 
        video: { width: 400, height: 300}
    };

    this.getICEServices = function() {
        if (adapter.browserDetails.browser !== 'chrome') {
            return configuration.iceServices;
        }
        return configuration;
    }

    this.offer = null;
    this.answer = null;
    this.pcs = {};

    /* 建立signnal连接，用于交换数据 */
    this.signnaling = () => {
        const query = queryString.parse(window.location.search);
        this.signnalingChannel = new SignnalingChannel(query.channel, query.id, query.peer);
        this.peer = query.peer;

        this.signnalingChannel.onmessage = async (message) => {
            try {
                if (message.data.sdp) {
                    console.log(message.data.sdp.type);
                    const pc = this.pcs[message.sender].pc;
                    switch (message.data.sdp.type) {
                        case 'offer':
                            await pc.setRemoteDescription(message.data.sdp);
                            const stream =
                                await navigator.mediaDevices.getUserMedia(constraints);
                            stream.getTracks().forEach((track) =>
                                pc.addTrack(track, stream));
                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);
                            this.signnalingChannel.send({sdp: pc.localDescription}, message.sender);
                            break;
                        case 'answer':
                            await pc.setRemoteDescription(message.data.sdp);
                            break;
                        default:
                            console.log('Unsupported SDP type');
                            break;
                    }
                } else if (message.data.candidate) {
                    if (this.pcs[message.sender]) {
                        const pc = this.pcs[message.sender].pc;
                        await pc.addIceCandidate(message.data.candidate);
                    }
                } else if (message.data.ready) {
                    /* 收到对端Ready询问 */
                    this.createOffer(message.sender);
                    this.signnalingChannel.send({readyACK: true}, message.sender);
                } else if (message.data.close) {
                    if (this.pcs[message.sender]) {
                        this.pcs[message.sender] = null;
                    }
                }
            } catch (err) {
                console.log(message);
                console.error(err);
            }
        };
    }


    const onicecandidate = (event) => {
        // send candidate
        if (event.candidate) {
            this.signnalingChannel.send({candidate: event.candidate}, 'all');
        }
    };

    const onconnectionstatechange = id => event => {
        console.log(event.target.connectionState);
        switch(event.target.connectionState) {
            case 'connected':
                break;
            case 'disconnected':
                this.onClose(id);
                event.target.close();
                break;
            case 'failed':
                break;
            case 'closed':
                break;
            default:
                break;
        }
    };

    const onnegotiationneeded = async () => {
        // 可以开始协商连接
        console.log('onnegotiationneeded');
    };

    this.onConnect = null;
    this.onClose = null;
    this.pcs = [];

    // 对端视频流
    const ontrack = id => event => {
        try {
            if (this.onConnect !== null) {
                this.onConnect(id, event);
            }
        } catch (err) {
            console.log(err);
        }
    };

    this.start = async function(pc) {
        try {
            this.stream =
                await navigator.mediaDevices.getUserMedia(constraints);
            return Promise.resolve(this.stream);
        } catch (err) {
            return Promise.reject(err);
        } 
    };

    this.getIdentityAssertion = async function(pc) {
         try {
             const identity = await pc.peerIdentity;
             console.log(identity);
             return identity;
         } catch(err) {
             console.log("Error identifying remote peer: ", err);
             return null;
         }
    };

    this.createPC = function(id) {
        const pc = new window.RTCPeerConnection(this.getICEServices());
        const connectId = `${id}-${Date.now()}`;
        this.connectId = connectId;
        pc.onicecandidate = onicecandidate;
        pc.onconnectionstatechange = onconnectionstatechange(connectId);
        pc.onnegotiationneeded = onnegotiationneeded;
        pc.ontrack = ontrack(connectId);
        this.stream.getTracks().forEach((track) =>
            pc.addTrack(track, this.stream));
        this.pcs[id] = {pc: pc};
        return pc;
    }

    this.createOffer = async function(id) {
        try {
            if (!this.pcs[id]) {
                const pc = this.createPC(id);
                const offer = await pc.createOffer(offerConfig);
                await pc.setLocalDescription(offer);
                this.signnalingChannel.send({sdp: pc.localDescription}, id);
            }
        } catch(error) {
            console.log(error);
        }
    }

    this.connect = async function() {
        this.createPC(this.peer);
        this.signnalingChannel.send({ready: true}, this.peer);
    }

    this.disconnect = async function() {
        if (this.pcs[this.peer]) {
            let pc = this.pcs[this.peer].pc;
            this.pcs[this.peer] = null;
            this.signnalingChannel.send({close: true}, this.peer);
            this.onClose(this.connectId);
            pc.close();
            pc = null;
        }
    }
}
