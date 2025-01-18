import os
from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage
from tts import speak_text

# Load environment variables
load_dotenv()

def create_chatbot():
    # Initialize OpenAI LLM
    llm = OpenAI(
        model="gpt-3.5-turbo",  
    )
    
    # System message to set the chatbot's personality
    system_message = ChatMessage(
        role="system",
        content="you narrate in Stanley parable style. your responses are incredibly witty and condescending, but concise and 2 sentences max. "
    )
    
    print("Chatbot initialized! Type 'quit' to exit.")
    
    while True:
        # Get user input
        user_input = input("\nYou: ")
        
        # Check for exit condition
        if user_input.lower() == 'quit':
            print("Goodbye!")
            speak_text("Goodbye!")
            break
        
        try:
            # Create message list for each interaction
            messages = [
                system_message,
                ChatMessage(role="user", content=user_input)
            ]
            
            # Get response using chat method
            response = llm.chat(messages)
            # Remove 'assistant: ' prefix from the response
            clean_response = str(response).replace('assistant:', '').strip()
            
            # Print and speak the response
            print(f"\nChatbot: {clean_response}")
            speak_text(clean_response)
            
        except Exception as e:
            print(f"\nError: {str(e)}")

if __name__ == "__main__":
    create_chatbot()