import axios from 'axios';
import bestPractices from '../data/bestPractices.js';
const apiKey = process.env.OPEN_AI_API_KEY; // Move this to environment variables for security
const apiUrl = 'https://api.openai.com/v1/chat/completions';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: apiKey, // This is the default and can be omitted
  });



async function getAnswerFromGPT(prompt) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `You are a helpful assistant. When responding to job application questions, always follow these best practices:  ${JSON.stringify(bestPractices)}.`,
              },
              { role: "user", content: prompt },
            ],
            model: "gpt-3.5-turbo-1106",
           
            //response_format: { type: "json_object" },
          },
          temperature=0); // try temperature 0
          //console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return null;
    }
}

export default getAnswerFromGPT;