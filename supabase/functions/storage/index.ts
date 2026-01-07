import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to get user from JWT
async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) return null
  return user
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  const user = await getUserFromRequest(req)
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
  
  const url = new URL(req.url)
  const bucket = url.searchParams.get('bucket')
  
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'Bucket required' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
  
  if (req.method === 'POST') {
    try {
      const formData = await req.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'File required' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        return new Response(JSON.stringify({ error: uploadError.message }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)
      
      return new Response(JSON.stringify({ url: publicUrl }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    } catch (error) {
      console.error('Storage error:', error)
      return new Response(JSON.stringify({ error: 'Upload failed' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const filePath = url.searchParams.get('path')
      
      if (!filePath) {
        return new Response(JSON.stringify({ error: 'Path required' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      
      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    } catch (error) {
      console.error('Delete error:', error)
      return new Response(JSON.stringify({ error: 'Delete failed' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
    status: 405, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  })
})
