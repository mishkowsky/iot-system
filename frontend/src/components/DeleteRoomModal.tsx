import React from "react";
import { DeleteRoomModalProps } from "./types";
import Modal from "./Modal";
import styles from "./InputDesign.module.css";

const DeleteRoomModal: React.FC<DeleteRoomModalProps> = ({
  room,
  onClose,
  onDeleteRoom,
}) => {
  const handleDelete = () => {
    onDeleteRoom(room.id);
    onClose();
  };

  return (
    <Modal title={`Delete ${room.name}`} onClose={onClose}>
      <div className={styles.modalContent}>
        <p className={styles.confirmationText}>
          Are you sure you want to delete this room? This action cannot be
          undone.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            Delete Room
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteRoomModal;
