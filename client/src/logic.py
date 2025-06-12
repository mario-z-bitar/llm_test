from google import genai
import os
from dotenv import load_dotenv # Import load_dotenv
from google import genai

# Load environment variables from .env file
load_dotenv()

# Get the API key from the environment variable
API_KEY = os.getenv("GEMINI_API_KEY")

# Check if the API key was loaded
if API_KEY is None:
    raise ValueError("GEMINI_API_KEY not found in .env file or environment variables.")


client = genai.Client(api_key=API_KEY)

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Who is Mario Zaid Bitar?"
)
print(response.text)