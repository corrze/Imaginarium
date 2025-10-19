from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from google import genai
from google.genai import types
import json
import os
import stripe
from PIL import Image

app = Flask(__name__, template_folder='public/templates')
CORS(app)  # Enable CORS for frontend communication

# Configure Stripe (test mode)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_51234567890abcdefghijklmnopqrstuvwxyz')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz')

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
    image_client = None
else:
    # Initialize Gemini client for both text and images
    client = genai.Client(api_key=api_key)
    image_client = client  # Same client can do both!
    print("✅ Google Gemini client initialized successfully")

# --- Smoke test ---
if client:
    try:
        resp = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents='Say hello!'
        )
        print("✅ Text model test successful:", resp.text)
    except Exception as e:
        print(f"[Error] Text model failed: {e}")
        client = None
        image_client = None

@app.route('/<path:filename>')
def serve_html(filename):
    if filename.endswith('.html'):
        return send_from_directory('public', filename)
    return "Not found", 404
@app.route('/')
def serve_index():
    """Serve the main HTML file"""
    return send_from_directory('public', 'index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS)"""
    print(f"Requested static file: {filename}")
    try:
        return send_from_directory('public/static', filename)
    except Exception as e:
        print(f"Error serving static file {filename}: {e}")
        return f"Error: {e}", 404

@app.route('/static/css/<filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory('public/static/css', filename)

@app.route('/static/js/<filename>')
def serve_js(filename):
    """Serve JS files"""
    return send_from_directory('public/static/js', filename)

@app.route('/static/css/pages/<filename>')
def serve_css_pages(filename):
    """Serve CSS page files"""
    return send_from_directory('public/static/css/pages', filename)

@app.route('/static/js/pages/<filename>')
def serve_js_pages(filename):
    """Serve JS page files"""
    return send_from_directory('public/static/js/pages', filename)

@app.route('/static/images/<filename>')
def serve_images(filename):
    """Serve generated images"""
    return send_from_directory('public/static/images', filename)

@app.route('/firebase-config.js')
def serve_firebase_config():
    """Serve Firebase configuration"""
    return send_from_directory('public', 'firebase-config.js')

@app.route('/test-static')
def test_static():
    """Test static file serving"""
    try:
        return send_from_directory('public/static', 'css/base.css')
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
        previous_story = data.get('previousStory', '')  # Track story history
        
        if not story_idea:
            return jsonify({'error': 'Story idea is required'}), 400
        
        # Generate story content using Google AI
        if client:
            if page_number == 1:
                prompt = f"""Create the beginning of a children's story (ages 6-12) based on this idea: "{story_idea}". 
                Write 2-3 sentences that introduce the main character and setting. 
                Make it engaging, age-appropriate, and visually descriptive.
                Include vivid details about colors, characters, and the environment."""
            else:
                prompt = f"""Continue this children's story:
                
Previous story: {previous_story}

User's choice: "{user_response}"

Write 2-3 sentences that continue the adventure based on their choice. 
Make it engaging, age-appropriate for ages 6-12, and visually descriptive.
Include vivid details about what's happening."""
            
            response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
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


def create_child_friendly_image_prompt(story_text):
    """
    Convert story text into a child-friendly image generation prompt.
    This ensures images are appropriate, colorful, and engaging.
    """
    if client:
        try:
            prompt = f"""Based on this children's story text, create a detailed image description 
            suitable for generating a children's book illustration:
            
            Story: {story_text}
            
            Create a description that:
            - Is colorful and vibrant
            - Is appropriate for children ages 6-12
            - Focuses on the main scene/character
            - Uses a cartoon or storybook illustration style
            - Is positive and non-scary
            
            Provide only the image description, no extra text."""
            
            response = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
            image_prompt = response.text.strip()
            
            # Add style modifiers for consistency
            image_prompt = f"{image_prompt}, children's book illustration style, colorful, vibrant, friendly, cartoon style, whimsical"
            
            return image_prompt
        except Exception as e:
            print(f"Error creating image prompt: {e}")
            return f"A colorful children's book illustration of: {story_text[:100]}, cartoon style, vibrant colors"
    else:
        return f"A colorful children's book illustration of: {story_text[:100]}, cartoon style, vibrant colors"


@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """
    Generate an image for the story page using Gemini Imagen.
    """
    try:
        data = request.get_json()
        story_text = data.get('storyText', '')
        page_number = data.get('pageNumber', 1)
        
        if not story_text:
            return jsonify({'error': 'Story text is required'}), 400
        
        # Create a child-friendly image prompt
        image_prompt = create_child_friendly_image_prompt(story_text)
        print(f"Image prompt: {image_prompt}")
        
        # Try Gemini Imagen
        try:
            image_url = generate_with_gemini_imagen(image_prompt, page_number)
            if image_url:
                return jsonify({
                    'success': True,
                    'imageUrl': image_url,
                    'method': 'gemini-imagen',
                    'prompt': image_prompt
                })
        except Exception as e:
            print(f"Gemini Imagen failed: {e}")
            import traceback
            traceback.print_exc()
        
        # Fallback to placeholder
        colors = ['6c5ce7', '74b9ff', 'fd79a8', 'fdcb6e', '00b894', 'e17055']
        color = colors[page_number % len(colors)]
        image_url = f"https://via.placeholder.com/800x600/{color}/ffffff?text=Story+Page+{page_number}"
        
        return jsonify({
            'success': True,
            'imageUrl': image_url,
            'method': 'placeholder',
            'message': 'Imagen unavailable - using placeholder. Check API key and quota.'
        })
        
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return jsonify({'error': 'Failed to generate image'}), 500
    
def generate_with_gemini_imagen(prompt, page_number):
    """Generate image using Gemini's Imagen API"""
    try:
        if not image_client:
            raise Exception("Image client not initialized")
        
        print(f"Generating image with Imagen for page {page_number}...")
        
        response = image_client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                safety_filter_level='block_low_and_above',
                person_generation='allow_adult',
                aspect_ratio='16:9',
            )
        )
        
        if response.generated_images and len(response.generated_images) > 0:
            generated_image = response.generated_images[0]
            
            if hasattr(generated_image, 'blocked_reason') and generated_image.blocked_reason:
                print(f"⚠️ Image blocked: {generated_image.blocked_reason}")
                return None
            
            filename = f"story_page_{page_number}_{hash(prompt) % 100000}.png"
            filepath = os.path.join('public', 'static', 'images', filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            if hasattr(generated_image.image, 'save'):
                generated_image.image.save(filepath)
            else:
                if hasattr(generated_image, 'image_bytes'):
                    with open(filepath, 'wb') as f:
                        f.write(generated_image.image_bytes)
            
            print(f"✅ Image saved to {filepath}")
            return f"/static/images/{filename}"
        
        print("⚠️ No images generated")
        return None
        
    except Exception as e:
        print(f"Gemini Imagen error: {e}")
        import traceback
        traceback.print_exc()
        return None

# --- Stripe Payment Routes ---

@app.route('/pro')
def pro_paywall():
    """Serve the Pro paywall page"""
    return render_template('pro.html')

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Create a Stripe checkout session"""
    try:
        data = request.get_json()
        price_id = data.get('priceId', 'price_pro_monthly')
        success_url = data.get('successUrl', f"{request.url_root}success")
        cancel_url = data.get('cancelUrl', f"{request.url_root}pro")
        
        # Check if Stripe is properly configured
        if not stripe.api_key or stripe.api_key.startswith('sk_test_placeholder'):
            # Mock checkout session for demo purposes
            print("Using mock checkout session (Stripe not configured)")
            return jsonify({
                'url': success_url + '?mock=true',
                'mock': True
            })
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'product': 'storyboard_pro',
                'feature': 'monthly_subscription'
            }
        )
        
        return jsonify({'url': checkout_session.url})
        
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        # Fallback to mock success for demo
        return jsonify({
            'url': f"{request.url_root}success?mock=true",
            'mock': True
        })

@app.route('/success')
def payment_success():
    """Handle successful payment"""
    mock = request.args.get('mock', False)
    if mock:
        print("Mock payment successful - redirecting to success page")
    return render_template('implemented.html')

@app.route('/cancel')
def payment_cancel():
    """Handle cancelled payment"""
    return render_template('pro.html')

if __name__ == '__main__':
    # Create images directory if it doesn't exist
    os.makedirs('public/static/images', exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)