import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Matchup.module.css";
import playerImageMap from "../../utils/playerImageMap";
import teamMap from "../../utils/teamMap";

const statOptions = ["points", "rebounds", "assists", "fg3m"];

export default function MatchupPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [boxiqData, setBoxiqData] = useState(null);
  const [dvpData, setDvpData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStat, setSelectedStat] = useState("points");
  const [inputs, setInputs] = useState({});
  const [ouSelect, setOuSelect] = useState({});
  const [predictions, setPredictions] = useState({});
  const [dropdowns, setDropdowns] = useState({});

  useEffect(() => {
    if (!slug) return;
    fetchData();
  }, [slug]);

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
      console.error("Fetch error:", err);
      setError("Could not load BoxIQ data.");
      setLoading(false);
    }
  };

  const calculatePrediction = (player, category, line, odds, choice, opponentAbbrev) => {
    const avg = player[`avg_${category}`];
    const streak = player.streaks?.[category] || "";
    const dvpValue = dvpData?.[opponentAbbrev]?.[category] || 0;

    const oddsVal = Math.abs(parseInt(odds) || 0);
    const deviation = avg - line;
    const absDeviation = Math.abs(deviation);

    let baseConfidence = Math.min(99, Math.max(30, (absDeviation / (avg || 1)) * 100));
    baseConfidence += Math.min(20, oddsVal / 10);
    baseConfidence += dvpValue > 0 ? (dvpValue < 5 ? -5 : dvpValue < 10 ? 0 : 5) : 0;

    const recommend = deviation >= 0 ? "under" : "over";
    const explanation = [
      `📊 Avg ${category}: ${avg?.toFixed(1)}`,
      streak ? `🔥 Streak: ${streak}` : "",
      dvpValue ? `🛡️ DvP Rank: ${dvpValue} vs ${category}` : "",
      recommend === choice
        ? `✅ BoxIQ agrees — we like the ${choice.toUpperCase()} here.`
        : `⚠️ BoxIQ recommends the **${recommend.toUpperCase()}** based on trends.`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      confidence: Math.round(baseConfidence),
      recommendation: recommend,
      explanation,
    };
  };

  const renderPlayers = (teamAbbrev, opponentAbbrev, teamKey) => {
    const players = boxiqData?.[teamAbbrev] || [];
    return (
      <div className={styles.teamColumn}>
        {players
          .sort((a, b) => (b[`avg_${selectedStat}`] || 0) - (a[`avg_${selectedStat}`] || 0))
          .slice(0, 6)
          .map((player) => {
            const slug = player.player.toLowerCase().replace(/\s/g, "-");
            const image = playerImageMap[slug] || "/default-headshot.png";
            const streak = player.streaks?.[selectedStat];
            const inputKey = `${teamKey}-${slug}`;
            const input = inputs[inputKey] || {};
            const line = parseFloat(input.line);
            const odds = input.odds;
            const choice = ouSelect[inputKey];
            const result = predictions[inputKey];
            const isOpen = dropdowns[inputKey];

            return (
              <div key={player.player} className={styles.playerCard}>
                <img src={image} alt={player.player} className={styles.headshot} />
                <div className={styles.cardContent}>
                  <div className={styles.topRow}>
                    <h3>{player.player}</h3>
                    <span>#{player.jersey || "?"} | {player.position || "N/A"}</span>
                    <span>Avg: {player[`avg_${selectedStat}`] ?? "N/A"}</span>
                  </div>
                  {streak && <p className={styles.streak}>🔥 {streak}</p>}
                  <button
                    className={styles.dropdownToggle}
                    onClick={() =>
                      setDropdowns((prev) => ({ ...prev, [inputKey]: !isOpen }))
                    }
                  >
                    {isOpen ? "▲ Hide Insights" : "▼ Show Insights"}
                  </button>
                  {isOpen && (
                    <div className={styles.predictionDropdown}>
                      <div className={styles.predictionRow}>
                        <input
                          type="number"
                          placeholder="Line"
                          value={input.line || ""}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              [inputKey]: { ...prev[inputKey], line: e.target.value },
                            }))
                          }
                          className={styles.input}
                        />
                        <input
                          type="text"
                          placeholder="Odds"
                          value={input.odds || ""}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              [inputKey]: { ...prev[inputKey], odds: e.target.value },
                            }))
                          }
                          className={styles.input}
                        />
                        <button
                          className={
                            choice === "over" ? styles.selectedBtn : styles.ouBtn
                          }
                          onClick={() =>
                            setOuSelect((prev) => ({ ...prev, [inputKey]: "over" }))
                          }
                        >
                          Over
                        </button>
                        <button
                          className={
                            choice === "under" ? styles.selectedBtn : styles.ouBtn
                          }
                          onClick={() =>
                            setOuSelect((prev) => ({ ...prev, [inputKey]: "under" }))
                          }
                        >
                          Under
                        </button>
                        <button
                          className={styles.goBtn}
                          onClick={() => {
                            if (line && odds && choice) {
                              const prediction = calculatePrediction(
                                player,
                                selectedStat,
                                line,
                                odds,
                                choice,
                                opponentAbbrev
                              );
                              setPredictions((prev) => ({
                                ...prev,
                                [inputKey]: prediction,
                              }));
                            }
                          }}
                        >
                          GO
                        </button>
                      </div>
                      {result && (
                        <div className={styles.predictionResult}>
                          <p>
                            🧠 <strong>Confidence:</strong> {result.confidence}% —{" "}
                            <strong>{result.recommendation.toUpperCase()}</strong>
                          </p>
                          <pre>{result.explanation}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <div className={styles.spinner}></div>
        <p>Loading matchup...</p>
      </div>
    );
  }

  const [slugA, slugB] = slug.split("-vs-");
  const teamA = teamMap[slugA];
  const teamB = teamMap[slugB];

  return (
    <div className={styles.matchupPage}>
      <h1>{teamA?.name} vs {teamB?.name}</h1>

      <div className={styles.statTabs}>
        {statOptions.map((stat) => (
          <button
            key={stat}
            onClick={() => setSelectedStat(stat)}
            className={
              selectedStat === stat ? styles.activeTab : styles.inactiveTab
            }
          >
            {stat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.matchupContainer}>
        {renderPlayers(teamA.abbrev, teamB.abbrev, "teamA")}
        <div className={styles.divider}></div>
        {renderPlayers(teamB.abbrev, teamA.abbrev, "teamB")}
      </div>
    </div>
  );
}