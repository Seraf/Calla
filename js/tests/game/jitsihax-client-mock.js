﻿import { BaseJitsiClient } from "../../src/jitsihax-client-base.js";
import { randomPerson } from "../../src/emoji.js";
import { MockJitsiMeetExternalAPI } from "./mockjitsimeetexternalapi.js";

export class MockJitsiClient extends BaseJitsiClient {
    constructor() {
        super();
    }

    async getApiClassAsync() {
        return MockJitsiMeetExternalAPI;
    }

    mockRxGameData(command, id, data) {
        data = Object.assign({},
            data,
            {
                hax: "Calla",
                command
            });

        const text = JSON.stringify(data);

        this.rxGameData({
            data: {
                senderInfo: {
                    id
                },
                eventData: {
                    text
                }
            }
        });
    }

    txGameData(id, msg, data) {
        if (msg === "userInitRequest") {
            const user = game.userLookup[id];
            if (!!user) {
                user.avatarEmoji = randomPerson().value;
                this.mockRxGameData("userInitResponse", id, user);
            }
        }
    }

    toggleAudio() {
        super.toggleAudio();
        this.mockRxGameData("audioMuteStatusChanged", game.me.id, { muted: this.api.audioMuted });
    }

    toggleVideo() {
        super.toggleVideo();
        this.mockRxGameData("videoMuteStatusChanged", game.me.id, { muted: this.api.videoMuted });
    }

    setAvatarURL(url) {
        super.setAvatarURL(url);
        this.mockRxGameData("avatarChanged", game.me.id, { avatarURL: url });
    }

    /// Send a Calla message to the jitsihax.js script
    txJitsiHax(command, obj) {
        if (this.apiWindow) {
            obj.hax = APP_FINGERPRINT;
            obj.command = command;
            this.apiWindow.postMessage(JSON.stringify(obj), this.apiOrigin);
        }
    }

    rxJitsiHax(evt) {
        const isLocalHost = evt.origin.match(/^https?:\/\/localhost\b/);
        if (evt.origin === "https://" + JITSI_HOST || isLocalHost) {
            try {
                const data = JSON.parse(evt.data);
                if (data.hax === APP_FINGERPRINT) {
                    const evt2 = new CallaEvent(data);
                    this.dispatchEvent(evt2);
                }
            }
            catch (exp) {
                console.error(exp);
            }
        }
    }

    setAudioProperties(origin, transitionTime, minDistance, maxDistance, rolloff) {
        this.txJitsiHax("setAudioProperties", {
            origin,
            transitionTime,
            minDistance,
            maxDistance,
            rolloff
        });
    }

    setPosition(evt) {
        if (evt.id === this.localUser) {
            this.txJitsiHax("setLocalPosition", evt);
            for (let toUserID of this.otherUsers.keys()) {
                this.txGameData(toUserID, "userMoved", evt);
            }
        }
        else {
            this.txJitsiHax("setUserPosition", evt);
        }
    }
}