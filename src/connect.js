import adapter from 'webrtc-adapter';

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

    this.pc = new window.RTCPeerConnection(this.getICEServices());

    this.connectionHandler = function(option) {
        /* candidate */
        this.pc.onicecandidate = (candidate) => {
            // send candidate
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
                    break;
                default:
                    break;
            }
        };

        this.pc.onnegotiationneeded = async () => {
            console.log('onnegotiationneeded--->');
            try {
                await this.pc.setLocalDescription(await this.pc.createOffer(offerConfig));
            } catch(error) {
                console.log(error);
            }
        };
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

    this.connect = async function() {
    }
}
