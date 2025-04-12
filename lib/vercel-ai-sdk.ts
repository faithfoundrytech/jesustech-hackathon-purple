import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { logger } from '@/utils/logger'
import Product from '@/models/Product'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIConfig {
  temperature?: number
  maxTokens?: number
  model?: string
}

export class VercelAIClient {
  private static instance: VercelAIClient
  private baseSystemPrompt: string = `You are a helpful AI assistant for a product recommendation system. Your role is to help users find products that best match their needs from our available product catalog.
Start by briefly acknowledging the user's query. Then return a clear, well-formatted response based on the available product list below.

Available Products:
{{PRODUCTS}}

Guidelines:
1. Analyze the user's query to understand their specific needs and requirements
2. Match their needs with relevant products from our catalog
3. If no products match their needs exactly:
   - Suggest the closest alternatives if any exist
   - Guide them to the feedback section to describe their needs
4. Be honest and transparent about product capabilities and limitations
5. Format responses clearly with:
   - Product names in **bold**
   - Key features in bullet points
   - Clear explanations of why each product might be suitable

Formatting Rules:
- **Bold** all product names.
- Use bullet points for key features.
- Keep your tone clear, concise, and supportive.

Response Format:
# Product Recommendations

## Best Matches
- **[Product Name]**
- * Key features and benefits
- * Why these products are recommended

## Alternative Options (if applicable)
- **[Alternative Name]**
  - Partial match explanation
  - How it differs from the ideal matches

## No Matches Found (if applicable)
- Brief explanation of why no products match
- Suggestion to use the feedback section for more specific ends
- Invite the user to share more specific needs in the feedback section`


  private openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || '',
  })

  private constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      logger.error('VercelAIClient', 'OpenRouter API key is not set')
      throw new Error('OpenRouter API key is not set')
    }
    logger.info('VercelAIClient', 'Initialized with OpenRouter configuration')
  }

  public static getInstance(): VercelAIClient {
    if (!VercelAIClient.instance) {
      logger.info('VercelAIClient', 'Creating new instance')
      VercelAIClient.instance = new VercelAIClient()
    }
    return VercelAIClient.instance
  }

  private async buildSystemPrompt(): Promise<string> {
    try {
      // Fetch all products from the database
      const products = await Product.find().lean()

      // Format products for the system prompt
      const formattedProducts = products
        .map(
          (product) => `
Name: ${product.name}
Country: ${product.country}
Categories: ${product.category.join(', ')}
Description: ${product.description}
Website: ${product.website}
`
        )
        .join('\n')

      // Replace the placeholder in the base prompt
      return this.baseSystemPrompt.replace('{{PRODUCTS}}', formattedProducts)
    } catch (error) {
      logger.error(
        'VercelAIClient.buildSystemPrompt',
        'Error fetching products',
        error
      )
      throw error
    }
  }

  async sendMessage(
    messages: ChatMessage[],
    config?: AIConfig,
    onStream?: (chunk: string) => void
  ): Promise<string> {
    try {
      logger.info('VercelAIClient.sendMessage', 'Starting message processing', {
        messageCount: messages.length,
        model: config?.model,
      })

      // Build system prompt with current products
      const systemPrompt = await this.buildSystemPrompt()

      const allMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages,
      ]

      const temperature = config?.temperature || 0.7
      const maxTokens = config?.maxTokens || 4000
      const model = config?.model || 'openai/chatgpt-4o-latest'

      logger.debug('VercelAIClient.sendMessage', 'Configured AI parameters', {
        temperature,
        maxTokens,
        model,
        totalMessages: allMessages.length,
      })

      const { textStream } = streamText({
        model: this.openrouter.chat(model),
        messages: allMessages,
        temperature,
        maxTokens,
      })

      let fullResponse = ''
      let chunkCount = 0

      for await (const chunk of textStream) {
        fullResponse += chunk
        chunkCount++

        logger.debug('VercelAIClient.sendMessage', 'Received stream chunk', {
          chunkNumber: chunkCount,
          chunkLength: chunk.length,
        })

        if (onStream) {
          onStream(chunk)
        }
      }

      logger.info('VercelAIClient.sendMessage', 'Stream completed', {
        totalChunks: chunkCount,
        responseLength: fullResponse.length,
      })

      return fullResponse
    } catch (error: any) {
      logger.error(
        'VercelAIClient.sendMessage',
        'Error processing message',
        error
      )
      throw error
    }
  }
}

export const vercelAIClient = VercelAIClient.getInstance()
