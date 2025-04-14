const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  const section_ids = req.query.section_ids?.split(',').map(Number);
  if (!section_ids || section_ids.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid section_ids' });
  }

  const { data, error } = await supabase
    .from('menu_items')
    .select('section_id, name, is_vegetarian, is_deep_fried, row_order, col_order')
    .in('section_id', section_ids);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};
