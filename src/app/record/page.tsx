"use client";

import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function RecordPage() {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        // Cleanup function to stop recording if component unmounts while recording
        return () => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/wav",
                });
                const url = URL.createObjectURL(audioBlob);
                const audio = new Audio(url);

                console.log(
                    "Recording stopped, audio blob created:",
                    audioBlob
                );

                console.log("Recording stopped, playing audio...");
                audio.play();
            };

            mediaRecorder.start(); // Collect data every second
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert(
                "Error accessing microphone. Please ensure you have granted microphone permissions."
            );
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            const tracks = mediaRecorderRef.current.stream.getTracks();
            tracks.forEach((track) => track.stop());
            setIsRecording(false);
        }
    };

    const handleMicClick = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
            <div className="text-center space-y-8">
                <h1 className="text-2xl font-bold">Voice Recorder</h1>
                <p className="text-muted-foreground">
                    Click the microphone to start recording
                </p>
                <Button
                    size="lg"
                    className={`rounded-full w-16 h-16 ${
                        isRecording ? "bg-red-500 hover:bg-red-600" : ""
                    }`}
                    onClick={handleMicClick}
                >
                    <Mic
                        className={`w-8 h-8 ${
                            isRecording ? "animate-pulse" : ""
                        }`}
                    />
                </Button>
            </div>
        </main>
    );
}
