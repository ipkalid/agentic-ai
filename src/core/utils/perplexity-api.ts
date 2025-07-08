
import type { ChatCompletion, ResponseFormatJSONSchema } from "openai/resources";



export async function fetchChatCompletion<T>(format: ResponseFormatJSONSchema, userMessage: string): Promise<T> {
    const url = 'https://api.perplexity.ai/chat/completions';
    const apiKey = 'Bearer ' + process.env.NEXT_PUBLIC_PERPELEXITY_KEY;
    const requestBody = {
        model: "sonar-pro",
        messages: [
            {
                role: "system",
                content: "Be precise and concise."
            },
            {
                role: "user",
                content: userMessage
            }
        ],
        response_format: format
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': apiKey
        },
        body: JSON.stringify(requestBody)
    });





    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as ChatCompletion;

    try {
        const contentString = data.choices[0]?.message.content;
        if (!contentString) {
            throw new Error('No content received from API.');
        }

        const parsedData = JSON.parse(contentString) as T;


        if (!parsedData) {
            throw new Error('Failed to parse response data to expected type');
        }
        return parsedData;

    } catch (error) {
        throw new Error(`Failed to convert response data to expected type: ${error}`);
    }
}


