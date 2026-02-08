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

import { CatchReport, RootStackParamList } from "../../types";
import { getReports } from "../../utils/database";
import { useTheme } from "../../hooks/useTheme";
import { ReportCard } from "../../components/ReportCard";
import { EmptyState } from "../../components/EmptyState";
import { LoadingScreen } from "../../components/LoadingScreen";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

  const [reports, setReports] = useState<CatchReport[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchReports = useCallback(async (pageNum: number, refresh = false) => {
    try {
      const { reports: newReports, hasMore: more } = await getReports(pageNum);

      if (refresh) {
        setReports(newReports);
      } else {
        setReports((prev) => [...prev, ...newReports]);
      }

      setHasMore(more);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchReports(0, true);
      setLoading(false);
    })();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports(0, true);
    setRefreshing(false);
  }, [fetchReports]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchReports(page + 1, false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, fetchReports]);

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
