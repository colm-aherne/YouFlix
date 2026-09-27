import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { vibePrompt, categoryName } = await req.json();

    if (!vibePrompt || typeof vibePrompt !== 'string') {
      return NextResponse.json({ error: 'Please provide a prompt describing your playlist vibe.' }, { status: 400 });
    }

    const curationSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        playlistTitle: {
          type: Type.STRING,
          description: 'A catchy, Netflix-style cinematic title for this curated playlist.'
        },
        category: {
          type: Type.STRING,
          description: 'A clean category genre tag, e.g., Sci-Fi Cinema, Deep Dives, Ambient Music, Future Tech, Gaming Lore.'
        },
        description: {
          type: Type.STRING,
          description: 'A 1-2 sentence compelling editorial synopsis of this collection.'
        },
        recommendedVideos: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: {
                type: Type.STRING,
                description: 'Valid, working real YouTube Video ID for this topic (11 characters, e.g. kd2KEHvK-q8, 7Pq-S557XQU, sCNlt5nvSI8, etc. If unsure, provide widely known iconic YouTube video IDs).'
              },
              title: {
                type: Type.STRING,
                description: 'Accurate and compelling video title.'
              },
              channelTitle: {
                type: Type.STRING,
                description: 'Original creator / channel name.'
              },
              description: {
                type: Type.STRING,
                description: 'Short video overview.'
              },
              durationMinutes: {
                type: Type.INTEGER,
                description: 'Estimated duration in minutes.'
              },
              matchScore: {
                type: Type.INTEGER,
                description: 'Match percentage from 90 to 99.'
              },
              ageRating: {
                type: Type.STRING,
                description: 'Age rating like G, PG, PG-13, TV-14, TV-MA.'
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['id', 'title', 'channelTitle', 'durationMinutes']
          }
        }
      },
      required: ['playlistTitle', 'category', 'description', 'recommendedVideos']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are NetTube's Master AI Curator. 
The user is requesting a curated Netflix-style category playlist based on this vibe:
"${vibePrompt}" ${categoryName ? `(Preferred Genre: ${categoryName})` : ''}

Generate 4 to 6 authentic, highly acclaimed YouTube video recommendations that match this vibe. Use real, iconic YouTube video IDs where possible (e.g., Lemmino, Kurzgesagt, Veritasium, Dust Sci-Fi, Cercle live sets, Marques Brownlee, Fireship, Noclip, Ahoy, Blender Foundation, ColorsxStudio).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: curationSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No curation generated');
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Curation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate AI curation',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
