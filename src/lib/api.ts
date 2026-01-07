import { supabase } from "@/integrations/supabase/client";

// Configuration
const SUPABASE_URL = "https://vbequimwiuzbltaiftrz.supabase.co";
const USE_EDGE_FUNCTIONS = import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true';

// Helper to get auth header
async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { 'Authorization': `Bearer ${session.access_token}` };
  }
  return {};
}

// API client for edge functions
async function apiRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  queryParams?: Record<string, string>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const authHeaders = await getAuthHeader();
    const url = new URL(`${SUPABASE_URL}/functions/v1/api${endpoint}`);
    
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { data: null, error: new Error(error.error || 'Request failed') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Books API
export const booksApi = {
  async getAll() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown[]>('GET', '/books');
    }
    
    const { data, error } = await supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        category_id,
        image_url,
        created_at,
        book_categories (
          name
        )
      `);
    
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async create(book: { title: string; author: string; category_id: string; image_url?: string }) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('POST', '/books', book);
    }
    const { data, error } = await supabase.from('books').insert(book).select();
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async update(id: string, book: Partial<{ title: string; author: string; category_id: string; image_url: string }>) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('PUT', '/books', book, { id });
    }
    const { data, error } = await supabase.from('books').update(book).eq('id', id).select();
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async delete(id: string) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('DELETE', '/books', undefined, { id });
    }
    const { error } = await supabase.from('books').delete().eq('id', id);
    return { data: null, error: error ? new Error(error.message) : null };
  }
};

// Book Categories API
export const bookCategoriesApi = {
  async getAll() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown[]>('GET', '/book-categories');
    }
    const { data, error } = await supabase
      .from('book_categories')
      .select('id, name, description')
      .order('name');
    return { data, error: error ? new Error(error.message) : null };
  }
};

// Records API
export const recordsApi = {
  async getAll() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown[]>('GET', '/records');
    }
    const { data, error } = await supabase
      .from('records')
      .select('id, artist, album, format, image_url, is_new, revisado, riscado, created_at');
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async create(record: { artist: string; album: string; format: string; image_url?: string; is_new?: boolean; revisado?: boolean; riscado?: boolean }) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('POST', '/records', record);
    }
    const { data, error } = await supabase.from('records').insert(record).select();
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async update(id: string, record: unknown) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('PUT', '/records', record, { id });
    }
    const { data, error } = await supabase.from('records').update(record as Record<string, unknown>).eq('id', id).select();
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async delete(id: string) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('DELETE', '/records', undefined, { id });
    }
    const { error } = await supabase.from('records').delete().eq('id', id);
    return { data: null, error: error ? new Error(error.message) : null };
  }
};

// Drinks API
export const drinksApi = {
  async getAll() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown[]>('GET', '/drinks');
    }
    
    const { data, error } = await supabase
      .from('drinks')
      .select(`
        id,
        name,
        type_id,
        grape_type,
        manufacturing_location,
        image_url,
        needs_to_buy,
        is_finished,
        needs_to_buy_marked_at,
        needs_to_buy_unmarked_at,
        is_finished_marked_at,
        is_finished_unmarked_at,
        created_at,
        drink_types (
          name
        )
      `);
    
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async create(drink: { name: string; type_id: string; grape_type?: string; manufacturing_location?: string; image_url?: string; needs_to_buy?: boolean; is_finished?: boolean }) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('POST', '/drinks', drink);
    }
    const { data, error } = await supabase.from('drinks').insert(drink).select();
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async update(id: string, drink: unknown) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('PUT', '/drinks', drink, { id });
    }
    const { data, error } = await supabase.from('drinks').update(drink as Record<string, unknown>).eq('id', id).select();
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async delete(id: string) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('DELETE', '/drinks', undefined, { id });
    }
    const { error } = await supabase.from('drinks').delete().eq('id', id);
    return { data: null, error: error ? new Error(error.message) : null };
  }
};

// Drink Types API
export const drinkTypesApi = {
  async getAll() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown[]>('GET', '/drink-types');
    }
    const { data, error } = await supabase
      .from('drink_types')
      .select('id, name, description')
      .order('name');
    return { data, error: error ? new Error(error.message) : null };
  }
};

// Grape Types API
export const grapeTypesApi = {
  async getAll() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown[]>('GET', '/grape-types');
    }
    const { data, error } = await supabase
      .from('grape_types')
      .select('id, name, description')
      .order('name');
    return { data, error: error ? new Error(error.message) : null };
  }
};

// Board Games API
export const boardGamesApi = {
  async getAll() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown[]>('GET', '/board-games');
    }
    const { data, error } = await supabase
      .from('board_games')
      .select('id, name, image_url, created_at');
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async create(game: { name: string; image_url?: string }) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('POST', '/board-games', game);
    }
    const { data, error } = await supabase.from('board_games').insert(game).select();
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async update(id: string, game: Partial<{ name: string; image_url: string }>) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('PUT', '/board-games', game, { id });
    }
    const { data, error } = await supabase.from('board_games').update(game).eq('id', id).select();
    return { data, error: error ? new Error(error.message) : null };
  },
  
  async delete(id: string) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<unknown>('DELETE', '/board-games', undefined, { id });
    }
    const { error } = await supabase.from('board_games').delete().eq('id', id);
    return { data: null, error: error ? new Error(error.message) : null };
  }
};

// Dashboard API
export const dashboardApi = {
  async getStats() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<{ books: number; records: number; drinks: number; games: number }>('GET', '/stats');
    }
    
    const [books, records, drinks, games] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('records').select('id', { count: 'exact', head: true }),
      supabase.from('drinks').select('id', { count: 'exact', head: true }),
      supabase.from('board_games').select('id', { count: 'exact', head: true })
    ]);
    
    return {
      data: {
        books: books.count || 0,
        records: records.count || 0,
        drinks: drinks.count || 0,
        games: games.count || 0
      },
      error: null
    };
  },
  
  async getRecentItems(limit: number = 6) {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<{ books: unknown[]; records: unknown[]; drinks: unknown[]; games: unknown[] }>('GET', '/recent-items', undefined, { limit: limit.toString() });
    }
    
    const [books, records, drinks, games] = await Promise.all([
      supabase.from('books').select('id, title, author, image_url, created_at').order('created_at', { ascending: false }).limit(limit),
      supabase.from('records').select('id, artist, album, image_url, created_at').order('created_at', { ascending: false }).limit(limit),
      supabase.from('drinks').select('id, name, image_url, created_at').order('created_at', { ascending: false }).limit(limit),
      supabase.from('board_games').select('id, name, image_url, created_at').order('created_at', { ascending: false }).limit(limit)
    ]);
    
    return {
      data: {
        books: books.data || [],
        records: records.data || [],
        drinks: drinks.data || [],
        games: games.data || []
      },
      error: null
    };
  }
};

// Storage API
export const storageApi = {
  async upload(bucket: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    if (USE_EDGE_FUNCTIONS) {
      try {
        const authHeaders = await getAuthHeader();
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/storage?bucket=${bucket}`, {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          return { url: null, error: new Error(error.error || 'Upload failed') };
        }
        
        const data = await response.json();
        return { url: data.url, error: null };
      } catch (error) {
        return { url: null, error: error as Error };
      }
    }
    
    // Direct Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (uploadError) {
      return { url: null, error: new Error(uploadError.message) };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: publicUrl, error: null };
  }
};

// Config API
export const configApi = {
  async getConfig() {
    if (USE_EDGE_FUNCTIONS) {
      return apiRequest<{ provider: string; storageProvider: string }>('GET', '/config');
    }
    return { data: { provider: 'supabase', storageProvider: 'supabase' }, error: null };
  }
};
