from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# --- Load .env if present ---
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Warning: Missing GOOGLE_API_KEY env var. Using mock data.")
    client = None
else:
    genai.configure(api_key=api_key)
    client = genai.GenerativeModel('gemini-2.5-flash')
    print("✅ Google AI client initialized successfully")

# --- Smoke test (text model works without quota issues) ---
if client:
    try:
        resp = client.generate_content("Say hello!")
        print("✅ Text model test successful:", resp.text)
    except Exception as e:
        print(f"[Error] Text model failed: {e}")
        client = None

@app.route('/')
def serve_index():
    """Serve the main HTML file"""
    return send_from_directory('src', 'index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS)"""
    print(f"Requested static file: {filename}")
    try:
        return send_from_directory('src/static', filename)
    except Exception as e:
        print(f"Error serving static file {filename}: {e}")
        return f"Error: {e}", 404

# Alternative route for static files
@app.route('/static/css/<filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory('src/static/css', filename)

@app.route('/static/js/<filename>')
def serve_js(filename):
    """Serve JS files"""
    return send_from_directory('src/static/js', filename)

@app.route('/static/css/pages/<filename>')
def serve_css_pages(filename):
    """Serve CSS page files"""
    return send_from_directory('src/static/css/pages', filename)

@app.route('/static/js/pages/<filename>')
def serve_js_pages(filename):
    """Serve JS page files"""
    return send_from_directory('src/static/js/pages', filename)

@app.route('/test-static')
def test_static():
    """Test static file serving"""
    try:
        return send_from_directory('src/static', 'css/base.css')
    except Exception as e:
        return f"Error: {e}", 404

@app.route('/api/generate-story', methods=['POST'])
def generate_story():
    """Generate a new story page based on user input"""
    try:
        data = request.get_json()
        story_idea = data.get('storyIdea', '')
        user_response = data.get('userResponse', None)
        page_number = data.get('pageNumber', 1)
        
        if not story_idea:
            return jsonify({'error': 'Story idea is required'}), 400
        
        # Generate story content using Google AI
        if client:
            if page_number == 1:
                prompt = f"""Create the beginning of a children's story (ages 6-12) based on this idea: "{story_idea}". 
                Write 2-3 sentences that introduce the main character and setting. Make it engaging and age-appropriate."""
            else:
                prompt = f"""Continue this children's story based on the user's response: "{user_response}". 
                Write 2-3 sentences that advance the plot. Make it engaging and age-appropriate for ages 6-12."""
            
            response = client.generate_content(prompt)
            story_text = response.text.strip()
        else:
            # Fallback to mock data
            if page_number == 1:
                story_text = f"Once upon a time, in a magical world filled with wonder, there was a brave adventurer who discovered something amazing: \"{story_idea}\". The journey was about to begin, and every choice would shape the destiny of this incredible tale."
            else:
                responses = [
                    'The brave adventurer decided to explore the mysterious path ahead.',
                    'A wise old wizard appeared with an important message.',
                    'The adventurer discovered a hidden treasure chest.',
                    'A friendly dragon offered to help on the journey.',
                    'The path led to a magical forest filled with talking animals.'
                ]
                random_response = responses[page_number % len(responses)]
                story_text = f"Following the previous adventure, {random_response} This opened up new possibilities and exciting challenges ahead."
        
        # Generate a prompt for the next user input
        next_prompt = "What happens next in your adventure? Choose something exciting!"
        
        return jsonify({
            'success': True,
            'storyText': story_text,
            'promptText': next_prompt,
            'pageNumber': page_number
        })
        
    except Exception as e:
        print(f"Error generating story: {str(e)}")
        return jsonify({'error': 'Failed to generate story'}), 500

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """Generate an image for the story page"""
    try:
        data = request.get_json()
        story_text = data.get('storyText', '')
        page_number = data.get('pageNumber', 1)
        
        # For now, return a placeholder image URL
        # In a real implementation, you would generate an actual image
        colors = ['6c5ce7', '74b9ff', 'fd79a8', 'fdcb6e', '00b894', 'e17055']
        color = colors[page_number % len(colors)]
        
        image_url = f"https://via.placeholder.com/400x300/{color}/ffffff?text=Story+Page+{page_number}"
        
        return jsonify({
            'success': True,
            'imageUrl': image_url
        })
        
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return jsonify({'error': 'Failed to generate image'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)