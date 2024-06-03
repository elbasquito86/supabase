import { createClient } from '@supabase/supabase-js';
import { format } from '@fast-csv/format';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { VercelRequest, VercelResponse } from '@vercel/node';

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

    // Path to the results directory
    const resultsDir = join(process.cwd(), 'results');

    // Write CSV file
    const csvFilePath = join(resultsDir, 'data.csv');
    console.log('Writing CSV file to:', csvFilePath);
    const csvStream = format({ headers: true });
    const writableStream = writeFileSync(csvFilePath, 'utf8');
    csvStream.pipe(writableStream);
    csvData.forEach((row) => csvStream.write(row));
    csvStream.end();

    console.log('CSV file created successfully');
    res.status(200).json({ message: 'CSV file created', filePath: csvFilePath });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
