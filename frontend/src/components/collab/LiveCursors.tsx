// Live Cursors - Shows other participants' cursors on the circuit
import { useCollabStore } from '../../stores/collabStore';
import './LiveCursors.css';

export function LiveCursors() {
  const { participants, userId, isConnected } = useCollabStore();

  if (!isConnected) return null;

  const otherParticipants = participants.filter(
    (p) => p.user_id !== userId && p.cursor
  );

  if (otherParticipants.length === 0) return null;

  return (
    <div className="live-cursors-container">
      {otherParticipants.map((p) => (
        p.cursor && (
          <div
            key={p.user_id}
            className="live-cursor"
            style={{
              left: p.cursor.x,
              top: p.cursor.y,
              '--cursor-color': p.color,
            } as React.CSSProperties}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: p.color }}
            >
              <path
                d="M5.65376 12.4563L10.6826 7.42744L14.3469 15.1898L11.7188 16.8562L13.1561 20.8152L10.7246 21.6953L9.28735 17.7363L5.65376 12.4563Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
            <span
              className="cursor-label"
              style={{ backgroundColor: p.color }}
            >
              {p.username}
            </span>
          </div>
        )
      ))}
    </div>
  );
}

// Hook to track and send cursor position
export function useCollabCursor(containerRef: React.RefObject<HTMLElement>) {
  const { isConnected, sendCursorMove } = useCollabStore();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isConnected || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Throttle cursor updates
    sendCursorMove({ x, y });
  };

  return { handleMouseMove };
}
