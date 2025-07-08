# How to Run the Agentic AI Project

This guide will help you get the Agentic AI framework up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **Git** for version control

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd agentic-ai
```

### 2. Install Dependencies

Choose your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

### 3. Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```env
   # Required:  API Key
   NEXT_PUBLIC_API_KEY=your_api_key_here
   
   # Required: perplexity for search
   NEXT_PUBLIC_PERPELEXITY_KEY=your_api_key_here 
   
   # Required: LLM Provider URL
   NEXT_PUBLIC_OPENAI_BASE_URL=llm_provider_url
   
   # Optional: Model selection
   NEXT_PUBLIC_MODEL=gpt-4
   ```

### 4. Start the Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
agentic-ai/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── config/              # Application configuration
│   └── core/                # Agentic AI framework core
│       ├── agents/          # AI agent implementations
│       ├── core/            # Core client and config
│       ├── tools/           # Tool implementations
│       └── utils/           # Utility functions
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
└── next.config.ts          # Next.js configuration
```

## Framework Features

This project includes a powerful Agentic AI framework with:

- **Multiple Agent Types**: General, HR, and Travel agents
- **Extensible Tool System**: Web search, calculations, weather, and more
- **Function Calling**: Seamless integration with OpenAI's function calling
- **Conversation Management**: Built-in chat history and context management
- **Type Safety**: Full TypeScript support throughout

## Creating Agents and Tools

For detailed information on how to create custom agents and tools, see the [Framework Documentation](./src/core/FRAMEWORK.md).


### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify your environment variables are correctly set
3. Ensure all dependencies are installed
4. Try clearing your browser cache and restarting the development server

## Next Steps

- Explore the different agent types available
- Learn how to create custom tools in the [Framework Documentation](./src/core/FRAMEWORK.md)
- Customize agent behaviors and system prompts
- Integrate additional APIs and services

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.