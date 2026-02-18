import { useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { socket } from "./src/lib/socket";
import ListScreen from "./src/screens/ListScreen";
import CreateScreen from "./src/screens/CreateScreen";
import DetailScreen from "./src/screens/DetailScreen";

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="List"
            component={ListScreen}
            options={({ navigation }: any) => ({
              title: "Liste des objets",
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate("Create")}>
                  <Text style={{ fontSize: 15, fontWeight: "600" }}>+ Creer</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="Create"
            component={CreateScreen}
            options={{ title: "Nouvel objet" }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{ title: "Detail" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
