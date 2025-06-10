import React from "react";
import { FloorSelectorProps } from "./types";
import styles from "./InputDesign.module.css";

const FloorSelector: React.FC<FloorSelectorProps> = ({
  floors,
  selectedFloor,
  onFloorChange,
}) => {
  return (
    <select
      className={styles.floorSelector}
      value={selectedFloor || ""}
      onChange={(e) => onFloorChange(Number(e.target.value))}
      aria-label="Select floor"
    >
      {!selectedFloor && <option value="">Select a floor</option>}
      {floors?.map((floor) => (
        <option key={floor.id} value={floor.id}>
          {floor.name}
        </option>
      ))}
    </select>
  );
};

export default FloorSelector;
