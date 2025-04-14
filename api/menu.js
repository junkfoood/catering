const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const { data, error } = await supabase
    .from('menu_packages')
    .select('id, code, title, price_per_pax, moqfd, delivery_fee, general_note')
    .eq('code', code)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};