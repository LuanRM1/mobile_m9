import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

import { useUser } from "@/contexts/UserContext";

export default function NicknameScreen() {
  const { setNick, loading } = useUser();
  const [nickInput, setNickInput] = useState("");
  const router = useRouter();

  const handleConfirm = async () => {
    if (!nickInput.trim()) return;
    await setNick(nickInput.trim());
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Escolha seu Nick</Text>
      <TextInput
        value={nickInput}
        onChangeText={setNickInput}
        placeholder="Seu nick"
        style={styles.input}
        autoCapitalize="none"
      />
      <Button
        title={loading ? "Carregando..." : "Confirmar"}
        onPress={handleConfirm}
        disabled={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  input: {
    width: "50%",
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 12,
    fontSize: 18,
  },
});
