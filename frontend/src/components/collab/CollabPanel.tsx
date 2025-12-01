// Live Collaboration Panel - Room management and presence indicators
import { useState, useEffect } from 'react';
import { useCollabStore } from '../../stores/collabStore';
import type { Participant } from '../../stores/collabStore';
import './CollabPanel.css';

export function CollabPanel() {
  const {
    isConnected,
    roomId,
    userId,
    username,
    participants,
    setUsername,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useCollabStore();

  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);

  // Check URL for room parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && !isConnected) {
      handleJoin(roomParam);
    }
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const newRoomId = await createRoom();
      // Update URL without reload
      window.history.pushState({}, '', `?room=${newRoomId}`);
    } catch (err) {
      setError('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (code?: string) => {
    const roomCode = code || joinCode;
    if (!roomCode.trim()) return;

    setIsJoining(true);
    setError(null);
    try {
      await joinRoom(roomCode.trim());
      // Update URL
      window.history.pushState({}, '', `?room=${roomCode.trim()}`);
      setJoinCode('');
    } catch (err) {
      setError('Room not found');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    // Clear URL parameter
    window.history.pushState({}, '', window.location.pathname);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setUsername(tempName.trim());
    }
    setEditingName(false);
  };

  return (
    <>
      {/* Floating collaboration button */}
      <button
        className={`collab-toggle ${isConnected ? 'connected' : ''}`}
        onClick={() => setShowPanel(!showPanel)}
        title="Live Collaboration"
      >
        {isConnected ? (
          <span className="participant-count">{participants.length}</span>
        ) : (
          '👥'
        )}
      </button>

      {/* Collaboration panel */}
      <div className={`collab-panel ${showPanel ? 'open' : ''}`}>
        <div className="collab-header">
          <h3>Live Collaboration</h3>
          <button onClick={() => setShowPanel(false)} className="close-btn">
            ✕
          </button>
        </div>

        <div className="collab-content">
          {/* Username section */}
          <div className="username-section">
            <label>Your Name</label>
            {editingName ? (
              <div className="name-edit">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                />
                <button onClick={handleNameSave}>Save</button>
              </div>
            ) : (
              <div className="name-display" onClick={() => {
                setTempName(username);
                setEditingName(true);
              }}>
                {username} <span className="edit-hint">click to edit</span>
              </div>
            )}
          </div>

          {!isConnected ? (
            /* Not connected - show create/join options */
            <div className="connection-options">
              <div className="option-section">
                <h4>Start a Session</h4>
                <button
                  className="create-btn"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </button>
              </div>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="option-section">
                <h4>Join a Session</h4>
                <div className="join-form">
                  <input
                    type="text"
                    placeholder="Enter room code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  />
                  <button
                    onClick={() => handleJoin()}
                    disabled={isJoining || !joinCode.trim()}
                  >
                    {isJoining ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
            </div>
          ) : (
            /* Connected - show room info and participants */
            <div className="room-info">
              <div className="room-code-section">
                <label>Room Code</label>
                <div className="room-code">
                  <span>{roomId}</span>
                  <button onClick={copyRoomLink} title="Copy invite link">
                    📋
                  </button>
                </div>
              </div>

              <div className="participants-section">
                <label>Participants ({participants.length})</label>
                <div className="participants-list">
                  {participants.map((p) => (
                    <ParticipantBadge
                      key={p.user_id}
                      participant={p}
                      isYou={p.user_id === userId}
                    />
                  ))}
                </div>
              </div>

              <button className="leave-btn" onClick={handleLeave}>
                Leave Room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Presence indicators on top of page */}
      {isConnected && participants.length > 1 && (
        <div className="presence-bar">
          {participants
            .filter((p) => p.user_id !== userId)
            .map((p) => (
              <div
                key={p.user_id}
                className="presence-avatar"
                style={{ backgroundColor: p.color }}
                title={p.username}
              >
                {p.username.charAt(0).toUpperCase()}
              </div>
            ))}
        </div>
      )}
    </>
  );
}

function ParticipantBadge({
  participant,
  isYou,
}: {
  participant: Participant;
  isYou: boolean;
}) {
  return (
    <div className="participant-badge">
      <div
        className="participant-avatar"
        style={{ backgroundColor: participant.color }}
      >
        {participant.username.charAt(0).toUpperCase()}
      </div>
      <span className="participant-name">
        {participant.username}
        {isYou && <span className="you-badge">(you)</span>}
      </span>
      {participant.cursor && (
        <span className="editing-indicator" title="Currently editing">
          ✏️
        </span>
      )}
    </div>
  );
}
