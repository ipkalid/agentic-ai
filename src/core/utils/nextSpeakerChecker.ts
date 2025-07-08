import type { ChatCompletionMessageParam, ChatCompletion } from 'openai/resources/chat/completions';

import type { ResponseFormatJSONSchema } from 'openai/resources';
import type { ClientInterface } from '../core/client';


const CHECK_PROMPT = `Analyze *only* the content and structure of your immediately preceding response (your last turn in the conversation history). Based *strictly* on that response, determine who should logically speak next: the 'user' or the 'model' (you).
**Decision Rules (apply in order):**
1.  **Model Continues:** If your last response explicitly states an immediate next action *you* intend to take (e.g., "Next, I will...", "Now I'll process...", "Moving on to analyze...", indicates an intended tool call that didn't execute), OR if the response seems clearly incomplete (cut off mid-thought without a natural conclusion), then the **'model'** should speak next.
2.  **Question to User:** If your last response ends with a direct question specifically addressed *to the user*, then the **'user'** should speak next.
3.  **Waiting for User:** If your last response completed a thought, statement, or task *and* does not meet the criteria for Rule 1 (Model Continues) or Rule 2 (Question to User), it implies a pause expecting user input or reaction. In this case, the **'user'** should speak next.
**Output Format:**
Respond *only* in JSON format according to the following schema. Do not include any text outside the JSON structure.
\`\`\`json
{
  "type": "object",
  "properties": {
    "reasoning": {
        "type": "string",
        "description": "Brief explanation justifying the 'next_speaker' choice based *strictly* on the applicable rule and the content/structure of the preceding turn."
    },
    "next_speaker": {
      "type": "string",
      "enum": ["user", "assistance"],
      "description": "Who should speak next based *only* on the preceding turn and the decision rules."
    }
  },
  "required": ["next_speaker", "reasoning"]
}
\`\`\`
`;

const RESPONSE_SCHEMA: ResponseFormatJSONSchema = {
  type: 'json_schema',
  json_schema: {
    name: 'next_speaker_response',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        reasoning: {
          type: 'string',
          description:
            "Brief explanation justifying the 'next_speaker' choice based *strictly* on the applicable rule and the content/structure of the preceding turn.",
        },
        next_speaker: {
          type: 'string',
          enum: ['user', 'assistance'],
          description:
            'Who should speak next based *only* on the preceding turn and the decision rules',
        },
      },
      required: ['reasoning', 'next_speaker'],
      additionalProperties: false,
    },
  },
};

export interface NextSpeakerResponse {
  reasoning: string;
  next_speaker: 'user' | 'assistance';
}

// Helper function to check if a message is a function/tool response
function isFunctionResponse(message: ChatCompletionMessageParam): boolean {
  return message.role === 'tool';
}

// Interface for chat history provider
export interface ChatHistoryProvider {
  getHistory(): ChatCompletionMessageParam[];
}

export async function checkNextSpeaker(
  chat: ChatHistoryProvider,
  client: ClientInterface,
): Promise<NextSpeakerResponse | null> {

  const curatedHistory = chat.getHistory();

  if (curatedHistory.length === 0) {
    return null;
  }

  const comprehensiveHistory = chat.getHistory();

  if (comprehensiveHistory.length === 0) {
    return null;
  }
  const lastComprehensiveMessage =
    comprehensiveHistory[comprehensiveHistory.length - 1];



  if (
    lastComprehensiveMessage &&
    isFunctionResponse(lastComprehensiveMessage)
  ) {
    return {
      reasoning:
        'The last message was a function response, so the model should speak next.',
      next_speaker: 'assistance',
    };
  }

  if (
    lastComprehensiveMessage &&
    lastComprehensiveMessage.role === 'assistant' &&
    (!lastComprehensiveMessage.content || lastComprehensiveMessage.content === '')
  ) {
    return {
      reasoning:
        'The last message was a filler model message with no content (nothing for user to act on), model should speak next.',
      next_speaker: 'assistance',
    };
  }


  const lastMessage = curatedHistory[curatedHistory.length - 1];
  if (!lastMessage || lastMessage.role !== 'assistant') {

    return null;
  }

  const messages: ChatCompletionMessageParam[] = [
    ...curatedHistory,
    { role: 'user', content: CHECK_PROMPT },
  ];

  try {
    const response = await client.create({
      model: process.env.NEXT_PUBLIC_MODEL || 'gpt-4.1', // Use a capable model for this analysis
      messages,
      response_format: RESPONSE_SCHEMA,
      temperature: 0.1,
    });


    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsedResponse = JSON.parse(content) as NextSpeakerResponse;

    if (
      parsedResponse &&
      parsedResponse.next_speaker &&
      ['user', 'assistance'].includes(parsedResponse.next_speaker)
    ) {
      return parsedResponse;
    }
    return null;
  } catch (error) {
    console.warn(
      error,
    );
    return null;
  }
}
