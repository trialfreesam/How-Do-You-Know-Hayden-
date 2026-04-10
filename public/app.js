// State management
let currentRoomId = null;
let currentCharacterId = null;
let socket = null;

// Show/hide sections
function showSection(sectionId) {
  document.querySelectorAll('main section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
  
  // Show nav only after character creation
  if (currentCharacterId) {
    document.getElementById('nav').style.display = 'flex';
  }
  
  // Load data for specific sections
  if (sectionId === 'forum') {
    loadPosts();
  } else if (sectionId === 'characters') {
    loadCharacters();
  }
}

// Teacher creates room
document.getElementById('create-room-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const teacherName = document.getElementById('teacher-name').value;
  const roomName = document.getElementById('room-name').value;
  
  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherName, roomName })
    });
    
    const data = await response.json();
    
    document.getElementById('teacher-code').textContent = data.teacherCode;
    document.getElementById('create-room-form').style.display = 'none';
    document.getElementById('room-created').style.display = 'block';
    
    currentRoomId = data.roomId;
  } catch (error) {
    alert('Error creating room. Please try again.');
    console.error(error);
  }
});

// Student joins room
document.getElementById('join-room-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const teacherCode = document.getElementById('teacher-code-input').value.toUpperCase();
  
  try {
    const response = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherCode })
    });
    
    if (!response.ok) {
      throw new Error('Invalid room code');
    }
    
    const data = await response.json();
    currentRoomId = data.roomId;
    
    // Check if user already has a character in this room
    const existingCharacterId = localStorage.getItem(`character_${currentRoomId}`);
    
    if (existingCharacterId) {
      currentCharacterId = existingCharacterId;
      const roomResponse = await fetch(`/api/rooms/${currentRoomId}`);
      const roomData = await roomResponse.json();
      
      if (roomData.characters[existingCharacterId]) {
        document.getElementById('currentCharacter').textContent = `Playing as: ${roomData.characters[existingCharacterId].name}`;
        showSection('forum');
        return;
      }
    }
    
    showSection('character-creation');
  } catch (error) {
    alert('Invalid room code. Please check and try again.');
    console.error(error);
  }
});

// Character creation
document.getElementById('character-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('char-name').value;
  const personality = document.getElementById('char-personality').value;
  const backstory = document.getElementById('char-backstory').value;
  const photoUrl = document.getElementById('char-photo').value || 'https://via.placeholder.com/150?text=Character';
  
  try {
    const response = await fetch(`/api/rooms/${currentRoomId}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, personality, backstory, photoUrl })
    });
    
    const character = await response.json();
    currentCharacterId = character.id;
    
    // Save to localStorage for persistence
    localStorage.setItem(`character_${currentRoomId}`, character.id);
    
    document.getElementById('currentCharacter').textContent = `Playing as: ${character.name}`;
    
    // Connect to socket
    socket = io();
    socket.emit('join-room', currentRoomId);
    
    showSection('forum');
  } catch (error) {
    alert('Error creating character. Please try again.');
    console.error(error);
  }
});

// Load characters
async function loadCharacters() {
  try {
    const response = await fetch(`/api/rooms/${currentRoomId}`);
    const room = await response.json();
    
    const grid = document.getElementById('characters-grid');
    const characters = Object.values(room.characters);
    
    if (characters.length === 0) {
      grid.innerHTML = '<p class="no-posts">No characters created yet.</p>';
      return;
    }
    
    grid.innerHTML = characters.map(char => `
      <div class="character-card">
        <img src="${char.photoUrl}" alt="${char.name}" class="character-photo" onerror="this.src='https://via.placeholder.com/150?text=${char.name}'">
        <h3 class="character-name">${char.name}</h3>
        <div class="character-traits">
          ${char.personality.split(',').map(trait => `<span class="character-trait">${trait.trim()}</span>`).join('')}
        </div>
        <p class="character-backstory">${char.backstory}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading characters:', error);
  }
}

// Load posts
async function loadPosts() {
  try {
    const response = await fetch(`/api/rooms/${currentRoomId}`);
    const room = await response.json();
    
    const container = document.getElementById('posts-container');
    const posts = room.posts || [];
    
    if (posts.length === 0) {
      container.innerHTML = '<p class="no-posts">No posts yet. Be the first to share your story about Hayden!</p>';
      return;
    }
    
    // Sort by newest first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = posts.map(post => {
      const character = room.characters[post.characterId];
      const charName = character ? character.name : 'Unknown';
      const charPhoto = character ? character.photoUrl : 'https://via.placeholder.com/50';
      
      let mediaHtml = '';
      if (post.mediaType === 'image' && post.mediaUrl) {
        mediaHtml = `<img src="${post.mediaUrl}" alt="Post image" class="post-media">`;
      } else if (post.mediaType === 'video' && post.mediaUrl) {
        mediaHtml = `<video controls class="post-media"><source src="${post.mediaUrl}"></video>`;
      } else if (post.mediaType === 'audio' && post.mediaUrl) {
        mediaHtml = `<audio controls class="post-media"><source src="${post.mediaUrl}"></audio>`;
      } else if (post.mediaType === 'art' && post.mediaUrl) {
        mediaHtml = `<img src="${post.mediaUrl}" alt="Art piece" class="post-media">`;
      }
      
      const comments = room.comments[post.id] || [];
      
      return `
        <div class="post">
          <div class="post-header">
            <img src="${charPhoto}" alt="${charName}" class="post-character-photo" onerror="this.src='https://via.placeholder.com/50'">
            <span class="post-character-name">${charName}</span>
          </div>
          <div class="post-content">${post.content}</div>
          ${mediaHtml}
          <div class="post-meta">Posted on ${new Date(post.createdAt).toLocaleDateString()}</div>
          
          <div class="comments-section">
            <h4>Comments (${comments.length})</h4>
            ${comments.map(comment => {
              const commentChar = room.characters[comment.characterId];
              const commentCharName = commentChar ? commentChar.name : 'Unknown';
              return `
                <div class="comment">
                  <strong>${commentCharName}:</strong> ${comment.content}
                </div>
              `;
            }).join('')}
            
            <form class="comment-form" onsubmit="addComment(event, '${post.id}')">
              <input type="text" placeholder="Add a comment..." required>
              <button type="submit">Comment</button>
            </form>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

// Create post
document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('post-content').value;
  const mediaType = document.getElementById('media-type').value;
  const mediaUrl = document.getElementById('media-url').value;
  
  try {
    const response = await fetch(`/api/rooms/${currentRoomId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        characterId: currentCharacterId, 
        content, 
        mediaType, 
        mediaUrl 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    
    // Clear form and reload posts
    document.getElementById('post-form').reset();
    loadPosts();
  } catch (error) {
    alert('Error creating post. Please try again.');
    console.error(error);
  }
});

// Add comment
async function addComment(e, postId) {
  e.preventDefault();
  
  const form = e.target;
  const input = form.querySelector('input');
  const content = input.value;
  
  try {
    const response = await fetch(`/api/rooms/${currentRoomId}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        characterId: currentCharacterId, 
        content 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
    
    input.value = '';
    loadPosts();
  } catch (error) {
    alert('Error adding comment. Please try again.');
    console.error(error);
  }
}

// Socket event listeners
if (socket) {
  socket.on('post-created', () => {
    loadPosts();
  });
  
  socket.on('comment-added', () => {
    loadPosts();
  });
  
  socket.on('character-created', () => {
    loadCharacters();
  });
}

// Initialize
showSection('teacher-create');
