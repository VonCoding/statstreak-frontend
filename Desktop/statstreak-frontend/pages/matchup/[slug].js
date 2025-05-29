import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/Matchup.module.css";

const STAT_CATEGORIES = ["points", "rebounds", "assists", "fg3m"];

const Matchup = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [boxiqData, setBoxiqData] = useState(null);
  const [dvpData, setDvpData] = useState(null);
  const [statCategory, setStatCategory] = useState("points");
  const [loading, setLoading] = useState(true);
  const [predictionInputs, setPredictionInputs] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boxiqRes, dvpRes] = await Promise.all([
          fetch("https://boxiq-api.onrender.com/api/boxiq"),
          fetch("https://boxiq-api.onrender.com/api/dvp"),
        ]);
        const [boxiqJson, dvpJson] = await Promise.all([
          boxiqRes.json(),
          dvpRes.json(),
        ]);
        setBoxiqData(boxiqJson);
        setDvpData(dvpJson);
        setLoading(false);
      } catch (error) {
        console.error("Data fetch error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!slug || !boxiqData || !dvpData) return <div>Loading matchup...</div>;

  const [teamAName, teamBName] = slug.split("-vs-");

  const getTopPlayers = (team) => {
    const players = boxiqData[team]?.players || [];
    return players
      .sort((a, b) => b.stats[statCategory] - a.stats[statCategory])
      .slice(0, 6);
  };

  const renderPlayer = (player) => {
    const statLine = player.stats[statCategory];
    const streak = player.streaks?.[statCategory];
    const dvp = dvpData?.[player.opponent]?.[player.position]?.[statCategory];

    const key = `${player.name}_${statCategory}`;

    const handleChange = (field, value) => {
      setPredictionInputs((prev) => ({
        ...prev,
        [key]: { ...prev[key], [field]: value },
      }));
    };

    const input = predictionInputs[key] || {};

    return (
      <div key={player.name} className={styles.playerCard}>
        <div className={styles.playerHeader}>
          <img src={player.image} alt={player.name} />
          <div>
            <h4>{player.name}</h4>
            <p>#{player.jersey} · {player.position}</p>
          </div>
        </div>
        <div className={styles.playerStatMain}>
          <span>{statLine} {statCategory}</span>
        </div>
        <details className={styles.details}>
          <summary>BoxIQ Insights</summary>
          <p><strong>Streak:</strong> {streak}</p>
          <p><strong>DvP:</strong> {dvp}</p>
          <div className={styles.predictionRow}>
            <input
              type="number"
              placeholder="Line"
              value={input.line || ""}
              onChange={(e) => handleChange("line", e.target.value)}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Odds"
              value={input.odds || ""}
              onChange={(e) => handleChange("odds", e.target.value)}
              className={styles.input}
            />
            <div className={styles.ouToggle}>
              <button
                className={`${styles.pill} ${input.choice === "over" ? styles.active : ""}`}
                onClick={() => handleChange("choice", "over")}
              >
                Over
              </button>
              <button
                className={`${styles.pill} ${input.choice === "under" ? styles.active : ""}`}
                onClick={() => handleChange("choice", "under")}
              >
                Under
              </button>
            </div>
            <button
              className={styles.goButton}
              onClick={() => console.log("Submit prediction for", player.name, input)}
            >
              Go
            </button>
          </div>
        </details>
      </div>
    );
  };

  const teamAPlayers = getTopPlayers(teamAName);
  const teamBPlayers = getTopPlayers(teamBName);

  return (
    <div className={styles.matchupContainer}>
      <h1>{teamAName} vs {teamBName}</h1>

      <div className={styles.tabs}>
        {STAT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={statCategory === cat ? styles.tabActive : styles.tab}
            onClick={() => setStatCategory(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.matchupGrid}>
        <div className={styles.teamColumn}>
          {teamAPlayers.map(renderPlayer)}
        </div>

        <div className={styles.teamColumn}>
          {teamBPlayers.map(renderPlayer)}
        </div>
      </div>
    </div>
  );
};

export default Matchup;