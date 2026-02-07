import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { CatchReport, Comment as CommentType, RootStackParamList } from "../../types";
import {
  getReportById,
  getComments,
  addComment,
  toggleLike,
  hasUserLiked,
} from "../../utils/firestore";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../../components/Avatar";
import { LoadingScreen } from "../../components/LoadingScreen";
import {
  formatDate,
  formatWeight,
  formatLength,
} from "../../utils/formatting";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Route = RouteProp<RootStackParamList, "ReportDetail">;

export function ReportDetailScreen() {
  const route = useRoute<Route>();
  const theme = useTheme();
  const { user } = useAuth();

  const [report, setReport] = useState<CatchReport | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [reportData, commentsData] = await Promise.all([
        getReportById(route.params.reportId),
        getComments(route.params.reportId),
      ]);
      setReport(reportData);
      setComments(commentsData);

      if (user && reportData) {
        const isLiked = await hasUserLiked(reportData.id, user.uid);
        setLiked(isLiked);
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  }, [route.params.reportId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLike() {
    if (!user || !report) return;
    const nowLiked = await toggleLike(report.id, user.uid);
    setLiked(nowLiked);
    setReport((prev) =>
      prev
        ? { ...prev, likesCount: prev.likesCount + (nowLiked ? 1 : -1) }
        : prev
    );
  }

  async function handleSendComment() {
    if (!user || !report || !newComment.trim()) return;
    setSendingComment(true);
    try {
      await addComment({
        reportId: report.id,
        userId: user.uid,
        userName: user.displayName ?? "Angler",
        userAvatar: user.photoURL ?? undefined,
        text: newComment.trim(),
      });
      setNewComment("");
      // Refresh comments
      const updated = await getComments(report.id);
      setComments(updated);
      setReport((prev) =>
        prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev
      );
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setSendingComment(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (!report) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textMuted }}>Report not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Photo */}
        <Image
          source={{ uri: report.photoUrl }}
          style={styles.photo}
          resizeMode="cover"
        />

        {/* Header */}
        <View style={styles.body}>
          <View style={styles.userRow}>
            <Avatar uri={report.userAvatar} name={report.userName} size={44} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {report.userName}
              </Text>
              <Text style={[styles.date, { color: theme.colors.textMuted }]}>
                {formatDate(report.caughtAt)}
              </Text>
            </View>
          </View>

          {/* Species badge */}
          <View
            style={[
              styles.speciesBadge,
              { backgroundColor: theme.colors.secondary + "15" },
            ]}
          >
            <Ionicons name="fish" size={18} color={theme.colors.secondary} />
            <Text style={[styles.speciesText, { color: theme.colors.secondary }]}>
              {report.species}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatItem
              icon="scale-outline"
              label="Weight"
              value={formatWeight(report.weightLb, report.weightOz)}
              theme={theme}
            />
            <StatItem
              icon="resize-outline"
              label="Length"
              value={formatLength(report.lengthInches)}
              theme={theme}
            />
            <StatItem
              icon="location-outline"
              label="Location"
              value={report.locationName}
              theme={theme}
            />
          </View>

          {/* Notes */}
          {report.notes ? (
            <Text style={[styles.notes, { color: theme.colors.text }]}>
              {report.notes}
            </Text>
          ) : null}

          {/* Like / Comment counts */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={24}
                color={liked ? theme.colors.error : theme.colors.textMuted}
              />
              <Text style={[styles.actionCount, { color: theme.colors.textSecondary }]}>
                {report.likesCount}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color={theme.colors.textMuted} />
              <Text style={[styles.actionCount, { color: theme.colors.textSecondary }]}>
                {report.commentsCount}
              </Text>
            </View>
          </View>

          {/* Comments section */}
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Comments
          </Text>

          {comments.length === 0 ? (
            <Text style={[styles.noComments, { color: theme.colors.textMuted }]}>
              No comments yet. Be the first!
            </Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Avatar uri={c.userAvatar} name={c.userName} size={30} />
                <View style={styles.commentBody}>
                  <Text style={[styles.commentUser, { color: theme.colors.text }]}>
                    {c.userName}
                  </Text>
                  <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>
                    {c.text}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View
        style={[
          styles.commentBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text,
              borderRadius: theme.borderRadius.full,
            },
          ]}
          placeholder="Add a comment..."
          placeholderTextColor={theme.colors.placeholder}
          value={newComment}
          onChangeText={setNewComment}
          maxLength={300}
        />
        <TouchableOpacity
          onPress={handleSendComment}
          disabled={!newComment.trim() || sendingComment}
          style={[
            styles.sendButton,
            {
              backgroundColor: newComment.trim()
                ? theme.colors.primary
                : theme.colors.border,
              borderRadius: theme.borderRadius.full,
            },
          ]}
        >
          {sendingComment ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function StatItem({
  icon,
  label,
  value,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={statStyles.container}>
      <Ionicons name={icon} size={18} color={theme.colors.primary} />
      <Text style={[statStyles.label, { color: theme.colors.textMuted }]}>
        {label}
      </Text>
      <Text
        style={[statStyles.value, { color: theme.colors.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingBottom: 16,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: "#E0E0E0",
  },
  body: {
    padding: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  speciesBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  speciesText: {
    fontWeight: "700",
    fontSize: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  notes: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionCount: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  noComments: {
    fontSize: 14,
    fontStyle: "italic",
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 10,
  },
  commentBody: {
    flex: 1,
  },
  commentUser: {
    fontWeight: "600",
    fontSize: 13,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  commentBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    borderTopWidth: 1,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
