import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { createObjet } from "../lib/api";

export default function CreateScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [descripton, setDescripton] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const mutation = useMutation({
    mutationFn: (fd: FormData) => createObjet(fd),
    onSuccess: () => {
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de creer l'objet");
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !image) return;
    const fd = new FormData();
    fd.append("title", title);
    if (descripton.trim()) fd.append("descripton", descripton);
    fd.append("image", {
      uri: image.uri,
      name: image.fileName || "photo.jpg",
      type: image.mimeType || "image/jpeg",
    } as any);
    mutation.mutate(fd);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Titre</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Titre de l'objet"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={descripton}
        onChangeText={setDescripton}
        placeholder="Description (optionel)"
        multiline
      />

      <Text style={styles.label}>Image</Text>
      {image ? (
        <View>
          <Image source={{ uri: image.uri }} style={styles.preview} />
          <TouchableOpacity onPress={() => setImage(null)} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Retirer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={pickImage} style={styles.dropzone}>
          <Text style={styles.dropzoneText}>Selectionner une image</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={mutation.isPending || !title.trim() || !image}
        style={[
          styles.submitBtn,
          (mutation.isPending || !title.trim() || !image) && styles.submitBtnDisabled,
        ]}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Creer</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  dropzone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 30,
    alignItems: "center",
  },
  dropzoneText: { color: "#888", fontSize: 14 },
  preview: { width: "100%", height: 160, borderRadius: 8, marginTop: 4 },
  clearBtn: { marginTop: 6, alignSelf: "flex-end" },
  clearBtnText: { color: "#e55", fontSize: 13 },
  submitBtn: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
