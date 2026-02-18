import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchObjet, deleteObjet, getImageUrl } from "../lib/api";
import { socket } from "../lib/socket";

export default function DetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const queryClent = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: obj, isLoading } = useQuery({
    queryKey: ["object", id],
    queryFn: () => fetchObjet(id),
  });

  const deleteMutaion = useMutation({
    mutationFn: () => deleteObjet(id),
    onSuccess: () => {
      queryClent.invalidateQueries({ queryKey: ["objects"] });
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de supprimer l'objet");
    },
  });

  useEffect(() => {
    const onDeleted = (payload: { id: string }) => {
      console.log("object:deleted", payload);
      if (payload.id === id) {
        queryClent.invalidateQueries({ queryKey: ["objects"] });
        navigation.goBack();
      }
    };
    socket.on("object:deleted", onDeleted);
    return () => {
      socket.off("object:deleted", onDeleted);
    };
  }, [id, queryClent, navigation]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!obj) {
    return (
      <View style={styles.center}>
        <Text>Objet introuvable</Text>
      </View>
    );
  }

  const formatedDate = new Date(obj.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: getImageUrl(obj.imageUrl) }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{obj.title}</Text>
        {obj.descripton ? (
          <Text style={styles.description}>{obj.descripton}</Text>
        ) : null}
        <Text style={styles.date}>{formatedDate}</Text>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setShowDeleteModal(true)}
        >
          <Text style={styles.deleteBtnText}>Supprimer</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            <Text style={styles.modalText}>
              Etes-vous sur de vouloir supprimer cet objet ?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                disabled={deleteMutaion.isPending}
                onPress={() => deleteMutaion.mutate()}
              >
                {deleteMutaion.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 280 },
  content: {
    marginTop: -16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: "700" },
  description: { fontSize: 15, color: "#555", marginTop: 8 },
  date: { fontSize: 13, color: "#999", marginTop: 8 },
  deleteBtn: {
    backgroundColor: "#e55",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  deleteBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
  },
  modalTitle: { fontSize: 17, fontWeight: "600", marginBottom: 8 },
  modalText: { fontSize: 14, color: "#666", marginBottom: 20 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#e55",
  },
  modalConfirmText: { color: "#fff", fontWeight: "600" },
});
