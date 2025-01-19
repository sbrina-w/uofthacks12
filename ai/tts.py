import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get OpenAI API key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def speak_text(text, mood="normal"):
    """
    Convert text to speech using OpenAI TTS API and save to file.
    Returns the filename if successful.
    """
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # OpenAI TTS request
        response = client.audio.speech.create(
            model="tts-1",
            voice="onyx",
            input=text
        )
        
        # Create public directory in root if it doesn't exist
        root_dir = Path(__file__).parent.parent  # Go up one level from ai directory
        public_dir = root_dir / "public"
        public_dir.mkdir(exist_ok=True)
        
        # Save to root's public directory
        speech_file_path = public_dir / "speech.mp3"
        
        # Write response to file
        response.stream_to_file(str(speech_file_path))
        print(f"Audio file saved to: {speech_file_path.absolute()}")
            
        return True
        
    except Exception as e:
        print(f"Error generating speech: {str(e)}")
        return False

if __name__ == "__main__":
    # Test the voice
    test_text = "This is a test of the text-to-speech system."
    print("\nTesting voice generation...")
    result = speak_text(test_text)
    if result:
        print("Test successful - check the public/speech.mp3 file")
    else:
        print("Test failed")