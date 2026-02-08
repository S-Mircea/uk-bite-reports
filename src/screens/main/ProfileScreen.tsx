import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { supabase } from "../../config/supabase";
import { CatchReport, RootStackParamList, User } from "../../types";
import { getUserReports, getUserProfile } from "../../utils/database";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../../components/Avatar";
import { ReportCard } from "../../components/ReportCard";
import { EmptyState } from "../../components/EmptyState";
import { LoadingScreen } from "../../components/LoadingScreen";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { user } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [reports, setReports] = useState<CatchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [profileData, reportsData] = await Promise.all([
        getUserProfile(user.id),
        getUserReports(user.id),
      ]);
      setProfile(profileData);
      setReports(reportsData);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  if (loading) return <LoadingScreen />;

  const displayName =
    profile?.display_name ?? user?.user_metadata?.display_name ?? "Angler";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onPress={() =>
              navigation.navigate("ReportDetail", { reportId: item.id })
            }
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Avatar
              uri={profile?.avatar_url}
              name={displayName}
              size={80}
            />
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {displayName}
            </Text>
            <Text style={[styles.email, { color: theme.colors.textMuted }]}>
              {user?.email}
            </Text>
            {profile?.postcode && (
              <View style={styles.postcodeRow}>
                <Ionicons name="location" size={14} color={theme.colors.textMuted} />
                <Text style={[styles.postcode, { color: theme.colors.textMuted }]}>
                  {profile.postcode}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.statsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.cardBorder,
                  borderRadius: theme.borderRadius.lg,
                },
                theme.shadow.sm,
              ]}
            >
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {reports.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                  Catches
                </Text>
              </View>
              <View
                style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {reports.reduce((sum, r) => sum + r.likes_count, 0)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                  Likes
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              style={[
                styles.logoutButton,
                {
                  borderColor: theme.colors.error,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.logoutText, { color: theme.colors.error }]}>
                Log Out
              </Text>
            </TouchableOpacity>

            <Text
              style={[styles.sectionTitle, { color: theme.colors.text }]}
            >
              My Catches
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="camera-outline"
            title="No catches yet"
            message="Your catch reports will appear here. Tap the Report tab to post your first catch!"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  postcodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  postcode: {
    fontSize: 13,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 20,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 28,
    marginBottom: 8,
  },
});
