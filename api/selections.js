const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  const { package_id } = req.query;
  if (!package_id) return res.status(400).json({ error: 'Missing package_id' });

  const { data, error } = await supabase
    .from('menu_sections')
    .select('id, package_id, title, note, selection_limit, display_order')
    .eq('package_id', package_id)
    .order('display_order');

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};