"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Mic, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/utils/api";

interface AudioResponse {
    audio: string;
    text: string;
}

export default function ChatPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [responseAudio, setResponseAudio] = useState<string | null>(null);
    const [responseText, setResponseText] = useState<string | null>(null);
    const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Add tRPC mutation
    const sendAudio = api.chat.sendAudio.useMutation();

    useEffect(() => {
        // Cleanup function to stop recording if component unmounts while recording
        return () => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isRecording]);

    const handleAudioData = async (audioBlob: Blob) => {
        try {
            // Convert blob to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    // Remove the data URL prefix
                    const base64Data = base64String.split(",")[1];
                    resolve(base64Data);
                };
            });
            reader.readAsDataURL(audioBlob);

            // Wait for base64 conversion
            const base64Data = await base64Promise;

            // Send to API
            const result = await sendAudio.mutateAsync({
                audio: base64Data,
            });

            if (result.success && result.response) {
                // console.log("AI Response:", result.response);
                const response = result.response as AudioResponse;
                // Set the response audio URL
                if (response.audio) {
                    setResponseAudio(response.audio);
                }
                if (response.text) {
                    setResponseText(response.text);
                }
            } else {
                console.error("Error:", result.error);
            }
        } catch (error) {
            console.error("Error processing audio:", error);
        }
    };

    const handlePlayResponse = async () => {
        if (audioRef.current && responseAudio) {
            try {
                const audio = new Audio(responseAudio); // audioUrl is from Replicate response
                audio.play();
            } catch (error) {
                console.error("Error playing audio:", error);
                alert("Unable to play the audio response. Please try again.");
            }
        }
    };

    const handleDownloadResponse = async () => {
        if (responseAudio) {
            try {
                // Create a link to download the file
                const link = document.createElement("a");
                link.href = responseAudio;
                link.download = `ai-response-${Date.now()}.wav`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Error downloading audio:", error);
                alert(
                    "Unable to download the audio response. Please try again."
                );
            }
        }
    };

    const handlePlayRecording = () => {
        console.log("recordingurl:", recordingUrl);
        if (recordingUrl) {
            const audio = new Audio(recordingUrl);
            audio.play();
        }
    };

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
                // Create URL for the recording
                const url = URL.createObjectURL(audioBlob);
                // const audio = new Audio(url);
                // console.log(
                //     "Recording stopped, audio blob created:",
                //     audioBlob
                // );

                // console.log("playing audio!" + url);
                // audio.play();

                // console.log("audio played!");
                setRecordingUrl(url);
                handleAudioData(audioBlob);
            };

            mediaRecorder.start();
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
        <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-background">
            {/* Header */}
            <div className="w-full max-w-4xl">
                <h1 className="text-2xl font-bold text-center mb-4">
                    Practice Speaking
                </h1>
            </div>

            {/* Chat Area */}
            <div className="flex-1 w-1/2 max-w-4xl bg-muted/50 rounded-lg p-4 mb-20">
                Speak to the bot
                {sendAudio.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {responseText && <p>{responseText}</p>}
            </div>

            {/* Audio element for playing response */}
            <audio
                ref={audioRef}
                src={responseAudio ?? undefined}
                // className="hidden"
            />

            {/* Microphone Button */}
            <div className="fixed bottom-8 w-full max-w-4xl px-4">
                <div className="flex justify-center gap-4">
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
                    {isRecording &&
                        (sendAudio.isPending ? (
                            <Button
                                size="lg"
                                className="rounded-full px-8"
                                disabled
                            >
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </Button>
                        ) : (
                            <Link href="/feedback">
                                <Button size="lg" className="rounded-full px-8">
                                    Done
                                </Button>
                            </Link>
                        ))}
                    {recordingUrl && !isRecording && !sendAudio.isPending && (
                        <Button
                            size="lg"
                            className="rounded-full px-8"
                            onClick={handlePlayRecording}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Play Recording
                        </Button>
                    )}
                    {responseAudio && !isRecording && !sendAudio.isPending && (
                        <div className="flex gap-2">
                            <Button
                                size="lg"
                                className="rounded-full px-8"
                                onClick={handlePlayResponse}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Play Response
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full px-8"
                                onClick={handleDownloadResponse}
                            >
                                Download
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
