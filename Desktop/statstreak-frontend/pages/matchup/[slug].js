import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Matchup.module.css";
import playerImageMap from "../../utils/playerImageMap"; // <-- your ESPN image map file

const TEAM_NAME_MAP = {
  knicks: "NYK",
  pacers: "IND",
  timberwolves: "MIN",
  thunder: "OKC",
};

const MatchupPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [boxiqData, setBoxiqData] = useState(null);
  const [dvpData, setDvpData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStat, setSelectedStat] = useState("points");

  const statOptions = ["points", "rebounds", "assists", "fg3m"];

  const fetchData = async () => {
    try {
      const boxiqRes = await fetch("https://boxiq-api.onrender.com/api/boxiq");
      const dvpRes = await fetch("https://boxiq-api.onrender.com/api/dvp");

      if (!boxiqRes.ok || !dvpRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const boxiqJson = await boxiqRes.json();
      const dvpJson = await dvpRes.json();

      console.log("Fetched BoxIQ Data:", boxiqJson);
      console.log("Fetched DvP Data:", dvpJson);

      setBoxiqData(boxiqJson);
      setDvpData(dvpJson);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load BoxIQ data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <div className={styles.spinner}></div>
        <p>Loading matchup...</p>
      </div>
    );
  }

  if (error || !boxiqData || !dvpData) {
    return <p className={styles.error}>{error || "Data not available"}</p>;
  }

  const filterTopPlayers = (teamAbbrev) => {
  const players = boxiqData[teamAbbrev];
  if (!players) {
    console.warn(`Missing team for players: ${teamAbbrev}`);
    return [];
  }

  return players
    .sort((a, b) => (b[`avg_${selectedStat}`] || 0) - (a[`avg_${selectedStat}`] || 0))
    .slice(0, 6);
};


    const filtered = Object.values(boxiqData)
      .filter((player) => {
        if (
          !player ||
          typeof player !== "object" ||
          !player.team ||
          typeof player.team !== "string"
        ) {
          console.warn("Skipping invalid player entry:", player);
          return false;
        }
        return player.team === teamCode;
      })
      .sort((a, b) => (b[selectedStat] || 0) - (a[selectedStat] || 0))
      .slice(0, 6);

    console.log(`Top ${selectedStat} players for ${teamCode}:`, filtered);
    return filtered;
  };

  const renderPlayers = (team) => {
    const players = filterTopPlayers(team);

    return (
      <div className={styles.teamColumn}>
        {players.map((player) => {
          const playerSlug = player.name.toLowerCase().replace(/\s/g, "-");
          const streak = player.streaks?.[selectedStat];
          const image = playerImageMap[playerSlug] || "/default-headshot.png";

          return (
            <div key={player.name} className={styles.playerCard}>
              <img src={image} alt={player.name} />
              <div className={styles.playerInfo}>
                <h3>{player.name}</h3>
                <p>#{player.jersey || "?"} | {player.position || "N/A"}</p>
                <p>Avg: {player[selectedStat] ?? "N/A"} {selectedStat}</p>
                {streak && <p className={styles.streak}>{streak}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.matchupPage}>
      <h1>{teamA} vs {teamB}</h1>

      <div className={styles.statTabs}>
        {statOptions.map((stat) => (
          <button
            key={stat}
            className={selectedStat === stat ? styles.activeTab : ""}
            onClick={() => setSelectedStat(stat)}
          >
            {stat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.matchupContainer}>
        {renderPlayers(teamA)}
        <div className={styles.divider}></div>
        {renderPlayers(teamB)}
      </div>
    </div>
  );
}:

export default MatchupPage;
