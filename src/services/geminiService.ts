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

export async function simulateMatchInnings(
  battingTeam: Team, 
  bowlingTeam: Team, 
  options: { aggression: number; intensity: number; battingOrder: Player[] }
): Promise<BallResult[]> {
  const prompt = `
    Simulate a T20 cricket innings between ${battingTeam.name} and ${bowlingTeam.name}.
    
    TACTICAL CONTEXT:
    - Batting Aggression: ${options.aggression}/100 (Higher means more boundaries but higher wicket risk)
    - Bowling Intensity: ${options.intensity}/100 (Higher means more pressure and wickets but risk of extras)
    - Batting Order: ${options.battingOrder.map(p => p.name).join(', ')}
    
    Bowling Team Squad: ${bowlingTeam.squad.map(p => p.name).join(', ')}
    
    Provide a ball-by-ball summary for exactly 5 overs (30 balls).
    The simulation should reflect the tactical aggression and intensity.
    
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

    const text = response.text;
    if (!text) {
      console.warn("Empty response from AI");
      return [];
    }

    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data as BallResult[];
      }
      console.error("AI response is not an array:", data);
      return [];
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, text);
      return [];
    }
  } catch (error) {
    console.error("Error simulating match:", error);
    return [];
  }
}
