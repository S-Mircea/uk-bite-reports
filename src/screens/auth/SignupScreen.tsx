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

import { supabase } from "../../config/supabase";
import { RootStackParamList } from "../../types";
import { signupSchema } from "../../utils/validation";
import { createUserProfile } from "../../utils/database";
import { useTheme } from "../../hooks/useTheme";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

type Nav = NativeStackNavigationProp<RootStackParamList, "Signup">;

export function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [postcode, setPostcode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setErrors({});
    const result = signupSchema.safeParse({ displayName, email, password, postcode });

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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await createUserProfile({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          display_name: displayName.trim(),
          postcode: postcode.trim().toUpperCase(),
        });
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.message?.includes("already registered")) {
        Alert.alert("Email In Use", "An account with this email already exists.");
      } else {
        Alert.alert("Error", err.message || "Something went wrong. Please try again.");
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
          Join the community
        </Text>
        <Text
          style={[styles.subheading, { color: theme.colors.textMuted, fontSize: theme.fontSize.md }]}
        >
          Create your UK Bite Reports account
        </Text>

        <View style={styles.form}>
          <Input
            label="Display Name"
            icon="person-outline"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="e.g. FishingDave"
            error={errors.displayName}
          />
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
            placeholder="At least 6 characters"
            isPassword
            error={errors.password}
          />
          <Input
            label="UK Postcode"
            icon="location-outline"
            value={postcode}
            onChangeText={setPostcode}
            placeholder="e.g. SW1A 1AA"
            autoCapitalize="characters"
            error={errors.postcode}
          />

          <Text style={[styles.ukNote, { color: theme.colors.textMuted, fontSize: theme.fontSize.xs }]}>
            UK postcode required - this app is for UK anglers only
          </Text>

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            size="lg"
            style={{ marginTop: 8 }}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.switchLink}
        >
          <Text style={[styles.switchText, { color: theme.colors.textMuted }]}>
            Already have an account?{" "}
            <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
              Log in
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
  },
  heading: {
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 12,
  },
  subheading: {
    marginBottom: 28,
  },
  form: {},
  ukNote: {
    marginBottom: 16,
    marginTop: -4,
  },
  switchLink: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  switchText: {
    fontSize: 14,
  },
});
