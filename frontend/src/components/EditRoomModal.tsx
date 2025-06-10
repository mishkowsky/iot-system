"use client";
import React, { useState } from "react";
import { EditRoomModalProps } from "./types";
import Modal from "./Modal";
import styles from "./InputDesign.module.css";

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  room,
  onClose,
  onUpdateRoom,
}) => {
  const [name, setName] = useState<string>(room.name);
  const [startTime, setStartTime] = useState<string>(room.start_time);
  const [endTime, setEndTime] = useState<string>(room.end_time);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRoom(room.id, name, startTime, endTime);
    onClose();
  };

  return (
    <Modal title="Edit Room" onClose={onClose}>
      <form className={styles.modalForm} onSubmit={handleSubmit}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="edit-room-name">
            Room Name
          </label>
          <input
            id="edit-room-name"
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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditRoomModal;
