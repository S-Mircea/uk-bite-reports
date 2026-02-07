import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../../config/firebase";
import { RootStackParamList } from "../../types";
import { loginSchema } from "../../utils/validation";
import { useTheme } from "../../hooks/useTheme";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

type Nav = NativeStackNavigationProp<RootStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setErrors({});
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      const code = err.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        Alert.alert("Login Failed", "Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        Alert.alert("Too Many Attempts", "Please wait a moment and try again.");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: theme.colors.text, fontSize: theme.fontSize.xxl }]}>
          Welcome back
        </Text>
        <Text
          style={[styles.subheading, { color: theme.colors.textMuted, fontSize: theme.fontSize.md }]}
        >
          Log in to see the latest catches
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="angler@example.co.uk"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            isPassword
            error={errors.password}
          />

          <Button
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={{ marginTop: 8 }}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Signup")}
          style={styles.switchLink}
        >
          <Text style={[styles.switchText, { color: theme.colors.textMuted }]}>
            Don't have an account?{" "}
            <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
              Sign up
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  heading: {
    fontWeight: "700",
    marginBottom: 4,
  },
  subheading: {
    marginBottom: 32,
  },
  form: {},
  switchLink: {
    alignItems: "center",
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
  },
});
