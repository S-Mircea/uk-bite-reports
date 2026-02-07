import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "../hooks/useTheme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  style,
  textStyle,
}: ButtonProps) {
  const theme = useTheme();

  const bgColor = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    outline: "transparent",
    ghost: "transparent",
  }[variant];

  const textColor = {
    primary: "#FFFFFF",
    secondary: "#FFFFFF",
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
  }[variant];

  const borderColor = variant === "outline" ? theme.colors.primary : "transparent";

  const paddingV = { sm: 8, md: 14, lg: 18 }[size];
  const fontSize = { sm: theme.fontSize.sm, md: theme.fontSize.md, lg: theme.fontSize.lg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.textMuted : bgColor,
          borderColor,
          borderWidth: variant === "outline" ? 1.5 : 0,
          paddingVertical: paddingV,
          borderRadius: theme.borderRadius.md,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColor, fontSize },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: "600",
  },
});
