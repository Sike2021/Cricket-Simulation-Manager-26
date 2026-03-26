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

export interface MatchResult {
  homeScore: { runs: number, wickets: number, overs: number, balls: number };
  awayScore: { runs: number, wickets: number, overs: number, balls: number };
  result: string;
}

export async function simulateMatchInnings(battingTeam: Team, bowlingTeam: Team, aggression: number, intensity: number): Promise<BallResult[]> {
  const prompt = `
    Simulate a T20 cricket innings between ${battingTeam.name} and ${bowlingTeam.name}.
    Batting Team Squad: ${battingTeam.squad.map(p => p.name).join(', ')}
    Bowling Team Squad: ${bowlingTeam.squad.map(p => p.name).join(', ')}
    
    Batting Aggression: ${aggression}/100
    Bowling Intensity: ${intensity}/100

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

export async function quickSimulateMatch(homeTeam: Team, awayTeam: Team): Promise<MatchResult> {
  const prompt = `
    Quickly simulate a T20 cricket match between ${homeTeam.name} and ${awayTeam.name}.
    Home Team Squad: ${homeTeam.squad.map(p => p.name).join(', ')}
    Away Team Squad: ${awayTeam.squad.map(p => p.name).join(', ')}
    
    Return the final score and result as a JSON object:
    {
      "homeScore": { "runs": number, "wickets": number, "overs": number, "balls": number },
      "awayScore": { "runs": number, "wickets": number, "overs": number, "balls": number },
      "result": "string describing who won and by how much"
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

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error quick simulating match:", error);
    return {
      homeScore: { runs: 0, wickets: 0, overs: 0, balls: 0 },
      awayScore: { runs: 0, wickets: 0, overs: 0, balls: 0 },
      result: "Match abandoned due to technical issues"
    };
  }
}
