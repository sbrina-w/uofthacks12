import os
from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage
from openai import OpenAI as OpenAIClient
from collections import deque
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

class Chatbot:
    def __init__(self):
        print("\n🤖 Initializing chatbot...")
        self.client = OpenAIClient(api_key=os.getenv('OPENAI_API_KEY'))
        self.previous_responses = deque(maxlen=10)
        self.current_tasks = []
        self.task_index = 0
        self.current_user = "the user"
        print("✅ Chatbot initialized successfully")

    def get_context_prompt(self):
        """Create a context prompt from previous responses and current task"""
        print("\n📝 Creating context prompt...")
        task_context = f"{self.current_user} should be working on: {self.current_tasks[self.task_index] if self.current_tasks else 'No task set'}"
        if not self.previous_responses:
            print("➡️ First observation, no previous context")
            return task_context + "\nThis is your first observation."
        
        context = f"{task_context}\n\nYour previous observations were:\n"
        for i, response in enumerate(self.previous_responses, 1):
            context += f"{i}. {response}\n"
        print("✅ Context prompt created")
        return context

    def analyze_with_context(self, message, screenshot_base64=None):
      """Analyze user behavior with message context and optional screenshot"""
      try:
          context_prompt = self.get_context_prompt()
          context_prompt += f"\n\nNew event: {message}"
          
          messages = [
              {
                  "role": "system",
                  "content": f"""You are a snarky British narrator inspired by 'The Stanley Parable', speaking in concise, one-sentence responses.

Key Personality Traits:
- Dry, sophisticated British tone
- Subtle condescension and wit
- Ironic warmth that masks judgment
- No sentences start with 'Ah'
- Sharp observational humor
- Brevity is essential - never more than one sentence
- Always refer to the user in third person as "{self.current_user}"

Your characteristics:
- When {self.current_user} is focused on their task: become quietly approving, subtle encouragement
- When {self.current_user} is distracted or off-task: unleash witty, entertainingly condescending commentary
- Maintain continuity with your previous observations
"""
              },
              {
                  "role": "user",
                  "content": [
                      {
                          "type": "text",
                          "text": f"{context_prompt}\n\nExamine this new image and event - what is {self.current_user} doing and how does it relate to what they're supposed to be doing?"
                      },
                      {
                          "type": "image_url",
                          "image_url": {
                              "url": f"data:image/jpeg;base64,{screenshot_base64}"
                          }
                      } if screenshot_base64 else None
                  ]
              }
          ]
          
          messages[1]["content"] = [item for item in messages[1]["content"] if item is not None]
          
          response = self.client.chat.completions.create(
              model="gpt-4o",
              messages=messages,
              max_tokens=100
          )
          
          analysis = response.choices[0].message.content
          self.previous_responses.append(analysis)
          return analysis

      except Exception as e:
          print(f"\n❌ GPT-4o Error: {str(e)}")
          return f"Analysis failed: {str(e)}"

    def chat(self, user_input):
        """Basic chat functionality using LlamaIndex"""
        print(f"\n💭 Processing chat input: {user_input}")
        messages = [
            ChatMessage(
                role="system",
                content="You are a helpful AI assistant."
            ),
            ChatMessage(role="user", content=user_input)
        ]
        response = self.llm.chat(messages)
        print(f"✅ Chat response generated")
        return str(response).replace('assistant:', '').strip()

    def update_user(self, username):
        """Update current user name"""
        print(f"\n👤 Updating user to: {username}")
        self.current_user = username

    def update_tasks(self, tasks):
        """Update task list and reset index"""
        print(f"\n📋 Updating tasks to: {tasks}")
        self.current_tasks = tasks
        self.task_index = 0
        self.previous_responses.clear()
        print("✅ Tasks updated and responses cleared")

if __name__ == "__main__":
    chatbot = Chatbot()
    print("Chatbot initialized! Type 'quit' to exit.")
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == 'quit':
            print("Goodbye!")
            break
        try:
            response = chatbot.chat(user_input)
            print(f"\nChatbot: {response}")
        except Exception as e:
            print(f"\nError: {str(e)}")