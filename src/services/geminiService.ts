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

export async function simulateMatchInnings(battingTeam: Team, bowlingTeam: Team, aggression: number, intensity: number): Promise<BallResult[]> {
  const prompt = `
    Simulate a T20 cricket innings between ${battingTeam.name} and ${bowlingTeam.name}.
    Batting Team Squad: ${battingTeam.squad.map(p => p.name).join(', ')}
    Bowling Team Squad: ${bowlingTeam.squad.map(p => p.name).join(', ')}
    
    Simulation Parameters:
    - Batting Aggression: ${aggression}/100 (Higher means more boundaries but higher risk of wickets)
    - Bowling Intensity: ${intensity}/100 (Higher means more dot balls and pressure, but might leak runs if line/length is missed)
    
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
