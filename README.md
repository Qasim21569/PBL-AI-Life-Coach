# AI Life Coach

A comprehensive AI-powered life coaching platform offering guidance in career development, fitness, finance, and mental wellbeing.

## Features

- **Career Coaching**: Professional development, job search, and career advancement strategies
- **Fitness Coaching**: Personalized workout plans and health guidance
- **Financial Coaching**: Budgeting, investment advice, and financial planning
- **Mental Wellbeing**: Stress management and personal growth techniques

## Technology Stack

- Next.js
- React
- Material UI
- Firebase Authentication
- Firebase Firestore

## Development

To run the project locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This project is configured for GitHub Pages deployment through GitHub Actions. When changes are pushed to the `main` branch, the site will automatically build and deploy to the `gh-pages` branch.

The live site can be accessed at: https://qasim21569.github.io/AI-Life-COach/

## Local Build

To create a production build locally:

```bash
npm run build
```

This will generate static files in the `out` directory that can be deployed to any static hosting service.

## Hugging Face Integration

This project uses Hugging Face's Inference API to generate responses from AI models. By default, it uses the `mistralai/Mistral-7B-Instruct-v0.2` model, but you can change this in `app/api/llm/service.ts`.

Recommended models for chatbot applications:

- `meta-llama/Llama-2-7b-chat-hf`
- `microsoft/Phi-2`
- `google/gemma-7b-it`
- `mistralai/Mistral-7B-Instruct-v0.2`

## Project Structure

- `/app` - Next.js app directory with pages and API routes
- `/components` - Reusable React components
- `/public` - Static assets
- `/app/api` - Backend API routes
  - `/app/api/chat` - Chat API endpoint
  - `/app/api/llm` - LLM service for Hugging Face integration

## License

[MIT](LICENSE)
