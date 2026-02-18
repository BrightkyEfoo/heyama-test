import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchObjects, getImageUrl } from "../lib/api";
import { socket } from "../lib/socket";
import type { ObjectItem, PaginatedResponse } from "../lib/types";

export default function ListScreen({ navigation }: any) {
  const [page, setPage] = useState(1);
  const queryClent = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ["objects", page],
    queryFn: () => fetchObjects(page),
  });

  useEffect(() => {
    const onCreated = (d: unknown) => {
      console.log("object:created", d);
      queryClent.invalidateQueries({ queryKey: ["objects"] });
    };
    const onDeleted = (d: unknown) => {
      console.log("object:deleted", d);
      queryClent.invalidateQueries({ queryKey: ["objects"] });
    };
    socket.on("object:created", onCreated);
    socket.on("object:deleted", onDeleted);
    return () => {
      socket.off("object:created", onCreated);
      socket.off("object:deleted", onDeleted);
    };
  }, [queryClent]);

  const renderItem = ({ item }: { item: ObjectItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Detail", { id: item._id })}
    >
      <Image source={{ uri: getImageUrl(item.imageUrl) }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.descripton ? (
          <Text style={styles.cardDesc} numberOfLines={1}>
            {item.descripton}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun objet pour le moment</Text>
        }
      />
      {data && data.totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={page <= 1}
            onPress={() => setPage(page - 1)}
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Precedent</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            {page} / {data.totalPages}
          </Text>
          <TouchableOpacity
            disabled={page >= data.totalPages}
            onPress={() => setPage(page + 1)}
            style={[styles.pageBtn, page >= data.totalPages && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 8 },
  row: { justifyContent: "space-between" },
  card: {
    flex: 1,
    height: 200,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: "100%" },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  cardTitle: { color: "#fff", fontWeight: "600", fontSize: 14 },
  cardDesc: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontSize: 13 },
  pageInfo: { fontSize: 13, color: "#888" },
});
