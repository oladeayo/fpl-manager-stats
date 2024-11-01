const axios = require('axios');

module.exports = async (req, res) => {
  const { managerId } = req.query;
  try {
    const managerEntryResponse = await axios.get(`https://fantasy.premierleague.com/api/entry/${managerId}/`);
    res.json(managerEntryResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manager entry data' });
  }
};
