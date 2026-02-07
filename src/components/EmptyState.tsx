import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={theme.colors.textMuted} />
      <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.lg }]}>
        {title}
      </Text>
      <Text
        style={[styles.message, { color: theme.colors.textMuted, fontSize: theme.fontSize.md }]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 300,
  },
  title: {
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
});
