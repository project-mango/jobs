import axios from 'axios';

const apiKey = process.env.OPEN_AI_API_KEY; // Move this to environment variables for security
const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';

async function getAnswerFromGPT(prompt) {
    try {
        const response = await axios.post(apiUrl, {
            prompt: prompt,
            max_tokens: 100,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return null;
    }
}

export default getAnswerFromGPT;