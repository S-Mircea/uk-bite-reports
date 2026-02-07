import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  updateDoc,
  increment,
  deleteDoc,
  DocumentSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import { CatchReport, Comment, User } from "../types";
import { v4 as uuidv4 } from "uuid";

const REPORTS_COLLECTION = "reports";
const USERS_COLLECTION = "users";
const COMMENTS_COLLECTION = "comments";
const LIKES_COLLECTION = "likes";
const PAGE_SIZE = 10;

// ─── User ───────────────────────────────────────────────────────────────

export async function createUserProfile(user: User): Promise<void> {
  await setDoc(doc(db, USERS_COLLECTION, user.uid), user);
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as User) : null;
}

// ─── Upload Image ───────────────────────────────────────────────────────

export async function uploadImage(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      null,
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

// ─── Reports ────────────────────────────────────────────────────────────

export async function createReport(
  data: Omit<CatchReport, "id" | "createdAt" | "likesCount" | "commentsCount">
): Promise<string> {
  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    likesCount: 0,
    commentsCount: 0,
  });
  return docRef.id;
}

export async function getReports(
  lastDoc?: DocumentSnapshot
): Promise<{ reports: CatchReport[]; lastVisible: DocumentSnapshot | null }> {
  let q = query(
    collection(db, REPORTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE)
  );

  if (lastDoc) {
    q = query(
      collection(db, REPORTS_COLLECTION),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );
  }

  const snapshot = await getDocs(q);
  const reports = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as CatchReport[];

  const lastVisible =
    snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

  return { reports, lastVisible };
}

export async function getReportById(
  id: string
): Promise<CatchReport | null> {
  const snap = await getDoc(doc(db, REPORTS_COLLECTION, id));
  return snap.exists()
    ? ({ id: snap.id, ...snap.data() } as CatchReport)
    : null;
}

export async function getUserReports(
  userId: string
): Promise<CatchReport[]> {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as CatchReport[];
}

export async function getAllReportsForMap(): Promise<CatchReport[]> {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(200)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as CatchReport[];
}

// ─── Likes ──────────────────────────────────────────────────────────────

export async function toggleLike(
  reportId: string,
  userId: string
): Promise<boolean> {
  const likeId = `${reportId}_${userId}`;
  const likeRef = doc(db, LIKES_COLLECTION, likeId);
  const likeSnap = await getDoc(likeRef);

  const reportRef = doc(db, REPORTS_COLLECTION, reportId);

  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(reportRef, { likesCount: increment(-1) });
    return false;
  } else {
    await setDoc(likeRef, {
      reportId,
      userId,
      createdAt: Timestamp.now(),
    });
    await updateDoc(reportRef, { likesCount: increment(1) });
    return true;
  }
}

export async function hasUserLiked(
  reportId: string,
  userId: string
): Promise<boolean> {
  const likeId = `${reportId}_${userId}`;
  const snap = await getDoc(doc(db, LIKES_COLLECTION, likeId));
  return snap.exists();
}

// ─── Comments ───────────────────────────────────────────────────────────

export async function addComment(
  comment: Omit<Comment, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
    ...comment,
    createdAt: Timestamp.now(),
  });

  const reportRef = doc(db, REPORTS_COLLECTION, comment.reportId);
  await updateDoc(reportRef, { commentsCount: increment(1) });

  return docRef.id;
}

export async function getComments(reportId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("reportId", "==", reportId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Comment[];
}
