"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { io, type Socket } from "socket.io-client"


export default function CricketScoringApp() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [commentary, setCommentary] = useState<Commentary[]>([])
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [showAddCommentary, setShowAddCommentary] = useState(false)

  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const [over, setOver] = useState<number>(1)
  const [ball, setBall] = useState<number>(1)
  const [eventType, setEventType] = useState("run")
  const [description, setDescription] = useState("")
  const [runs, setRuns] = useState<number | undefined>(undefined)

  useEffect(() => {
    const newSocket = io({
      path: "/api/socket/io",
    })
    setSocket(newSocket)

    newSocket.on("commentaryUpdate", (data: Commentary) => {
      setCommentary((prev) => [data, ...prev])
    })

    newSocket.on("matchUpdate", (data: Match) => {
      setMatches((prev) => prev.map((match) => (match.matchId === data.matchId ? data : match)))
      if (selectedMatch?.matchId === data.matchId) {
        setSelectedMatch(data)
      }
    })

    loadMatches()

    return () => {
      newSocket.close()
    }
  }, [selectedMatch?.matchId])

  const loadMatches = async () => {
    try {
      const response = await fetch("/api/matches")
      const data = await response.json()
      setMatches(data)
    } catch (error) {
      console.error("Error loading matches:", error)
    }
  }

  const loadCommentary = async (matchId: string) => {
    try {
      console.log("matchId ",matchId)
      const response = await fetch(`/api/matches/${matchId}/commentry`)
      const data = await response.json()
      setCommentary(data)
    } catch (error) {
      //@ts-ignore
      console.error("Error loading commentary")
    }
  }

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/matches/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1, team2 }),
      })
      const newMatch = await response.json()
      setMatches((prev) => [newMatch, ...prev])
      setTeam1("")
      setTeam2("")
      setShowCreateMatch(false)
    } catch (error) {
      console.error("Error creating match:", error)
    }
  }

  const addCommentary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMatch) return

    console.log("selected match ",selectedMatch)
    try {
      const response = await fetch(`/api/matches/${selectedMatch.matchId}/commentry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          over,
          ball,
          eventType,
          description,
          runs,
        }),
      })
      const newCommentary = await response.json()
      setCommentary((prev) => [newCommentary, ...prev])
      setDescription("")
      setRuns(undefined)
      setShowAddCommentary(false)
    } catch (error) {
      console.error("Error adding commentary:", error)
    }
  }

  const toggleMatchStatus = async (matchId: string, currentStatus: string) => {
    try {
      console.log("matchid is ", matchId)
      const newStatus = currentStatus === "active" ? "paused" : "active"
      const response = await fetch(`/api/matches/${matchId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const updatedMatch = await response.json()
      setMatches((prev) => prev.map((match) => (match.matchId === matchId ? updatedMatch : match)))
      if (selectedMatch?.matchId === matchId) {
        setSelectedMatch(updatedMatch)
      }
    } catch (error) {
      console.error("Error updating match status:", error)
    }
  }

  const selectMatch = (match: Match) => {
    setSelectedMatch(match)
    loadCommentary(match.matchId)
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Cricket Scoring App</h1>
        <p>Real-time cricket scoreboard with live commentary</p>
      </div>

      <div className="main-grid">
        <div className="matches-section">
          <div className="card">
            <div className="card-header">
              <div className="header-content">
                <h2>Matches</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreateMatch(true)}>
                  <span className="icon">+</span>
                  Start Match
                </button>
              </div>
            </div>
            <div className="card-content">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className={`match-item ${selectedMatch?.matchId === match.matchId ? "selected" : ""}`}
                  onClick={() => selectMatch(match)}
                >
                  <div className="match-header">
                    <span className="match-id">#{match.matchId}</span>
                    <span className={`badge ${match.status === "active" ? "badge-active" : "badge-inactive"}`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="match-teams">
                    {match.team1} vs {match.team2}
                  </div>
                </div>
              ))}
              {matches.length === 0 && <p className="empty-state">No matches yet. Start your first match!</p>}
            </div>
          </div>
        </div>

        <div className="scoreboard-section">
          {selectedMatch ? (
            <div className="scoreboard-content">
              <div className="card">
                <div className="card-header">
                  <div className="match-info">
                    <div>
                      <h2>
                        {selectedMatch.team1} vs {selectedMatch.team2}
                      </h2>
                      <p className="match-subtitle">Match ID: #{selectedMatch.matchId}</p>
                    </div>
                    <div className="match-controls">
                      <span
                        className={`badge ${selectedMatch.status === "active" ? "badge-active" : "badge-inactive"}`}
                      >
                        {selectedMatch.status}
                      </span>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleMatchStatus(selectedMatch.matchId, selectedMatch.status)}
                      >
                        <span className="icon">{selectedMatch.status === "active" ? "⏸" : "▶"}</span>
                        {selectedMatch.status === "active" ? "Pause" : "Resume"}
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowAddCommentary(true)}>
                        <span className="icon">+</span>
                        Add Commentary
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2>Live Commentary</h2>
                  <p className="card-subtitle">Ball-by-ball updates</p>
                </div>
                <div className="card-content">
                  <div className="commentary-feed">
                    {commentary.map((comment) => (
                      <div key={comment._id} className="commentary-item">
                        <div className="commentary-badges">
                          <span className="badge badge-outline">
                            {comment.over}.{comment.ball}
                          </span>
                          <span className="badge badge-secondary">{comment.eventType}</span>
                          {comment.runs !== undefined && (
                            <span className="badge badge-primary">
                              {comment.runs} run{comment.runs !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {comment.description && <p className="commentary-text">{comment.description}</p>}
                        <p className="commentary-time">{new Date(comment.createdAt).toLocaleTimeString()}</p>
                      </div>
                    ))}
                    {commentary.length === 0 && <p className="empty-state">No commentary yet. Add the first ball!</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-content empty-scoreboard">
                <div className="empty-content">
                  <h3>Select a Match</h3>
                  <p>Choose a match from the list to view live commentary and updates</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateMatch && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Start New Match</h2>
              <p>Create a new cricket match</p>
            </div>
            <div className="modal-content">
              <form onSubmit={createMatch} className="form">
                <div className="form-group">
                  <label htmlFor="team1">Team 1</label>
                  <input
                    id="team1"
                    type="text"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                    placeholder="Enter team 1 name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="team2">Team 2</label>
                  <input
                    id="team2"
                    type="text"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                    placeholder="Enter team 2 name"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Start Match
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowCreateMatch(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddCommentary && selectedMatch && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Commentary</h2>
              <p>Add commentary for a specific ball</p>
            </div>
            <div className="modal-content">
              <form onSubmit={addCommentary} className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="over">Over *</label>
                    <input
                      id="over"
                      type="number"
                      min="1"
                      value={over}
                      onChange={(e) => setOver(Number.parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ball">Ball *</label>
                    <input
                      id="ball"
                      type="number"
                      min="1"
                      max="6"
                      value={ball}
                      onChange={(e) => setBall(Number.parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="eventType">Event Type *</label>
                  <select id="eventType" value={eventType} onChange={(e) => setEventType(e.target.value)} required>
                    <option value="run">Run</option>
                    <option value="wicket">Wicket</option>
                    <option value="wide">Wide</option>
                    <option value="no-ball">No Ball</option>
                    <option value="bye">Bye</option>
                    <option value="leg-bye">Leg Bye</option>
                    <option value="dot">Dot Ball</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="runs">Runs</label>
                  <input
                    id="runs"
                    type="number"
                    min="0"
                    max="6"
                    value={runs || ""}
                    onChange={(e) => setRuns(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened..."
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Add Commentary
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddCommentary(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
