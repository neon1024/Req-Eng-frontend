import { moodsAPI } from "@/services/api";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";

type Mood = {
    emoji: string;
    rating: number;
    label: string;
};

type MoodEntry = {
    id: string;
    rate: number;
    date: string;
    createdAt: string;
    emoji: string;
};

const moodOptions: Mood[] = [
    { emoji: "😢", rating: 1, label: "Foarte rău" },
    { emoji: "😟", rating: 2, label: "Rău" },
    { emoji: "😔", rating: 3, label: "Trist" },
    { emoji: "😐", rating: 4, label: "Neutru" },
    { emoji: "🙂", rating: 5, label: "OK" },
    { emoji: "😊", rating: 6, label: "Bine" },
    { emoji: "😄", rating: 7, label: "Foarte bine" },
    { emoji: "😁", rating: 8, label: "Fericit" },
    { emoji: "🤩", rating: 9, label: "Excelent" },
    { emoji: "🥳", rating: 10, label: "Extraordinar" },
];

export default function DailyMood() {
    const { isPatient, user, isLoading: authLoading, isLoggedIn } = useAuth();
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [previousMoods, setPreviousMoods] = useState<MoodEntry[]>([]);
    const [todayMoodId, setTodayMoodId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getMoods = async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            console.log('[GetMoods] Fetching moods...');
            const data = await moodsAPI.getAll();
            console.log('[GetMoods] Response:', data);

            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }

            const mappedMoods: MoodEntry[] = data.moods.map((m: any) => {
                const match = moodOptions.find((o) => o.rating === m.rate);
                return { ...m, emoji: match ? match.emoji : "❓" };
            });

            setPreviousMoods(mappedMoods);

            if (data.todayTracked && data.todayMood) {
                console.log('[GetMoods] Today mood found:', data.todayMood.id);
                setTodayMoodId(data.todayMood.id);
                const todayMatch = moodOptions.find(
                    (o) => o.rating === data.todayMood.rate
                );
                if (todayMatch) setSelectedMood(todayMatch);
            } else {
                console.log('[GetMoods] No today mood');
                setTodayMoodId(null);
                setSelectedMood(null);
            }
        } catch (err: any) {
            console.error('[GetMoods] Error:', err);
            Alert.alert("Eroare", "Nu s-au putut încărca stările.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            // Wait for auth to finish loading
            if (authLoading) return;
            
            // Redirect if not logged in
            if (!isLoggedIn) {
                router.replace("/login");
                return;
            }
            
            // Redirect if not a patient
            if (!isPatient()) {
                router.replace("/");
                return;
            }
            
            getMoods();
        }, [authLoading, isLoggedIn])
    );

    const handleSelectMood = (mood: Mood) => setSelectedMood(mood);

    const handleSubmit = async () => {
        if (!selectedMood) {
            Alert.alert("Atenție", "Te rog selectează o stare înainte de a trimite!");
            return;
        }

        setIsSubmitting(true);

        try {
            let data;
            const isUpdate = !!todayMoodId;
            
            console.log(`[MoodSubmit] ${isUpdate ? 'Updating' : 'Adding'} mood with rate: ${selectedMood.rating}`);
            
            if (isUpdate) {
                // Update existing mood
                data = await moodsAPI.update(selectedMood.rating);
            } else {
                // Add new mood
                data = await moodsAPI.add(selectedMood.rating);
            }

            console.log('[MoodSubmit] Response:', data);

            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }

            Alert.alert(
                "Succes",
                isUpdate
                    ? `Starea a fost actualizată la ${selectedMood.emoji} (${selectedMood.rating}/10)`
                    : `Starea ${selectedMood.emoji} (${selectedMood.rating}/10) a fost înregistrată!`
            );

            await getMoods();
        } catch (err: any) {
            console.error('[MoodSubmit] Error:', err);
            const message = err.response?.data?.message || err.response?.data?.error || err.message || "Nu s-a putut salva starea.";
            Alert.alert("Eroare", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!todayMoodId) return;

        // Use window.confirm on web since Alert.alert with buttons doesn't work properly
        const confirmed = typeof window !== 'undefined' 
            ? window.confirm("Ești sigur că vrei să ștergi starea de azi?")
            : true;
        
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            console.log('[MoodDelete] Deleting today mood');
            const data = await moodsAPI.remove();
            console.log('[MoodDelete] Response:', data);
            
            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }
            Alert.alert("Succes", "Starea de azi a fost ștearsă.");
            setSelectedMood(null);
            setTodayMoodId(null);
            await getMoods();
        } catch (err: any) {
            console.error('[MoodDelete] Error:', err);
            const message = err.response?.data?.message || err.response?.data?.error || err.message || "Nu s-a putut șterge starea.";
            Alert.alert("Eroare", message);
        } finally {
            setIsDeleting(false);
        }
    };

    const getMoodColor = (rating: number) => {
        if (rating <= 3) return "#ef4444";
        if (rating <= 5) return "#f59e0b";
        if (rating <= 7) return "#84cc16";
        return "#22c55e";
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Azi";
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return "Ieri";
        }
        return date.toLocaleDateString("ro-RO", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    };

    // Show loading while auth is loading
    if (authLoading || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Se încarcă...</Text>
            </View>
        );
    }

    if (!isPatient()) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>🚫</Text>
                    <Text style={styles.errorText}>
                        Această funcție este disponibilă doar pentru pacienți.
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace("/")}
                    >
                        <Text style={styles.backButtonText}>Înapoi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => getMoods(true)}
                    tintColor="#6366f1"
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace("/")}>
                    <Text style={styles.backLink}>← Înapoi</Text>
                </TouchableOpacity>
                <Text style={styles.greeting}>Salut, {user?.name?.split(" ")[0]}!</Text>
                <Text style={styles.title}>Cum te simți azi?</Text>
            </View>

            {/* Today's Status */}
            {todayMoodId && (
                <View style={styles.todayStatus}>
                    <Text style={styles.todayStatusText}>
                        ✓ Ai înregistrat deja starea de azi
                    </Text>
                </View>
            )}

            {/* Mood Selector */}
            <View style={styles.moodSelector}>
                <View style={styles.moodGrid}>
                    {moodOptions.map((mood) => (
                        <TouchableOpacity
                            key={mood.rating}
                            style={[
                                styles.moodButton,
                                selectedMood?.rating === mood.rating &&
                                    styles.moodButtonSelected,
                            ]}
                            onPress={() => handleSelectMood(mood)}
                        >
                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                            <Text
                                style={[
                                    styles.moodRating,
                                    selectedMood?.rating === mood.rating &&
                                        styles.moodRatingSelected,
                                ]}
                            >
                                {mood.rating}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedMood && (
                    <View style={styles.selectedInfo}>
                        <Text style={styles.selectedEmoji}>{selectedMood.emoji}</Text>
                        <Text style={styles.selectedLabel}>{selectedMood.label}</Text>
                        <Text style={styles.selectedRating}>
                            {selectedMood.rating}/10
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!selectedMood || isSubmitting) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!selectedMood || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {todayMoodId ? "Actualizează starea" : "Înregistrează starea"}
                        </Text>
                    )}
                </TouchableOpacity>

                {todayMoodId && (
                    <TouchableOpacity
                        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                        onPress={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.deleteButtonText}>Șterge starea de azi</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Previous Moods */}
            <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Istoric stări</Text>
                
                {previousMoods.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📝</Text>
                        <Text style={styles.emptyText}>
                            Nu ai înregistrat încă nicio stare.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.historyList}>
                        {previousMoods.slice(0, 14).map((entry, index) => (
                            <View key={entry.id} style={styles.historyItem}>
                                <View
                                    style={[
                                        styles.historyIndicator,
                                        { backgroundColor: getMoodColor(entry.rate) },
                                    ]}
                                />
                                <Text style={styles.historyEmoji}>{entry.emoji}</Text>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyRate}>
                                        {entry.rate}/10
                                    </Text>
                                    <Text style={styles.historyDate}>
                                        {formatDate(entry.date)}
                                    </Text>
                                </View>
                                {index === 0 && entry.id === todayMoodId && (
                                    <View style={styles.todayBadge}>
                                        <Text style={styles.todayBadgeText}>Azi</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    content: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
    },
    loadingText: {
        color: "#94a3b8",
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        marginBottom: 24,
    },
    backLink: {
        color: "#6366f1",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: "#94a3b8",
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#f8fafc",
        marginTop: 4,
    },
    todayStatus: {
        backgroundColor: "#166534",
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    todayStatusText: {
        color: "#86efac",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    moodSelector: {
        backgroundColor: "#1e293b",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#334155",
    },
    moodGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
    },
    moodButton: {
        width: 60,
        height: 70,
        backgroundColor: "#334155",
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    moodButtonSelected: {
        backgroundColor: "#4f46e5",
        borderColor: "#818cf8",
    },
    moodEmoji: {
        fontSize: 28,
    },
    moodRating: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 2,
        fontWeight: "600",
    },
    moodRatingSelected: {
        color: "#fff",
    },
    selectedInfo: {
        alignItems: "center",
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#334155",
    },
    selectedEmoji: {
        fontSize: 56,
    },
    selectedLabel: {
        fontSize: 20,
        fontWeight: "700",
        color: "#f8fafc",
        marginTop: 8,
    },
    selectedRating: {
        fontSize: 16,
        color: "#6366f1",
        fontWeight: "600",
        marginTop: 4,
    },
    actions: {
        gap: 12,
        marginBottom: 32,
    },
    submitButton: {
        backgroundColor: "#6366f1",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: "#475569",
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    deleteButton: {
        backgroundColor: "#991b1b",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: "#fecaca",
        fontSize: 14,
        fontWeight: "600",
    },
    historySection: {
        marginTop: 8,
    },
    historyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#e2e8f0",
        marginBottom: 16,
    },
    historyList: {
        gap: 8,
    },
    historyItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1e293b",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#334155",
    },
    historyIndicator: {
        width: 5,
        height: "100%",
    },
    historyEmoji: {
        fontSize: 24,
        marginLeft: 14,
    },
    historyInfo: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    historyRate: {
        fontSize: 16,
        fontWeight: "600",
        color: "#f8fafc",
    },
    historyDate: {
        fontSize: 13,
        color: "#94a3b8",
        marginTop: 2,
    },
    todayBadge: {
        backgroundColor: "#6366f1",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 14,
    },
    todayBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    emptyState: {
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 40,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#334155",
        borderStyle: "dashed",
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        color: "#94a3b8",
        fontSize: 16,
        textAlign: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    errorEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorText: {
        color: "#94a3b8",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: "#6366f1",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
