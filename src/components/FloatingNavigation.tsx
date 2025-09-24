import React from "react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface FloatingNavigationProps {
  items: NavigationItem[];
  onItemClick: (itemId: string) => void;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  items,
  onItemClick,
}) => {
  return (
    <div className="floating-navigation">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${item.isActive ? "active" : ""}`}
          onClick={() => onItemClick(item.id)}
        >
          <div className="nav-icon">{item.icon}</div>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FloatingNavigation;
