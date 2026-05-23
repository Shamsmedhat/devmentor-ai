import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const r = await ai.models.embedContent({
  model: 'gemini-embedding-001',
  contents: ['t1', 't2', 't3'],
});

console.log('response keys:', Object.keys(r));
console.log('plural embeddings count:', r.embeddings?.length);
console.log('plural first dim:', r.embeddings?.[0]?.values?.length);
console.log('singular embedding dim:', r.embedding?.values?.length);
console.log('---raw response---');
console.log(JSON.stringify(r, null, 2).slice(0, 2000));
