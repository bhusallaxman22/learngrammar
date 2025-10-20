# GrammarQuest - Interactive Grammar Learning App 🎯

A fun, gamified English grammar learning application built with React, TypeScript, Tailwind CSS, Vite, and Firebase.

## ✨ Features

### 🤖 AI-Powered Question Generation **NEW!**
- **Custom Topics**: Generate questions on any grammar topic
- **OpenRouter Integration**: Uses Claude 3.5 Sonnet for high-quality content
- **Flexible Configuration**: Choose category, difficulty, and exercise type
- **Instant Generation**: Get 3-10 questions in seconds
- **Smart Explanations**: AI provides detailed answer explanations
- See [OPENROUTER_GUIDE.md](./OPENROUTER_GUIDE.md) for setup instructions

### 📚 Comprehensive Grammar Lessons
- **Subject-Verb-Object**: Master sentence structure basics
- **Tenses**: Learn all 12 English tenses with examples
- **Conditionals**: Understand zero, first, second, and third conditionals
- **Subject-Verb Agreement**: Perfect your agreement rules
- Level-based progression system
- Interactive exercises with instant feedback

### 🎮 Gamification Features
- **XP & Leveling System**: Earn experience points and level up (8 levels from Beginner to Legend)
- **Coins & Rewards**: Collect coins for completing lessons
- **Achievements System**: Unlock 16+ achievements for various accomplishments
- **Streak Tracking**: Build daily learning streaks with fire badges
- **Progress Tracking**: Monitor your learning journey across all categories

### 🎯 Interactive Learning
- Multiple exercise types:
  - Multiple choice questions
  - Fill in the blanks
  - Drag and drop
  - Sentence identification
  - True/False questions
- Real-time feedback and explanations
- Animated celebrations on success
- Difficulty-based point system

### 👤 User Features
- Firebase authentication (Email/Password & Google Sign-In)
- Personalized dashboard
- Detailed progress statistics
- Profile with learning metrics
- Time tracking and performance analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Firebase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd grammar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Create a web app and copy the configuration

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Optional: For AI-powered features
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
   
   **To enable AI features**: Get an API key from [OpenRouter](https://openrouter.ai/keys) and add it as `VITE_OPENROUTER_API_KEY`. See [OPENROUTER_GUIDE.md](./OPENROUTER_GUIDE.md) for details.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Building for Production

```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
grammar/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Navbar.tsx
│   │   └── LessonPlayer.tsx
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ProgressContext.tsx
│   ├── data/              # Lesson and achievement data
│   │   ├── lessons.ts
│   │   └── achievements.ts
│   ├── firebase/          # Firebase configuration
│   │   └── config.ts
│   ├── services/          # External API services
│   │   └── openrouter.ts  # AI question generation
│   ├── pages/             # Main application pages
│   │   ├── Dashboard.tsx
│   │   ├── Lessons.tsx
│   │   ├── AILessons.tsx  # NEW: AI-powered lesson generator
│   │   ├── Achievements.tsx
│   │   ├── Profile.tsx
│   │   └── auth/
│   │       └── Login.tsx
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles with Tailwind
├── public/                # Static assets
├── .env.example           # Environment variables template
├── OPENROUTER_GUIDE.md    # AI features setup guide
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Project dependencies
```

## 🎨 Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: OpenRouter (Claude 3.5 Sonnet)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Analytics
- **Effects**: Canvas Confetti (celebration animations)

## 📖 Usage Guide

### For Students

1. **Sign Up/Login**: Create an account or use Google Sign-In
2. **Choose a Lesson**: Browse lessons by category or difficulty
3. **Complete Exercises**: Answer questions and get instant feedback
4. **Earn Rewards**: Collect XP, coins, and unlock achievements
5. **Track Progress**: Monitor your learning journey in the dashboard
6. **Build Streaks**: Come back daily to maintain your learning streak

### Lesson Categories

- 🎯 **Subject-Verb-Object** (2 lessons)
- ⏰ **Tenses** (12 lessons covering all tenses)
- 🔀 **Conditionals** (4 lessons)
- 🤝 **Subject-Verb Agreement** (1 lesson)

### Achievement Types

- 📚 **Lesson Achievements**: Complete specific numbers of lessons
- 🔥 **Streak Achievements**: Maintain daily learning streaks
- 🎯 **Accuracy Achievements**: Get perfect scores
- ⚡ **Speed Achievements**: Complete lessons quickly
- ⭐ **Special Achievements**: Master specific grammar categories

## 🔥 Features in Detail

### Level System
- Level 1: Beginner 🌱 (0-100 XP)
- Level 2: Learner 📚 (100-250 XP)
- Level 3: Student ✏️ (250-500 XP)
- Level 4: Scholar 🎓 (500-1000 XP)
- Level 5: Expert 🏆 (1000-2000 XP)
- Level 6: Master 👑 (2000-5000 XP)
- Level 7: Grammar Guru ⭐ (5000-10000 XP)
- Level 8: Legend 🌟 (10000+ XP)

### Exercise Types
1. **Multiple Choice**: Select the correct answer from options
2. **Fill in the Blanks**: Type the missing word
3. **Identify Parts**: Mark subject, verb, and object
4. **Drag and Drop**: Arrange words to form sentences
5. **True/False**: Determine statement accuracy

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Lessons

1. Open `src/data/lessons.ts`
2. Add new lesson object following the `GrammarLesson` type
3. Include content, rules, examples, and exercises
4. Lesson will automatically appear in the app

### Adding New Achievements

1. Open `src/data/achievements.ts`
2. Add new achievement object
3. Implement unlock logic in `ProgressContext.tsx`

## 📱 Responsive Design

The app is fully responsive and works great on:
- 📱 Mobile devices
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

## 🔐 Firebase Security

Remember to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /progress/{progressId} {
      allow read, write: if request.auth != null;
    }
    match /achievements/{document=**} {
      allow read: if true;
    }
  }
}
```

## 🚀 Deployment

### Deploy to Docker / TrueNAS 🐳

**Perfect for self-hosting on your own server or TrueNAS!**

See detailed instructions in [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

#### Quick Start:

```bash
# 1. Build and deploy automatically
./deploy.sh

# 2. Or use docker-compose manually
docker-compose up -d

# 3. Access the app
http://your-server-ip:8080
```

#### What's Included:
- ✅ Multi-stage Docker build (optimized production image)
- ✅ Nginx web server with gzip compression
- ✅ Health checks and auto-restart
- ✅ Docker Compose configuration
- ✅ Automated deployment script
- ✅ Complete TrueNAS setup guide

**Files:**
- `Dockerfile` - Production-ready container image
- `docker-compose.yml` - Easy orchestration
- `nginx.conf` - Optimized web server config
- `deploy.sh` - One-command deployment script
- `DOCKER_DEPLOYMENT.md` - Comprehensive guide

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Add more lessons

## 📄 License

This project is open source and available under the MIT License.

## 👏 Credits

Built with ❤️ using:
- React
- TypeScript
- Tailwind CSS
- Firebase
- Framer Motion
- Lucide Icons

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Happy Learning! 🎉📚**
