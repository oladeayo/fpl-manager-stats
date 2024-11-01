const axios = require('axios');

module.exports = async (req, res) => {
  const { playerId } = req.query;
  try {
    const playerSummaryResponse = await axios.get(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`);
    res.json(playerSummaryResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player summary' });
  }
};
