# Agentic AI Framework

A powerful and extensible AI agent framework built with Next.js and TypeScript. This project provides a modular architecture for creating intelligent agents with customizable tools and capabilities.

## 🚀 Quick Start

**New to this project?** Start here:

📖 **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** - Complete setup and running guide

## 🏗️ Framework Documentation

**Want to build custom agents and tools?** Check out:

🔧 **[Framework Documentation](./src/core/FRAMEWORK.md)** - Comprehensive guide for developers

## 📋 What's Included

This framework comes with:

- **🤖 Pre-built Agents**: General, HR, and Travel agents
- **🛠️ Extensible Tools**: Web search, calculations, weather, and more
- **💬 Function Calling**: Seamless OpenAI function calling integration
- **📝 Conversation Management**: Built-in chat history and context handling
- **🔒 Type Safety**: Full TypeScript support throughout
- **🎨 Modern UI**: Beautiful Next.js interface

## 🏃‍♂️ Quick Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**: [http://localhost:3000](http://localhost:3000)

## 📚 Documentation Structure

- **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** - Setup, installation, and running instructions
- **[src/core/FRAMEWORK.md](./src/core/FRAMEWORK.md)** - Developer guide for creating agents and tools
- **[Next.js Documentation](https://nextjs.org/docs)** - Learn about the underlying framework

## 🏗️ Project Structure

```
agentic-ai/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── config/              # Application configuration
│   └── core/                # 🎯 Agentic AI Framework
│       ├── agents/          # AI agent implementations
│       ├── core/            # Core client and config
│       ├── tools/           # Tool implementations
│       ├── utils/           # Utility functions
│       └── FRAMEWORK.md     # 📖 Developer documentation
├── HOW_TO_RUN.md           # 🚀 Setup guide
└── README.md               # 👈 You are here
```

## 🌟 Key Features

### Multi-Agent System
- **General Agent**: Versatile assistant for various tasks
- **HR Agent**: Specialized for human resources operations
- **Travel Agent**: Focused on travel planning and weather

### Extensible Tool System
- **Web Search**: Real-time internet search capabilities
- **Calculations**: Mathematical operations and computations
- **Weather**: Current weather and forecasts
- **Custom Tools**: Easy to add your own tools

### Developer Experience
- **TypeScript**: Full type safety and IntelliSense
- **Modular Design**: Clean separation of concerns
- **Easy Extension**: Simple patterns for adding agents and tools
- **Comprehensive Docs**: Detailed guides and examples

## 📄 License

This project is licensed under a **Modified MIT License with Modification Restrictions**.

⚠️ **Important**: This software may be used and distributed, but **modifications are not permitted** without explicit written permission from the copyright holder.

**What you CAN do:**
- ✅ Use the software as-is
- ✅ Distribute unmodified copies
- ✅ Use for commercial purposes (unmodified version only)

**What you CANNOT do without permission:**
- ❌ Modify, alter, or create derivative works
- ❌ Make code changes or adaptations
- ❌ Add or remove features
- ❌ Fix bugs or make improvements
- ❌ Redistribute modified versions

For modification permissions, please contact the copyright holder. See the [LICENSE](./LICENSE) file for complete terms.