"use client";
import React, { useState } from "react";
import { NewRoomModalProps } from "./types";
import Modal from "./Modal";
import styles from "./InputDesign.module.css";

const NewRoomModal: React.FC<NewRoomModalProps> = ({
  onClose,
  onCreateRoom,
}) => {
  const [name, setName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom(name, startTime, endTime);
    onClose();
  };

  return (
    <Modal title="Add New Room" onClose={onClose}>
      <form className={styles.modalForm} onSubmit={handleSubmit}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="room-name">
            Room Name
          </label>
          <input
            id="room-name"
            type="text"
            className={styles.formInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Active Period</label>
          <div className={styles.timeInputGroup}>
            <input
              type="time"
              className={styles.timeInput}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              aria-label="Start time"
            />
            <span className={styles.timeSeparator}>to</span>
            <input
              type="time"
              className={styles.timeInput}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              aria-label="End time"
            />
          </div>
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>
            Create Room
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewRoomModal;
