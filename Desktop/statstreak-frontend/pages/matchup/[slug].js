import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Matchup.module.css";
import playerImageMap from "../../utils/playerImageMap"; // Adjust path if different

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

      if (!boxiqRes.ok || !dvpRes.ok) throw new Error("Failed to fetch data");

      const boxiqJson = await boxiqRes.json();
      const dvpJson = await dvpRes.json();

      setBoxiqData(boxiqJson);
      setDvpData(dvpJson);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Could not load BoxIQ data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchData();
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

  const [teamA, teamB] = slug.split("-vs-");

  const nameToSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  const filterTopPlayers = (teamName) => {
    return Object.values(boxiqData)
      .filter((player) => player.team.toLowerCase() === teamName.toLowerCase())
      .sort((a, b) => b[selectedStat] - a[selectedStat])
      .slice(0, 6);
  };

  const renderPlayers = (team) => {
    const players = filterTopPlayers(team);

    return (
      <div className={styles.teamColumn}>
        {players.map((player) => {
          const imageSlug = nameToSlug(player.name);
          const imageUrl = playerImageMap[imageSlug] || "/default-headshot.png";

          const streak = player.streaks?.[selectedStat];
          return (
            <div key={player.id} className={styles.playerCard}>
              <img src={imageUrl} alt={player.name} />
              <div className={styles.playerInfo}>
                <h3>{player.name}</h3>
                <p>#{player.jersey} | {player.position}</p>
                <p>Avg: {player[selectedStat]} {selectedStat}</p>
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
};

export default MatchupPage;