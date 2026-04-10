# 🎭 How Do You Know Hayden?

A collaborative storytelling platform for drama classes where students create characters and collectively build a narrative about a mysterious classmate named Hayden.

## Overview

**How Do You Know Hayden?** is an interactive creative writing exercise where:

1. **Teachers** create a virtual classroom and share a unique access code with students
2. **Students** create high school drama student characters with names, personalities, backstories, and photos
3. **Everyone** participates in a forum discussion answering "How do you know Hayden?"
4. **Collectively** the class discovers who Hayden is, what award they received, and why this documentary is being made

## Features

### For Teachers
- Create a classroom with a unique 6-character access code
- Manage multiple class sections
- View all student characters and their contributions
- Extend the activity into a virtual or in-person production

### For Students
- Create an original character (name, personality, backstory, photo)
- Post unlimited responses to "How do you know Hayden?"
- Include various media types: text, images, videos, audio, art
- Comment and respond to classmates' posts
- View all characters in the drama class

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use

### For Teachers

1. Visit the website and select "Create a Classroom"
2. Enter your name and class/room name
3. Click "Create Room"
4. Share the 6-character code with your students (e.g., `4Z3PJ0`)

### For Students

1. Visit the website and enter the teacher's code
2. Create your character:
   - **Name**: Your character's name
   - **Personality**: Traits like "shy, ambitious, funny"
   - **Backstory**: Family, interests, relationship with drama class
   - **Photo**: URL to a character image (optional)
3. Start posting on the forum!

### Posting on the Forum

- Answer "How do you know Hayden?" with detailed stories
- Share memories, experiences, and observations
- Include media: photos, videos, audio recordings, artwork
- Comment on and respond to other students' posts
- Through these stories, collectively discover:
  - What award did Hayden receive?
  - Why is this documentary being made?
  - Who is Hayden really?

## Technical Details

### Architecture
- **Backend**: Node.js with Express
- **Real-time**: Socket.IO for live updates
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: In-memory (for demonstration; use a database for production)

### API Endpoints

- `POST /api/rooms` - Create a new classroom
- `POST /api/join` - Join a classroom with teacher code
- `GET /api/rooms/:roomId` - Get room data
- `POST /api/rooms/:roomId/characters` - Create a character
- `POST /api/rooms/:roomId/posts` - Create a forum post
- `POST /api/rooms/:roomId/posts/:postId/comments` - Add a comment

### File Structure

```
/workspace
├── server.js           # Express server and API
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
└── README.md           # This file
```

## Educational Applications

This platform supports:

- **Creative Writing**: Students develop characters and narratives
- **Collaborative Storytelling**: Building a shared mystery together
- **Digital Literacy**: Using online forums and media sharing
- **Drama & Theater**: Character development and improvisation
- **Critical Thinking**: Piecing together clues about Hayden

## Extension Activities

After the forum activity, teachers can:

1. **Script Writing**: Turn forum posts into a screenplay
2. **Performance**: Act out the stories as a class production
3. **Video Production**: Create the actual documentary about Hayden
4. **Character Analysis**: Deep-dive into character motivations
5. **Discussion**: Explore themes of identity, memory, and perspective

## Notes

- This is a demonstration using in-memory storage
- For production use, implement a database (MongoDB, PostgreSQL, etc.)
- Add user authentication for persistent accounts
- Implement file upload for media instead of URLs
- Add moderation tools for classroom management

## License

ISC

## Support

For questions or issues, please open an issue in the repository.

---

**Happy storytelling! 🎭✨**
