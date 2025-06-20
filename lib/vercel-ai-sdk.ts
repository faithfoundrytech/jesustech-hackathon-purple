import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { logger } from '@/utils/logger'
import Product from '@/models/Product'
import Opportunity from '@/models/Opportunity'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIConfig {
  temperature?: number
  maxTokens?: number
  model?: string
  chatType?: 'product' | 'opportunity'
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

  private async buildSystemPrompt(
    chatType: 'product' | 'opportunity' = 'product'
  ): Promise<string> {
    try {
      if (chatType === 'opportunity') {
        // Fetch all opportunities from the database
        const opportunities = await Opportunity.find().lean()

        // Format opportunities for the system prompt
        const formattedOpportunities = opportunities
          .map(
            (opportunity) => `
Name: ${opportunity.name}
Country: ${opportunity.country}
Ministry: ${opportunity.ministry || 'Not specified'}
Categories: ${opportunity.categories.join(', ')}
Description: ${opportunity.description}
Type: ${opportunity.type}
Email: ${opportunity.email}
`
          )
          .join('\n')

        // Use opportunity prompt template
        const opportunityPrompt = `You are a helpful AI assistant for an opportunity discovery system. Your role is to help users find opportunities (problems to solve or jobs available) that best match their interests and skills from our available opportunities catalog.
Start by briefly acknowledging the user's query. Then return a clear, well-formatted response based on the available opportunities list below.

Available Opportunities:
{{DATA}}

Guidelines:
1. Analyze the user's query to understand their specific interests, skills, and requirements
2. Match their profile with relevant opportunities from our catalog
3. If no opportunities match their needs exactly:
   - Suggest the closest alternatives if any exist
   - Guide them to submit their own opportunity or problem
4. Be honest and transparent about opportunity requirements and expectations
5. Format responses clearly with:
   - Opportunity names in **bold**
   - Key details in bullet points
   - Clear explanations of why each opportunity might be suitable

Formatting Rules:
- **Bold** all opportunity names.
- Use bullet points for key features and requirements.
- Keep your tone clear, concise, and supportive.

Response Format:
# Opportunity Recommendations

## Best Matches
- **[Opportunity Name]**
- * Key details and requirements
- * Why these opportunities are recommended

## Alternative Options (if applicable)
- **[Alternative Name]**
  - Partial match explanation
  - How it differs from the ideal matches

## No Matches Found (if applicable)
- Brief explanation of why no opportunities match
- Suggestion to submit their own problem or opportunity
- Invite the user to share more specific requirements`

        return opportunityPrompt.replace('{{DATA}}', formattedOpportunities)
      } else {
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

        // Use product prompt template
        const productPrompt = `You are a helpful AI assistant for a product recommendation system. Your role is to help users find products that best match their needs from our available product catalog.
Start by briefly acknowledging the user's query. Then return a clear, well-formatted response based on the available product list below.

Available Products:
{{DATA}}

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
- Suggestion to use the feedback section for more specific needs
- Invite the user to share more specific needs in the feedback section`

        return productPrompt.replace('{{DATA}}', formattedProducts)
      }
    } catch (error) {
      logger.error('VercelAIClient.buildSystemPrompt', 'Error fetching data', {
        chatType,
        error,
      })
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
        hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      })

      // Build system prompt with current data (products or opportunities)
      const chatType = config?.chatType || 'product'
      const systemPrompt = await this.buildSystemPrompt(chatType)
      logger.debug('VercelAIClient.sendMessage', 'System prompt built', {
        promptLength: systemPrompt.length,
      })

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
        messageContents: allMessages.map((m) => ({
          role: m.role,
          contentLength: m.content.length,
        })),
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
          chunkContent: chunk,
        })

        if (onStream) {
          onStream(chunk)
        }
      }

      logger.info('VercelAIClient.sendMessage', 'Stream completed', {
        totalChunks: chunkCount,
        responseLength: fullResponse.length,
        responsePreview: fullResponse.substring(0, 100),
      })

      if (!fullResponse.trim()) {
        logger.error(
          'VercelAIClient.sendMessage',
          'Empty response received from AI',
          {
            totalChunks: chunkCount,
            model,
            messageCount: allMessages.length,
          }
        )
        throw new Error('Empty response received from AI')
      }

      return fullResponse
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('VercelAIClient.sendMessage', 'Error processing message', {
        error: error.message,
        stack: error.stack,
        model: config?.model,
      })
      throw error
    }
  }
}

export const vercelAIClient = VercelAIClient.getInstance()
