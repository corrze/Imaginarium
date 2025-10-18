# Imaginarium - Choose Your Own Adventure Story Generator

**Imaginarium** is a magical web app that creates interactive, choose-your-own-adventure stories for children ages 6-12. Simply input your story idea, and watch as your imagination comes to life with dynamic pages, beautiful illustrations, and endless possibilities!

## Features

- **Dynamic Story Generation**: Create unlimited story pages based on user input
- **Beautiful UI**: Warm, playful design with smooth animations
- **Kid-Friendly Interface**: Large buttons, bright colors, and intuitive navigation
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **AI-Powered**: Uses Google's Gemini AI for intelligent story generation
- **Navigation Controls**: Back, Next, and Restart Story buttons
- **Real-time Generation**: Each user response creates a new story page

## Quick Start

### Prerequisites
- Python 3.7 or higher
- Google AI API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DreamBuilder
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Google AI API**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set the environment variable:
     ```bash
     export GOOGLE_API_KEY="your-api-key-here"
     ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000` and start creating stories!

## How to Use

1. **Start Your Story**: Enter your story idea in the text area (e.g., "a brave knight", "a magical forest", "a space adventure")

2. **Create My Story**: Click the button to generate your first story page

3. **Continue the Adventure**: Each page will ask "What happens next?" - type your response and click "Continue Story"

4. **Navigate**: Use the Back/Next buttons to move through your story, or Restart Story to begin fresh

5. **Enjoy**: Watch as your story unfolds with beautiful illustrations and engaging text!

## Architecture

### Frontend (Modular Structure)
- **`index.html`**: Main HTML structure with all screens
- **`static/css/`**: Modular CSS architecture
  - `base.css`: Base styles, typography, buttons, animations
  - `layout.css`: Layout and screen management
  - `pages/intro.css`: Introduction page styles
  - `pages/story.css`: Story page styles  
  - `pages/conclusion.css`: Conclusion page styles
- **`static/js/`**: Modular JavaScript architecture
  - `main.js`: Main application controller
  - `ui.js`: UI rendering and DOM updates
  - `storyManager.js`: Story management with MAX_PAGES = 5
  - `pages/introPage.js`: Introduction page functionality
  - `pages/storyPage.js`: Story page functionality
  - `pages/conclusionPage.js`: Conclusion page functionality

### Backend (`app.py`)
- **Flask Server**: Serves static files and handles API requests
- **Story Generation**: Uses Google Gemini AI to create age-appropriate story content
- **Image Generation**: Placeholder system for story illustrations
- **CORS Enabled**: Allows frontend-backend communication

## Design Philosophy

The interface embodies the theme: **"Powerful solutions bring us closer and help us thrive"**

- **Human-Centered**: Intuitive, accessible design for children
- **Imaginative**: Creative visual elements and smooth animations
- **Warm**: Bright, inviting colors and friendly typography
- **Inspiring**: Encourages creativity, exploration, and belonging

## API Endpoints

- `GET /` - Serves the main application
- `POST /api/generate-story` - Generates story content based on user input
- `POST /api/generate-image` - Generates placeholder images for story pages

## Customization

### Adding Real Image Generation
Replace the placeholder image system in `app.py` with your preferred image generation service:

```python
# In generate_image() function
# Replace placeholder with actual image generation API call
```

### Styling Customization
Modify `src/style.css` to change colors, fonts, or animations:

```css
/* Change primary colors */
.app-title { color: #your-color; }
.primary-button { background: linear-gradient(135deg, #color1, #color2); }
```

### Story Prompts
Customize story generation prompts in `app.py`:

```python
# Modify the prompt templates for different story styles
prompt = f"""Your custom prompt here..."""
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Future Enhancements

- Real AI-generated illustrations
- Story sharing and saving
- Multiple story themes
- Voice narration
- Character customization
- Story templates

---

**Built with love for young storytellers everywhere!**