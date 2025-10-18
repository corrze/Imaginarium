from google import genai
from google.genai import types
from google.genai.errors import ClientError
from PIL import Image
from io import BytesIO
import os

# --- Load .env if present ---
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("Missing GOOGLE_API_KEY env var")

client = genai.Client(api_key=api_key)

# --- Smoke test (text model works without quota issues) ---
try:
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say hello!"
    )
    print(resp.text)
except ClientError as e:
    print(f"[Error] Text model failed: {e}")
    exit(1)

# --- Attempt image generation with graceful fallback ---
from google.genai.errors import ClientError

prompt = (
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme"
)

try:
    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[prompt],
    )

    image_saved = False
    for cand in response.candidates:
        for part in cand.content.parts:
            if getattr(part, "text", None):
                print(part.text)
            elif getattr(part, "inline_data", None) and getattr(part.inline_data, "data", None):
                image = Image.open(BytesIO(part.inline_data.data))
                image.save("generated_image.png")
                print("✅ Image saved as generated_image.png")
                image_saved = True
                break
        if image_saved:
            break

    if not image_saved:
        print("⚠️ No image data returned by the model.")

except ClientError as e:
    # safer attribute access
    code = getattr(e, "code", None) or getattr(e, "status_code", None)
    if code == 429 or "RESOURCE_EXHAUSTED" in str(e):
        print("⚠️ Image generation quota exceeded (free tier has 0 quota for images).")
        print("   → Enable billing in Google AI Studio or use Vertex AI for images.")
    elif code == 403 or "PERMISSION_DENIED" in str(e):
        print("🚫 Access denied. Check that your API key has the Gemini API enabled.")
    else:
        print(f"❌ Unexpected error: {e}")
except Exception as e:
    print(f"❌ Unknown error: {e}")

