// app/workout/FinishWorkoutModal.tsx

import { X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { S } from "./workout.styles";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
};

export function FinishWorkoutModal({ visible, onClose, onConfirm, title, body, confirmLabel = "Finish" }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={S.modalOverlay} onPress={onClose} />
      <View style={S.modalSheet}>
        <View style={S.modalHeader}>
          <Text style={S.modalTitle}>{title}</Text>
          <Pressable onPress={onClose} style={S.modalX}>
            <X size={18} color="#111" />
          </Pressable>
        </View>

        <Text style={S.modalBody}>{body}</Text>

        <View style={S.modalActions}>
          <Pressable onPress={onClose} style={S.modalGhost}>
            <Text style={S.modalGhostText}>Keep logging</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={S.modalPrimary}>
            <Text style={S.modalPrimaryText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}