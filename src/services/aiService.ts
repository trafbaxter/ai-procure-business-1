// AI Service for connecting to OpenAI API

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class AIService {
  private getApiKey(): string | null {
    return localStorage.getItem('openai_api_key');
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { 
        success: false, 
        error: 'OpenAI API key not configured. Please add your API key in Settings.' 
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant specializing in procurement and supply chain management. Provide concise, actionable advice on suppliers, costs, orders, contracts, inventory, and reporting.'
            },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          error: error.error?.message || 'Failed to get AI response' 
        };
      }

      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content;

      if (!aiMessage) {
        return { 
          success: false, 
          error: 'No response from AI' 
        };
      }

      return { 
        success: true, 
        message: aiMessage 
      };

    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      };
    }
  }

  setApiKey(apiKey: string): void {
    localStorage.setItem('openai_api_key', apiKey);
  }

  removeApiKey(): void {
    localStorage.removeItem('openai_api_key');
  }

  hasApiKey(): boolean {
    return !!this.getApiKey();
  }
}

export const aiService = new AIService();
export default aiService;
export type { AIMessage, AIResponse };