import { streamText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = await createClient()

    // Retrieve active API key - fallback to standard env if not present
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Elegant, premium local fallback chatbot if keys are not configured yet
      const lastMessage = messages[messages.length - 1]?.content || ''
      const lowercaseMsg = lastMessage.toLowerCase()

      let text = "Hey there! I am the Wolfsburger AI Concierge. It seems like the Gemini API Key is not set up in your environment yet, but I can still tell you about our menu! "
      
      if (lowercaseMsg.includes('spicy') || lowercaseMsg.includes('hot')) {
        text += "If you like it hot, you should definitely try the **Cheesy Jalapeño** (R$ 34)! It has double smash patties, pickled jalapeños, and a melted pepper jack injection. You can get it at our Curitiba Centro branch!"
      } else if (lowercaseMsg.includes('bacon') || lowercaseMsg.includes('monster')) {
        text += "Our crowd favorite is the **Monster Bacon** (R$ 38), which features a huge 180g flame-grilled patty, crispy smoked bacon sheets, and warm cheddar cream!"
      } else {
        text += "We specialize in smashed street-style burgers like the **Classic Smash** (R$ 28) and premium grilled patties like the **Truffle Wolf** (R$ 42). What are you in the mood for?"
      }

      // Simulate stream response format for Vercel AI SDK hook compatibility
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(text)}\n`))
            controller.close()
          }
        }),
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      )
    }

    // Initialize Vercel AI SDK with Google Gemini
    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: `You are the elite Full-Stack AI Concierge for "Wolfsburger" (Brand: Wolfscrew). 
Your persona is high-energy, premium, slightly rebellious (street-burger culture), helpful, and direct.
You have tools to fetch the live menu_items, branches locations, and add items directly to the user's cart.

If a user asks for recommendations (e.g. "I have $15 and love spicy food, what should I get and where?"), follow these steps:
1. Call get_menu_items to fetch the active burgers and drinks.
2. Call get_branches to fetch our active locations.
3. Cross-reference their preferences (budget, flavors) to find matching items.
4. Tell them what branch is nearest if they share location coordinates (you can ask for their location, or compute distance if they give latitude/longitude). Note: R$ 1 is roughly equivalent to standard USD value for their budget query (e.g. treat $15 as R$ 75, or explain the conversion, or suggest items under R$ 50/R$ 15).
5. Suggest the perfect combo and explain why.
6. Trigger the add_to_cart tool for the recommended item.

Always keep answers concise, punchy, and formatted in clean Markdown.`,
      tools: {
        get_menu_items: tool({
          description: 'Retrieve the list of all active menu items including names, descriptions, prices, categories, and IDs.',
          parameters: z.object({}),
          execute: async () => {
            const { data, error } = await supabase
              .from('menu_items')
              .select('id, name, description, price, category')
              .eq('is_active', true)
            
            if (error || !data) return { error: 'Failed to retrieve menu items.' }
            return { menu_items: data }
          },
        }),
        get_branches: tool({
          description: 'Retrieve active branch locations including name, address, latitude, longitude, and hours.',
          parameters: z.object({}),
          execute: async () => {
            const { data, error } = await supabase
              .from('branches')
              .select('id, name, address, latitude, longitude, hours')
              .eq('status', 'UNLOCKED')
            
            if (error || !data) return { error: 'Failed to retrieve branch locations.' }
            return { branches: data }
          },
        }),
        add_to_cart: tool({
          description: 'Add a menu item directly to the customer\'s shopping cart.',
          parameters: z.object({
            menu_item_id: z.string().uuid().describe('The UUID of the menu item to add.'),
            quantity: z.number().int().positive().default(1).describe('The quantity of the menu item.'),
          }),
          execute: async ({ menu_item_id, quantity }) => {
            const { data, error } = await supabase
              .from('menu_items')
              .select('id, name, price')
              .eq('id', menu_item_id)
              .single()

            if (error || !data) {
              return { error: `Menu item with id ${menu_item_id} not found.` }
            }

            return {
              success: true,
              id: data.id,
              name: data.name,
              price: Number(data.price),
              quantity,
              message: `Successfully added ${quantity}x ${data.name} to cart.`
            }
          },
        }),
      },
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
