import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

const JitsiCall = ({ roomName, userName, onCallEnd }) => {
    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(4px)"
        }}>
            <div style={{
                width: "90%",
                height: "85%",
                backgroundColor: "#2D2B55",
                borderRadius: "24px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 20px 50px rgba(124, 111, 205, 0.3)"
            }}>
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={roomName}
                    configOverwrite={{
                        startWithAudioMuted: false,
                        startWithVideoMuted: true,
                        prejoinPageEnabled: false,
                        disableModeratorIndicator: true,
                        enableEmailInStats: false,
                        toolbarButtons: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                            'security'
                        ],
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        SHOW_JITSI_WATERMARK: false,
                        DEFAULT_BACKGROUND: '#2D2B55',
                    }}
                    userInfo={{
                        displayName: userName,
                    }}
                    onApiReady={(externalApi) => {
                        // Optional: handle events from externalApi
                    }}
                    onReadyToClose={() => {
                        if (onCallEnd) onCallEnd();
                    }}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = "100%";
                        iframeRef.style.width = "100%";
                    }}
                />
                
                {/* Close Button fallback if needed */}
                <button 
                    onClick={onCallEnd}
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        padding: "10px 20px",
                        background: "#EF4444",
                        color: "white",
                        border: "none",
                        borderRadius: "999px",
                        fontWeight: "800",
                        cursor: "pointer",
                        zIndex: 10000,
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                    }}
                >
                    END CALL
                </button>
            </div>
        </div>
    );
};

export default JitsiCall;
