import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DocumentSnapshot } from "firebase/firestore";

import { CatchReport, RootStackParamList } from "../../types";
import { getReports } from "../../utils/firestore";
import { useTheme } from "../../hooks/useTheme";
import { ReportCard } from "../../components/ReportCard";
import { EmptyState } from "../../components/EmptyState";
import { LoadingScreen } from "../../components/LoadingScreen";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

  const [reports, setReports] = useState<CatchReport[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchReports = useCallback(async (refresh = false) => {
    try {
      const cursor = refresh ? undefined : lastDoc ?? undefined;
      const { reports: newReports, lastVisible } = await getReports(
        refresh ? undefined : (cursor as DocumentSnapshot | undefined)
      );

      if (refresh) {
        setReports(newReports);
      } else {
        setReports((prev) => [...prev, ...newReports]);
      }

      setLastDoc(lastVisible);
      setHasMore(newReports.length >= 10);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  }, [lastDoc]);

  useEffect(() => {
    (async () => {
      await fetchReports(true);
      setLoading(false);
    })();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastDoc(null);
    await fetchReports(true);
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchReports(false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, fetchReports]);

  if (loading) return <LoadingScreen />;

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
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            icon="fish-outline"
            title="No catches yet"
            message="Be the first to post a catch report! Tap the Report tab to get started."
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.footer}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  footer: {
    paddingVertical: 20,
  },
});
