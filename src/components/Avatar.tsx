import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const theme = useTheme();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.secondary,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          { fontSize: size * 0.4, color: "#FFFFFF" },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#E0E0E0",
  },
  fallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontWeight: "700",
  },
});
