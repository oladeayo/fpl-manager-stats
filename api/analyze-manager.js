const axios = require('axios');

module.exports = async (req, res) => {
  const { managerId } = req.query;
  try {
    const playerDataResponse = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
    const playerData = playerDataResponse.data;

    const currentGameweek = playerData.events.find(event => event.is_current).id;

    const managerEntryResponse = await axios.get(`https://fantasy.premierleague.com/api/entry/${managerId}/`);
    const managerEntryData = managerEntryResponse.data;

    const historyResponse = await axios.get(`https://fantasy.premierleague.com/api/entry/${managerId}/history/`);
    const historyData = historyResponse.data;

    const analysis = {
      managerInfo: {
        name: `${managerEntryData.player_first_name} ${managerEntryData.player_last_name}`,
        teamName: managerEntryData.name,
        overallRanking: managerEntryData.summary_overall_rank || "N/A",
        managerPoints: managerEntryData.summary_overall_points,
        allChipsUsed: historyData.chips.map(chip => chip.name).join(", ") || "None",
        lastSeasonRank: historyData.past.length > 0 ? historyData.past[historyData.past.length - 1].rank : "Didn't Play",
        seasonBeforeLastRank: historyData.past.length > 1 ? historyData.past[historyData.past.length - 2].rank : "Didn't Play"
      },
      playerStats: {}
    };

    for (let gw = 1; gw <= currentGameweek; gw++) {
      const managerPicksResponse = await axios.get(`https://fantasy.premierleague.com/api/entry/${managerId}/event/${gw}/picks/`);
      const managerPicksData = managerPicksResponse.data;
      const managerPicks = managerPicksData.picks;

      const isBenchBoost = managerPicksData.active_chip === "bboost";
      const isTripleCaptain = managerPicksData.active_chip === "3xc";

      managerPicks.forEach((pick, index) => {
        const playerId = pick.element;
        const player = playerData.elements.find(p => p.id == playerId);
        if (!player) return;

        const playerHistoryResponse = await axios.get(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`);
        const playerHistory = playerHistoryResponse.data.history;

        const gameweekHistory = playerHistory.find(history => history.round === gw);
        const pointsThisWeek = gameweekHistory ? gameweekHistory.total_points : 0;

        if (!analysis.playerStats[playerId]) {
          analysis.playerStats[playerId] = {
            name: player.web_name,
            team: playerData.teams[player.team - 1].name,
            position: ["GKP", "DEF", "MID", "FWD"][player.element_type - 1],
            totalPointsActive: 0,
            gwInSquad: 0,
            starts: 0,
            cappedPoints: 0,
            playerPoints: 0
          };
        }

        const playerStat = analysis.playerStats[playerId];
        const inStarting11 = index < 11;

        playerStat.playerPoints += pointsThisWeek;

        if (inStarting11 || isBenchBoost) {
          let activePoints = pointsThisWeek;
          if (pick.is_captain) {
            activePoints *= isTripleCaptain ? 3 : 2;
            playerStat.cappedPoints += activePoints;
          }

          playerStat.totalPointsActive += activePoints;

          if (inStarting11) playerStat.starts += 1;
          playerStat.gwInSquad += 1;
        }
      });
    }

    analysis.sortedPlayers = Object.values(analysis.playerStats)
      .sort((a, b) => b.totalPointsActive - a.totalPointsActive);

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing manager:', error);
    res.status(500).json({ error: 'Failed to analyze manager' });
  }
};
