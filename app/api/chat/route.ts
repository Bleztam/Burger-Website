import { streamText, tool, convertToModelMessages } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const fallbackMenuItems = [
  {
    id: 'c1b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Classic Smash',
    description: 'Double 60g smash patties, American cheese, house sauce.',
    price: 28,
    category: 'burgers'
  },
  {
    id: 'd2b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'The Monster Bacon',
    description: '180g grilled artisan patty, crispy smoked bacon sheets, cheddar cream.',
    price: 38,
    category: 'burgers'
  },
  {
    id: 'e3b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Truffle Wolf',
    description: '180g beef patty, truffle mayo, caramelized onions, melted provolone.',
    price: 42,
    category: 'burgers'
  },
  {
    id: 'f4b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Cheesy Jalapeño',
    description: 'Double smash, pickled jalapeños, spicy pepper jack cheddar injection.',
    price: 34,
    category: 'burgers'
  },
  {
    id: 'a5b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Veggie Street',
    description: 'Plant-based crispy patty, shredded lettuce, fresh tomatoes, vegan garlic aioli.',
    price: 32,
    category: 'burgers'
  },
  {
    id: 'b6b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Craft IPA',
    description: 'Local artisanal craft IPA beer (served ice cold).',
    price: 18,
    category: 'drinks'
  },
  {
    id: 'c7b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Classic Milkshake',
    description: 'Creamy vanilla bean base mixed with dark chocolate swirls.',
    price: 22,
    category: 'drinks'
  },
  {
    id: 'd8b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Wolf Soda',
    description: 'House-infused craft soda with lime and guarana extract.',
    price: 12,
    category: 'drinks'
  },
  {
    id: 'e9b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Passion Fruit Mocktail',
    description: 'Fresh passion fruit juice, sparkling water, mint sprigs.',
    price: 16,
    category: 'drinks'
  },
  {
    id: 'f0b9b8f2-8c1d-4f1a-8c1d-4f1a8c1d4f1a',
    name: 'Americano Iced Coffee',
    description: 'Double shot espresso poured over ice with a hint of caramel.',
    price: 14,
    category: 'drinks'
  }
]

const fallbackBranches = [
  {
    id: 1,
    name: 'São José dos Pinhais',
    address: 'Rua XV de Novembro, 1234',
    latitude: -25.5349,
    longitude: -49.2008,
    status: 'UNLOCKED',
    step_order: 1,
    hours: 'Tue-Sun: 6PM - 11PM'
  },
  {
    id: 2,
    name: 'Curitiba Centro',
    address: 'Av. Marechal Deodoro, 567',
    latitude: -25.4284,
    longitude: -49.2733,
    status: 'UNLOCKED',
    step_order: 2,
    hours: 'Mon-Sun: 5PM - 12AM'
  },
  {
    id: 3,
    name: 'Batel',
    address: 'Rua Bispo Dom José, 890',
    latitude: -25.4431,
    longitude: -49.2922,
    status: 'UNLOCKED',
    step_order: 3,
    hours: 'Wed-Sun: 6PM - 11PM'
  },
  {
    id: 4,
    name: 'Água Verde',
    address: 'Coming Soon',
    latitude: -25.4518,
    longitude: -49.2854,
    status: 'LOCKED',
    step_order: 4,
    hours: 'Opening Q2 2026'
  },
  {
    id: 5,
    name: 'Santa Felicidade',
    address: 'Coming Soon',
    latitude: -25.4055,
    longitude: -49.3308,
    status: 'LOCKED',
    step_order: 5,
    hours: 'Opening Q4 2026'
  }
]

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = await createClient()

    // Retrieve active API key - fallback to standard env if not present
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY

    console.log("[Chat Route] Raw frontend messages received. Converting schema...")
    const modelMessages = await convertToModelMessages(messages)
    console.log(`[Chat Route] Successfully resolved ${modelMessages.length} CoreMessages. Checking environment configurations...`)

    if (!apiKey) {
      console.log("[Chat Route] ⚠️ No API key detected. Running local fallback fallback router...")
      // Elegant, premium local fallback chatbot if keys are not configured yet
      const lastMessageContent = modelMessages[modelMessages.length - 1]?.content
      const lastMessageText = typeof lastMessageContent === 'string' 
        ? lastMessageContent 
        : Array.isArray(lastMessageContent) 
          ? lastMessageContent.map(part => part.type === 'text' ? part.text : '').join(' ')
          : ''
      const lowercaseMsg = lastMessageText.toLowerCase()

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

    console.log("[Chat Route] ✅ Gemini API Key validated. Connecting stream handler...")
    const googleProvider = createGoogleGenerativeAI({ apiKey })

    // Initialize Vercel AI SDK with Google Gemini
    console.log("[Chat Route] Successfully parsed messages. Invoking Gemini model...")
    const result = streamText({
      model: googleProvider('gemini-2.5-flash'),
      messages: modelMessages,
      system: `You are the elite Full-Stack AI Concierge for "Wolfsburger" (Brand: Wolfscrew). 
Your persona is high-energy, premium, slightly rebellious (street-burger culture), helpful, and direct.
You have tools to fetch the live menu_items, branches locations, and add items directly to the user's cart.

Whenever the user asks about the menu, specific burgers or drinks, prices, or asks for a recommendation:
1. You MUST call the get_menu_items tool to fetch the live menu items added by the admin from the database. Do NOT use any pre-trained or fallback items if the tool can retrieve them.
2. Provide descriptions and prices of the relevant items from the menu.
3. Always suggest a custom combo (consisting of exactly one burger and one drink from the live menu) with a brief, high-energy description explaining why they pair perfectly.
4. Trigger the add_to_cart tool for the recommended burger or combo item if they show interest.

If they ask about locations:
1. Call get_branches to retrieve our active locations.
2. Tell them what branch is nearest (especially if they share their location).

Always keep answers concise, punchy, and formatted in clean Markdown.`,
      maxSteps: 5,
      tools: {
        get_menu_items: tool({
          description: 'Retrieve the list of all active menu items including names, descriptions, prices, categories, and IDs.',
          inputSchema: z.object({}),
          execute: async () => {
            try {
              const { data, error } = await supabase
                .from('menu_items')
                .select('id, name, description, price, category')
                .eq('is_active', true)
              
              if (error || !data || data.length === 0) {
                console.log("[Chat Route] Supabase fetch failed or empty, falling back to static menu items.")
                return { menu_items: fallbackMenuItems }
              }
              return { menu_items: data }
            } catch (err) {
              console.log("[Chat Route] Exception fetching from Supabase, falling back to static menu items.", err)
              return { menu_items: fallbackMenuItems }
            }
          },
        }),
        get_branches: tool({
          description: 'Retrieve active branch locations including name, address, latitude, longitude, and hours.',
          inputSchema: z.object({}),
          execute: async () => {
            try {
              const { data, error } = await supabase
                .from('branches')
                .select('id, name, address, latitude, longitude, hours')
                .eq('status', 'UNLOCKED')
              
              if (error || !data || data.length === 0) {
                console.log("[Chat Route] Supabase fetch failed or empty, falling back to static branches.")
                return { branches: fallbackBranches.filter(b => b.status === 'UNLOCKED') }
              }
              return { branches: data }
            } catch (err) {
              console.log("[Chat Route] Exception fetching from Supabase, falling back to static branches.", err)
              return { branches: fallbackBranches.filter(b => b.status === 'UNLOCKED') }
            }
          },
        }),
        add_to_cart: tool({
          description: 'Add a menu item directly to the customer\'s shopping cart.',
          inputSchema: z.object({
            menu_item_id: z.string().describe('The UUID of the menu item to add.'),
            quantity: z.number().int().positive().default(1).describe('The quantity of the menu item.'),
          }),
          execute: async ({ menu_item_id, quantity }) => {
            try {
              const { data, error } = await supabase
                .from('menu_items')
                .select('id, name, price')
                .eq('id', menu_item_id)
                .single()

              if (error || !data) {
                const fallbackItem = fallbackMenuItems.find(item => item.id === menu_item_id)
                if (fallbackItem) {
                  return {
                    success: true,
                    id: fallbackItem.id,
                    name: fallbackItem.name,
                    price: Number(fallbackItem.price),
                    quantity,
                    message: `Successfully added ${quantity}x ${fallbackItem.name} to cart.`
                  }
                }
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
            } catch (err) {
              const fallbackItem = fallbackMenuItems.find(item => item.id === menu_item_id)
              if (fallbackItem) {
                return {
                  success: true,
                  id: fallbackItem.id,
                  name: fallbackItem.name,
                  price: Number(fallbackItem.price),
                  quantity,
                  message: `Successfully added ${quantity}x ${fallbackItem.name} to cart.`
                }
              }
              return { error: `Menu item with id ${menu_item_id} not found (db offline).` }
            }
          },
        }),
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error("❌ [Chat Backend Crash Details]:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    return new Response(JSON.stringify({ 
      error: error.message, 
      details: "Look directly at your next.js npm run dev terminal log for the exact backtrace." 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
