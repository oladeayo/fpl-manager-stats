const axios = require('axios');

module.exports = async (req, res) => {
  const { leagueId } = req.query;
  try {
    const leagueResponse = await axios.get(`https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`);
    res.json(leagueResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch league standings' });
  }
};
