const axios = require('axios');

module.exports = async (req, res) => {
  const { managerId } = req.query;
  try {
    const historyResponse = await axios.get(`https://fantasy.premierleague.com/api/entry/${managerId}/history/`);
    res.json(historyResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manager history' });
  }
};
