const axios = require('axios');

module.exports = async (req, res) => {
  const { managerId, gameweek } = req.query;
  try {
    const picksResponse = await axios.get(`https://fantasy.premierleague.com/api/entry/${managerId}/event/${gameweek}/picks/`);
    res.json(picksResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manager picks' });
  }
};
