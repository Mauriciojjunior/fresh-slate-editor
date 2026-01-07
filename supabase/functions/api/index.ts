import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Database provider detection
const useExternalDb = !!Deno.env.get('EXTERNAL_DATABASE_URL')

// Initialize Supabase client (always needed for auth and potentially storage)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// External Postgres connection via fetch (using Supabase pg wire protocol alternative)
interface ExternalDbResult {
  data: any[] | null
  error: { message: string } | null
}

// Helper to get user from JWT
async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) return null
  return user
}

// Generic query executor - for now, uses Supabase directly
// External DB would require a separate implementation
async function executeQuery(table: string, operation: string, params: Record<string, unknown> = {}): Promise<ExternalDbResult> {
  return executeSupabaseQuery(table, operation, params)
}

// Supabase query executor
async function executeSupabaseQuery(table: string, operation: string, params: Record<string, unknown>): Promise<ExternalDbResult> {
  const query = supabase.from(table)
  
  switch (operation) {
    case 'select': {
      let selectQuery = query.select((params.select as string) || '*')
      if (params.eq) {
        for (const [key, value] of Object.entries(params.eq as Record<string, unknown>)) {
          selectQuery = selectQuery.eq(key, value)
        }
      }
      if (params.order) {
        const orderParams = params.order as { column: string; ascending?: boolean }
        selectQuery = selectQuery.order(orderParams.column, { ascending: orderParams.ascending ?? true })
      }
      if (params.limit) {
        selectQuery = selectQuery.limit(params.limit as number)
      }
      const result = await selectQuery
      return { data: result.data, error: result.error ? { message: result.error.message } : null }
    }
    case 'insert': {
      const result = await query.insert(params.data).select()
      return { data: result.data, error: result.error ? { message: result.error.message } : null }
    }
    case 'update': {
      let updateQuery = query.update(params.data as Record<string, unknown>)
      if (params.eq) {
        for (const [key, value] of Object.entries(params.eq as Record<string, unknown>)) {
          updateQuery = updateQuery.eq(key, value)
        }
      }
      const result = await updateQuery.select()
      return { data: result.data, error: result.error ? { message: result.error.message } : null }
    }
    case 'delete': {
      let deleteQuery = query.delete()
      if (params.eq) {
        for (const [key, value] of Object.entries(params.eq as Record<string, unknown>)) {
          deleteQuery = deleteQuery.eq(key, value)
        }
      }
      const result = await deleteQuery
      return { data: null, error: result.error ? { message: result.error.message } : null }
    }
    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// Route handlers
const routes: Record<string, (req: Request, user: unknown) => Promise<Response>> = {
  // Books
  'GET /books': async (_req, _user) => {
    const { data, error } = await executeQuery('books', 'select', {
      select: 'id, title, author, category_id, image_url, created_at'
    })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    // Get categories for join
    const { data: categories } = await executeQuery('book_categories', 'select', { select: 'id, name' })
    const categoryMap = new Map((categories as Array<{ id: string; name: string }>)?.map((c) => [c.id, c.name]) || [])
    
    const booksWithCategories = (data as Array<{ category_id: string }>)?.map((book) => ({
      ...book,
      book_categories: { name: categoryMap.get(book.category_id) || 'Unknown' }
    }))
    
    return new Response(JSON.stringify(booksWithCategories), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'POST /books': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const body = await req.json()
    const { data, error } = await executeQuery('books', 'insert', { data: body })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'PUT /books': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const body = await req.json()
    
    const { data, error } = await executeQuery('books', 'update', { data: body, eq: { id } })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'DELETE /books': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    const { error } = await executeQuery('books', 'delete', { eq: { id } })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Book Categories
  'GET /book-categories': async (_req, _user) => {
    const { data, error } = await executeQuery('book_categories', 'select', {
      select: 'id, name, description',
      order: { column: 'name', ascending: true }
    })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Records
  'GET /records': async (_req, _user) => {
    const { data, error } = await executeQuery('records', 'select', {
      select: 'id, artist, album, format, image_url, is_new, revisado, riscado, created_at'
    })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'POST /records': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const body = await req.json()
    const { data, error } = await executeQuery('records', 'insert', { data: body })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'PUT /records': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const body = await req.json()
    
    const { data, error } = await executeQuery('records', 'update', { data: body, eq: { id } })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'DELETE /records': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    const { error } = await executeQuery('records', 'delete', { eq: { id } })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Drinks
  'GET /drinks': async (_req, _user) => {
    const { data, error } = await executeQuery('drinks', 'select', {
      select: 'id, name, type_id, grape_type, manufacturing_location, image_url, needs_to_buy, is_finished, needs_to_buy_marked_at, needs_to_buy_unmarked_at, is_finished_marked_at, is_finished_unmarked_at, created_at'
    })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    // Get drink types for join
    const { data: drinkTypes } = await executeQuery('drink_types', 'select', { select: 'id, name' })
    const typeMap = new Map((drinkTypes as Array<{ id: string; name: string }>)?.map((t) => [t.id, t.name]) || [])
    
    const drinksWithTypes = (data as Array<{ type_id: string }>)?.map((drink) => ({
      ...drink,
      drink_types: { name: typeMap.get(drink.type_id) || 'Unknown' }
    }))
    
    return new Response(JSON.stringify(drinksWithTypes), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'POST /drinks': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const body = await req.json()
    const { data, error } = await executeQuery('drinks', 'insert', { data: body })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'PUT /drinks': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const body = await req.json()
    
    const { data, error } = await executeQuery('drinks', 'update', { data: body, eq: { id } })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'DELETE /drinks': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    const { error } = await executeQuery('drinks', 'delete', { eq: { id } })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Drink Types
  'GET /drink-types': async (_req, _user) => {
    const { data, error } = await executeQuery('drink_types', 'select', {
      select: 'id, name, description',
      order: { column: 'name', ascending: true }
    })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Grape Types
  'GET /grape-types': async (_req, _user) => {
    const { data, error } = await executeQuery('grape_types', 'select', {
      select: 'id, name, description',
      order: { column: 'name', ascending: true }
    })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Board Games
  'GET /board-games': async (_req, _user) => {
    const { data, error } = await executeQuery('board_games', 'select', {
      select: 'id, name, image_url, created_at'
    })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'POST /board-games': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const body = await req.json()
    const { data, error } = await executeQuery('board_games', 'insert', { data: body })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'PUT /board-games': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const body = await req.json()
    
    const { data, error } = await executeQuery('board_games', 'update', { data: body, eq: { id } })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  'DELETE /board-games': async (req, user) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    const { error } = await executeQuery('board_games', 'delete', { eq: { id } })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
    
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Dashboard stats
  'GET /stats': async (_req, _user) => {
    const [books, records, drinks, games] = await Promise.all([
      executeQuery('books', 'select', { select: 'id' }),
      executeQuery('records', 'select', { select: 'id' }),
      executeQuery('drinks', 'select', { select: 'id' }),
      executeQuery('board_games', 'select', { select: 'id' })
    ])
    
    return new Response(JSON.stringify({
      books: (books.data as unknown[])?.length || 0,
      records: (records.data as unknown[])?.length || 0,
      drinks: (drinks.data as unknown[])?.length || 0,
      games: (games.data as unknown[])?.length || 0
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Recent items
  'GET /recent-items': async (req, _user) => {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '6')
    
    const [books, records, drinks, games] = await Promise.all([
      executeQuery('books', 'select', { select: 'id, title, author, image_url, created_at', order: { column: 'created_at', ascending: false }, limit }),
      executeQuery('records', 'select', { select: 'id, artist, album, image_url, created_at', order: { column: 'created_at', ascending: false }, limit }),
      executeQuery('drinks', 'select', { select: 'id, name, image_url, created_at', order: { column: 'created_at', ascending: false }, limit }),
      executeQuery('board_games', 'select', { select: 'id, name, image_url, created_at', order: { column: 'created_at', ascending: false }, limit })
    ])
    
    return new Response(JSON.stringify({
      books: books.data || [],
      records: records.data || [],
      drinks: drinks.data || [],
      games: games.data || []
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  },
  
  // Config endpoint to check provider
  'GET /config': async (_req, _user) => {
    return new Response(JSON.stringify({
      provider: useExternalDb ? 'postgres' : 'supabase',
      storageProvider: 'supabase' // Storage always uses Supabase for now
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  const url = new URL(req.url)
  const path = url.pathname.replace('/api', '') || '/'
  const routeKey = `${req.method} ${path}`
  
  console.log(`[API] ${routeKey}`)
  
  const user = await getUserFromRequest(req)
  
  const handler = routes[routeKey]
  if (handler) {
    try {
      return await handler(req, user)
    } catch (error) {
      console.error(`[API] Error handling ${routeKey}:`, error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
  }
  
  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  })
})
