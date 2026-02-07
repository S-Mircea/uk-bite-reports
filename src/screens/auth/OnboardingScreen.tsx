import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackParamList } from "../../types";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../../components/Button";

type Nav = NativeStackNavigationProp<RootStackParamList, "Onboarding">;

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={["#0B1D33", "#1A5276", "#148F77"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="fish" size={80} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>UK Bite Reports</Text>
        <Text style={styles.subtitle}>
          Share your catches with the UK angling community
        </Text>

        <View style={styles.features}>
          <FeatureItem
            icon="camera-outline"
            text="Post your catch with photos"
          />
          <FeatureItem
            icon="map-outline"
            text="Discover fishing spots on the map"
          />
          <FeatureItem
            icon="people-outline"
            text="Connect with local anglers"
          />
        </View>

        <View style={styles.ukBadge}>
          <Text style={styles.ukFlag}>🇬🇧</Text>
          <Text style={styles.ukText}>UK anglers only</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate("Signup")}
          variant="primary"
          size="lg"
          style={{ backgroundColor: "#2ECC71", marginBottom: 12 }}
        />
        <Button
          title="I already have an account"
          onPress={() => navigation.navigate("Login")}
          variant="ghost"
          size="md"
          textStyle={{ color: "#FFFFFF" }}
        />
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color="#2ECC71" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    alignSelf: "stretch",
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(46,204,113,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
  },
  ukBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  ukFlag: {
    fontSize: 18,
  },
  ukText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },
  buttons: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
});
