import React from "react";

interface AreaSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const AreaSection: React.FC<AreaSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`area-section ${className}`}>
      <div className="area-header">
        <h2 className="area-title">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default AreaSection;
