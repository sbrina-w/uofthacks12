import os
from dotenv import load_dotenv
from openai import OpenAI
from pathlib import Path
import pygame

# Load environment variables
load_dotenv()

def speak_text(text, voice="ash"):
    """
    Convert text to speech using OpenAI's TTS API and play it.
    
    Args:
        text (str): The text to convert to speech
        voice (str): The voice to use (alloy, echo, fable, onyx, nova, or shimmer)
    """
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    
    try:
        # Create speech file
        speech_file_path = Path("speech.mp3")
        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text
        )
        
        # Save the speech file
        response.stream_to_file(speech_file_path)
        
        # Initialize pygame mixer
        pygame.mixer.init()
        
        # Load and play the audio
        pygame.mixer.music.load(str(speech_file_path))
        pygame.mixer.music.play()
        
        # Wait for the audio to finish playing
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
            
        # Clean up
        pygame.mixer.quit()
        
        # Remove the temporary audio file
        speech_file_path.unlink()
        
    except Exception as e:
        print(f"Error in text-to-speech: {str(e)}")

if __name__ == "__main__":
    # Test the function if run directly
    speak_text("Hello! This is a test of the text to speech system.")