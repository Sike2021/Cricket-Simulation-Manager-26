import { GoogleGenAI } from "@google/genai";
import { Team, Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface BallResult {
  over: number;
  ball: number;
  batsman: string;
  bowler: string;
  runs: number;
  isWicket: boolean;
  commentary: string;
}

export async function generatePlayerAvatar(
  name: string,
  role: string,
  hairDesc: string,
  skinDesc: string,
  facialDesc: string
): Promise<string> {
  const prompt = `A professional cricket player portrait. Name: ${name}, Role: ${role}. ${hairDesc}. ${skinDesc}. ${facialDesc}. Wearing a cricket jersey. High quality, photorealistic, studio lighting, solid background.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "512px"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw error;
  }
}

export async function simulateMatchInnings(battingTeam: Team, bowlingTeam: Team): Promise<BallResult[]> {
  const prompt = `
    Simulate a T20 cricket innings between ${battingTeam.name} and ${bowlingTeam.name}.
    Batting Team Squad: ${battingTeam.squad.map(p => p.name).join(', ')}
    Bowling Team Squad: ${bowlingTeam.squad.map(p => p.name).join(', ')}
    
    Provide a ball-by-ball summary for the first 5 overs only for brevity.
    Return the result as a JSON array of objects with the following structure:
    {
      "over": number,
      "ball": number,
      "batsman": string,
      "bowler": string,
      "runs": number,
      "isWicket": boolean,
      "commentary": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error simulating match:", error);
    return [];
  }
}
