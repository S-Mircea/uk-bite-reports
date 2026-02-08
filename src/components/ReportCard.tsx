import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CatchReport } from "../types";
import { useTheme } from "../hooks/useTheme";
import { Avatar } from "./Avatar";
import { formatTimeAgo, formatWeight } from "../utils/formatting";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ReportCardProps {
  report: CatchReport;
  onPress: () => void;
}

export function ReportCard({ report, onPress }: ReportCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.cardBorder,
          borderRadius: theme.borderRadius.lg,
        },
        theme.shadow.md,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar uri={report.user_avatar} name={report.user_name} size={36} />
        <View style={styles.headerText}>
          <Text
            style={[styles.userName, { color: theme.colors.text, fontSize: theme.fontSize.md }]}
          >
            {report.user_name}
          </Text>
          <Text
            style={[styles.time, { color: theme.colors.textMuted, fontSize: theme.fontSize.xs }]}
          >
            {formatTimeAgo(report.created_at)}
          </Text>
        </View>
        <View
          style={[
            styles.speciesBadge,
            { backgroundColor: theme.colors.secondary + "20", borderRadius: theme.borderRadius.sm },
          ]}
        >
          <Text
            style={[styles.speciesText, { color: theme.colors.secondary, fontSize: theme.fontSize.xs }]}
          >
            {report.species}
          </Text>
        </View>
      </View>

      {/* Photo */}
      <Image source={{ uri: report.photo_url }} style={styles.photo} resizeMode="cover" />

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
          <Text
            style={[styles.detailText, { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }]}
            numberOfLines={1}
          >
            {report.location_name}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="scale-outline" size={14} color={theme.colors.textMuted} />
          <Text
            style={[styles.detailText, { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }]}
          >
            {formatWeight(report.weight_lb, report.weight_oz)}
          </Text>
        </View>

        {report.notes ? (
          <Text
            style={[styles.notes, { color: theme.colors.text, fontSize: theme.fontSize.sm }]}
            numberOfLines={2}
          >
            {report.notes}
          </Text>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.actionItem}>
            <Ionicons name="heart-outline" size={18} color={theme.colors.textMuted} />
            <Text style={[styles.actionCount, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>
              {report.likes_count}
            </Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textMuted} />
            <Text style={[styles.actionCount, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>
              {report.comments_count}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontWeight: "600",
  },
  time: {},
  speciesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  speciesText: {
    fontWeight: "600",
  },
  photo: {
    width: "100%",
    height: SCREEN_WIDTH * 0.65,
    backgroundColor: "#E0E0E0",
  },
  details: {
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  detailText: {},
  notes: {
    marginTop: 6,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 16,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {},
});
