import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Function triggered');

  try {
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseKey ? 'Key is set' : 'Key is not set');

    // Query data from Supabase
    console.log('Querying Supabase...');
    const { data, error } = await supabase
      .from('coffee_shops') // Replace 'your_table' with your actual table name
      .select('shop_id, avg_rating');

    if (error) {
      console.error('Error querying Supabase:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log('Data retrieved from Supabase:', data);
    res.status(200).json(data); // Return data as JSON response
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
