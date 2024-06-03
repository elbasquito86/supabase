import { createClient } from '@supabase/supabase-js';
import { format } from '@fast-csv/format';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'stream';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Function triggered');

  try {
    // Query data from Supabase
    console.log('Querying Supabase...');
    const { data, error } = await supabase
      .from('coffee_shops')
      .select('shop_id, avg_rating');

    if (error) {
      console.error('Error querying Supabase:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log('Data retrieved from Supabase:', data);

    // Create CSV data
    const csvData = [];
    csvData.push(['shop_id', 'avg_rating']); // CSV header
    data.forEach((row) => {
      csvData.push([row.shop_id, row.avg_rating]);
    });

    // Create a CSV stream
    const csvStream = format({ headers: true });
    const readableStream = new Readable();
    readableStream._read = () => {}; // _read is required but you can noop it
    csvStream.pipe(readableStream);

    csvData.forEach((row) => csvStream.write(row));
    csvStream.end();

    // Set response headers for CSV file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');

    // Stream the CSV data in the response
    readableStream.pipe(res);

    console.log('CSV file created and streamed successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}

