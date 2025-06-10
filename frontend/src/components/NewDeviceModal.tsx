"use client";
import React, { useState } from "react";
import { NewDeviceModalProps, DeviceType } from "./types";
import Modal from "./Modal";
import styles from "./InputDesign.module.css";

const NewDeviceModal: React.FC<NewDeviceModalProps> = ({
  onClose,
  onCreateDevice,
}) => {
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<DeviceType | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "") return;
    onCreateDevice(name, type as DeviceType);
    onClose();
  };

  return (
    <Modal title="Add New Device" onClose={onClose}>
      <form className={styles.modalForm} onSubmit={handleSubmit}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="device-name">
            Device Name
          </label>
          <input
            id="device-name"
            type="text"
            className={styles.formInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="device-type">
            Device Type
          </label>
          <select
            id="device-type"
            className={styles.formSelect}
            value={type}
            onChange={(e) => setType(e.target.value as DeviceType | "")}
            required
          >
            <option value="">Select type</option>
            <option value="bulb">Smart Bulb</option>
            <option value="sensor">Illuminance Sensor</option>
          </select>
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!name || !type}
          >
            Create Device
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewDeviceModal;
