import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";

import { MODIFIERS, ModifierId } from "@/constants/Modifiers";
import { useUser } from "@/contexts/UserContext";

interface Props {
  onUse: (modifier: ModifierId) => void;
}

export default function ModifierHUD({ onUse }: Props) {
  const { user } = useUser();
  const inventory: Record<ModifierId, number> =
    user?.inventory ??
    MODIFIERS.reduce(
      (acc, m) => ({ ...acc, [m.id]: 0 }),
      {} as Record<ModifierId, number>
    );

  const { width } = useWindowDimensions();
  const btnSize = Math.max(width / 8, 125);

  return (
    <View style={styles.container}>
      {MODIFIERS.map((mod) => {
        const count = inventory[mod.id] ?? 0;
        return (
          <Pressable
            key={mod.id}
            style={[
              styles.modifierBtn,
              { width: btnSize, minHeight: btnSize },
              count === 0 && styles.disabled,
            ]}
            onPress={() => count > 0 && onUse(mod.id)}
          >
            <Text style={styles.label}>{mod.label}</Text>
            <Text style={styles.count}>{count}</Text>
            <Text style={styles.description}>{mod.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "110%",
    marginTop: 0,
    paddingHorizontal: 8,
  },
  modifierBtn: {
    padding: 12,
    backgroundColor: "#2f95dc",
    borderRadius: 8,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  count: {
    color: "#fff",
    fontSize: 24,
  },
  description: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    opacity: 0.8,
    paddingHorizontal: 4,
  },
});
