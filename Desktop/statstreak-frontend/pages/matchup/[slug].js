import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Matchup.module.css";
import playerImageMap from "../../utils/playerImageMap";
import teamMap from "../../utils/teamMap";

const statOptions = ["points", "rebounds", "assists", "fg3m"];

const MatchupPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [boxiqData, setBoxiqData] = useState(null);
  const [dvpData, setDvpData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStat, setSelectedStat] = useState("points");

  useEffect(() => {
    if (router.isReady && slug) {
      fetchData();
    }
  }, [router.isReady, slug]);

  const fetchData = async () => {
    try {
      const boxiqRes = await fetch("https://boxiq-api.onrender.com/api/boxiq");
      const dvpRes = await fetch("https://boxiq-api.onrender.com/api/dvp");

      if (!boxiqRes.ok || !dvpRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const boxiqJson = await boxiqRes.json();
      const dvpJson = await dvpRes.json();

      console.log("✅ BoxIQ Data Loaded");
      console.log("✅ DvP Data Loaded");

      setBoxiqData(boxiqJson);
      setDvpData(dvpJson);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load BoxIQ data.");
      setLoading(false);
    }
  };

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

  const [slugA, slugB] = slug.split("-vs-");
  const teamA = teamMap[slugA];
  const teamB = teamMap[slugB];

  const filterTopPlayers = (teamAbbrev) => {
    const players = boxiqData[teamAbbrev];
    if (!players || !Array.isArray(players)) {
      console.warn(`No player data for team: ${teamAbbrev}`);
      return [];
    }

    return players
      .sort(
        (a, b) =>
          (b[`avg_${selectedStat}`] || 0) - (a[`avg_${selectedStat}`] || 0)
      )
      .slice(0, 6);
  };

  const renderPlayers = (teamAbbrev) => {
    const players = filterTopPlayers(teamAbbrev);

    return (
      <div className={styles.teamColumn}>
        {players.map((player) => {
          const slug = player.player?.toLowerCase().replace(/\s/g, "-");
          const image = playerImageMap[slug] || "/default-headshot.png";
          const streak = player.streaks?.[selectedStat];

          return (
            <div key={player.player} className={styles.playerCard}>
              <img src={image} alt={player.player} />
              <div className={styles.playerInfo}>
                <h3>{player.player}</h3>
                <p>#{player.jersey || "?"} | {player.position || "N/A"}</p>
                <p>Avg: {player[`avg_${selectedStat}`] ?? "N/A"} {selectedStat}</p>
                {streak && (
                  <p className={styles.streak}>
                    {streak}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.matchupPage}>
      <h1>{teamA?.name} vs {teamB?.name}</h1>

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
        {renderPlayers(teamA?.abbrev)}
        <div className={styles.divider}></div>
        {renderPlayers(teamB?.abbrev)}
      </div>
    </div>
  );
};

export default MatchupPage;