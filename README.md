# Photoshoot JSON-prompt Generator

JSON-prompt generator for AI photoshoot creation, optimized for Nano Banana and other image generation neural networks.

## Features

- 📸 8 categories of parameters (Model, Camera, Lighting, Style, Clothing, Location, Atmosphere, Quality)
- 🌐 Bilingual interface (Russian/English)
- 🎨 Color palette selector for clothing
- 📋 One-click JSON prompt copy
- 🔄 Auto-translation to English
- 💡 Built-in help modal

## Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Colorful

**Backend:**
- Node.js
- Express
- Google Translate API

## Installation

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm start
```

## Usage

1. Select parameters from each category
2. Click "Show JSON-prompt" button
3. Copy the generated JSON prompt
4. Use it in your AI image generator (Nano Banana, etc.)

## Deployment

### Frontend (Vercel/Netlify)
- Deploy the `client` folder
- Set build command: `npm run build`
- Set output directory: `dist`

### Backend (Render/Railway)
- Deploy the `server` folder
- Set start command: `npm start`
- Add environment variables if needed

## License

MIT
