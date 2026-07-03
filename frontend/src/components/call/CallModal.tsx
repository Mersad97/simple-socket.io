// 📦 مرحله ۷: کامپوننت CallModal (تماس صوتی/تصویری)
// src/components/call/CallModal.tsx

import { useState, useEffect, useRef } from "react";
import { Modal, Box, Typography, IconButton, Avatar, LinearProgress } from "@mui/material";
import {
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  VolumeUp,
  VolumeOff,
} from "@mui/icons-material";

interface CallModalProps {
  open: boolean;
  onClose: () => void;
  callerName: string;
  callerAvatar?: string;
  type: "VOICE" | "VIDEO";
  isIncoming: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onEndCall?: () => void;
}

export const CallModal = ({
  open,
  onClose,
  callerName,
  callerAvatar,
  type,
  isIncoming,
  onAccept,
  onReject,
  onEndCall,
}: CallModalProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  //   const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  //   const timerRef = useRef<Timeout | null>(null);

  useEffect(() => {
    if (open && !isIncoming) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [open, isIncoming]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
          textAlign: "center",
          outline: "none",
        }}
      >
        <Avatar src={callerAvatar || ""} sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}>
          {!callerAvatar && (callerName?.[0] || "C")}
        </Avatar>
        {/* <Typography variant="h6" fontWeight="bold">
          {callerName}
        </Typography> */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {callerName}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isIncoming
            ? `${type === "VOICE" ? "تماس صوتی" : "تماس تصویری"} ورودی`
            : "در حال تماس..."}
          {!isIncoming && ` (${formatDuration(callDuration)})`}
        </Typography>

        {isIncoming ? (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
            <IconButton
              onClick={onReject}
              sx={{ bgcolor: "error.main", color: "white", width: 64, height: 64 }}
            >
              <CallEnd />
            </IconButton>
            <IconButton
              onClick={onAccept}
              sx={{ bgcolor: "success.main", color: "white", width: 64, height: 64 }}
            >
              <Videocam />
            </IconButton>
          </Box>
        ) : (
          <>
            {type === "VIDEO" && (
              <Box sx={{ my: 2 }}>
                <video
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    backgroundColor: "#000",
                    borderRadius: 8,
                  }}
                  autoPlay
                  muted={isMuted}
                />
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              <IconButton onClick={() => setIsMuted(!isMuted)} sx={{ bgcolor: "grey.200" }}>
                {isMuted ? <MicOff /> : <Mic />}
              </IconButton>
              {type === "VIDEO" && (
                <IconButton onClick={() => setIsVideoOff(!isVideoOff)} sx={{ bgcolor: "grey.200" }}>
                  {isVideoOff ? <VideocamOff /> : <Videocam />}
                </IconButton>
              )}
              <IconButton
                onClick={() => setIsSpeakerOff(!isSpeakerOff)}
                sx={{ bgcolor: "grey.200" }}
              >
                {isSpeakerOff ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <IconButton
                onClick={onEndCall}
                sx={{ bgcolor: "error.main", color: "white", width: 56, height: 56 }}
              >
                <CallEnd />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};
