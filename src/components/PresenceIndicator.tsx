import React from "react";

interface Person {
  id: string;
  name: string;
  isHome: boolean;
  avatar?: string;
}

interface PresenceIndicatorProps {
  people: Person[];
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ people }) => {
  return (
    <div className="presence-indicator">
      {people.map((person) => (
        <div key={person.id} className="person-avatar">
          <div className="avatar-container">
            {person.avatar ? (
              <img
                src={person.avatar}
                alt={person.name}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {person.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div
            className={`home-status ${person.isHome ? "home" : "away"}`}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default PresenceIndicator;
