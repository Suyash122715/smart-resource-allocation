import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || !apiKey) {
    console.error('❌ No API key found in .env. Current value:', apiKey);
    return;
  }

  console.log('🔍 Querying Google for your authorized models...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data: any = await response.json();

    if (data.error) {
      console.error('❌ Google API Error:', data.error.message);
      if (data.error.status === 'PERMISSION_DENIED') {
        console.log('💡 TIP: Check if your API key has "Generative Language API" enabled in Google Cloud Console.');
      }
      return;
    }

    if (!data.models || data.models.length === 0) {
      console.log('⚠️ Google says you have access to 0 models. This usually means the API key is not linked to a project with Gemini enabled.');
      return;
    }

    console.log('✅ Found the following models for your key:');
    data.models.forEach((m: any) => {
      console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
    });
    
    console.log('\n👉 Copy one of the names above (like gemini-1.5-flash) and put it in your .env as GEMINI_MODEL');
  } catch (error: any) {
    console.error('💥 Failed to connect to Google:', error.message);
  }
}

listModels();
