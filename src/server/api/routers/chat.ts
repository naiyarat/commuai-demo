import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import Replicate from "replicate";
import fs from 'fs';
import path from 'path';

interface ReplicateOutput {
  audio: string;
  text: string;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const chatRouter = createTRPCRouter({
  sendAudio: publicProcedure
    .input(z.object({
      audio: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        // Convert base64 to blob
        const audioBlob = Buffer.from(input.audio, 'base64');
        
        // Create FormData for tmpfiles.org
        const uploadFormData = new FormData();
        uploadFormData.append('file', new Blob([audioBlob], { type: 'audio/wav' }), 'audio.wav');

        // Upload to tmpfiles.org with proper headers
        const response = await fetch("https://tmpfiles.org/api/v1/upload", {
          method: "POST",
          body: uploadFormData,
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload error:", errorText);
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        const prompt = `
        You are a communication coach. Please evaluate the user's speech based on these 3 criteria and elaborate with specific examples:

        1. Pacing – Was I speaking too fast, too slow, or just right?

        2. Filler Words – Did I use too many filler words like "um," "uh," or "like"?

        3. Confidence and Flow – Did I sound confident, and did my words flow smoothly?

        Give a score out of 10 for each category, followed by:

        1. One thing I did well

        2. One thing I should improve

        3. One quick tip to try next time
        `

        const uploadData = await response.json();
        const downloadUrl = uploadData.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        

        // Call Replicate with the URL
        const output = await replicate.run(
          "ictnlp/llama-omni:36c9bcf70a56f40d9a27445c30c769308b18180296749f86ec9b682baf7ad351",
          {
            input: {
              top_p: 0,
              prompt: prompt,
              input_audio: downloadUrl,
              temperature: 0,
              max_new_tokens: 1024
            }
          }
        ) as ReplicateOutput;

        // Save the audio file locally
        const audioUrl = output.audio;
        const audioResponse = await fetch(audioUrl);
        const audioBuffer = await audioResponse.arrayBuffer();
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `response_${timestamp}.wav`;
        const filepath = path.join(uploadsDir, filename);

        // Save the file
        fs.writeFileSync(filepath, Buffer.from(audioBuffer));
        console.log('Audio response saved as:', filepath);

        // Return the local file URL
        return { 
          success: true, 
          response: {
            ...output,
            audio: `/uploads/${filename}` // Return the local path
          }
        };
      } catch (error) {
        console.error("Error calling Replicate:", error);
        return { success: false, error: String(error) };
      }
    }),
}); 