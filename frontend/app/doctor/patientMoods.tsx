import { doctorAPI } from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
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

type MoodEntry = {
    id: string;
    rate: number;
    date: string;
};

type PatientInfo = {
    id: string;
    name: string;
    email: string;
};

const moodEmojis: { [key: number]: string } = {
    1: "😢",
    2: "😟",
    3: "😐",
    4: "😏",
    5: "😊",
    6: "😄",
    7: "😁",
    8: "😍",
    9: "🤩",
    10: "🤯",
};

export default function PatientMoods() {
    const { patientId, patientName } = useLocalSearchParams<{
        patientId: string;
        patientName: string;
    }>();
    const { isDoctor, isLoading: authLoading, isLoggedIn } = useAuth();

    const [patient, setPatient] = useState<PatientInfo | null>(null);
    const [moods, setMoods] = useState<MoodEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchMoods = async (showRefresh = false) => {
        if (!patientId) return;

        if (showRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const data = await doctorAPI.getPatientMoods(patientId);
            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }
            setPatient(data.patient);
            setMoods(data.moods || []);
        } catch (error: any) {
            const message = error.response?.data?.message || "Nu s-au putut încărca datele pacientului.";
            Alert.alert("Eroare", message);
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
            
            // Redirect if not a doctor
            if (!isDoctor()) {
                router.replace("/");
                return;
            }
            
            if (patientId) {
                fetchMoods();
            }
        }, [authLoading, isLoggedIn, patientId])
    );

    const getMoodColor = (rate: number) => {
        if (rate <= 3) return "#ef4444";
        if (rate <= 5) return "#f59e0b";
        if (rate <= 7) return "#84cc16";
        return "#22c55e";
    };

    const getAverageMood = () => {
        if (moods.length === 0) return null;
        const sum = moods.reduce((acc, mood) => acc + mood.rate, 0);
        return (sum / moods.length).toFixed(1);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ro-RO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getWeekStats = () => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekMoods = moods.filter(m => new Date(m.date) >= oneWeekAgo);
        
        if (weekMoods.length === 0) return { count: 0, avg: null };
        
        const sum = weekMoods.reduce((acc, m) => acc + m.rate, 0);
        return {
            count: weekMoods.length,
            avg: (sum / weekMoods.length).toFixed(1),
        };
    };

    // Show loading while auth is loading
    if (authLoading || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Se încarcă istoricul...</Text>
            </View>
        );
    }

    if (!isDoctor()) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>
                    Acces restricționat.
                </Text>
            </View>
        );
    }

    const averageMood = getAverageMood();
    const weekStats = getWeekStats();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => fetchMoods(true)}
                    tintColor="#6366f1"
                />
            }
        >
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/doctor/patients")}
            >
                <Text style={styles.backButtonText}>← Înapoi</Text>
            </TouchableOpacity>

            {/* Patient Header */}
            <View style={styles.header}>
                <Text style={styles.patientName}>
                    {patient?.name || patientName}
                </Text>
                <Text style={styles.patientEmail}>{patient?.email}</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {averageMood ? moodEmojis[Math.round(parseFloat(averageMood))] || "📊" : "—"}
                    </Text>
                    <Text style={styles.statLabel}>Media generală</Text>
                    <Text style={styles.statNumber}>{averageMood || "N/A"}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{moods.length}</Text>
                    <Text style={styles.statLabel}>Total înregistrări</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {weekStats.avg || "—"}
                    </Text>
                    <Text style={styles.statLabel}>Media săptămânală</Text>
                    <Text style={styles.statNumber}>{weekStats.count} zile</Text>
                </View>
            </View>

            {/* Mood History */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Istoric stări</Text>
                
                {moods.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📭</Text>
                        <Text style={styles.emptyText}>
                            Pacientul nu are înregistrări de stare.
                        </Text>
                    </View>
                ) : (
                    moods.map((mood, index) => (
                        <View key={mood.id} style={styles.moodCard}>
                            <View
                                style={[
                                    styles.moodIndicator,
                                    { backgroundColor: getMoodColor(mood.rate) },
                                ]}
                            />
                            <View style={styles.moodContent}>
                                <View style={styles.moodHeader}>
                                    <Text style={styles.moodEmoji}>
                                        {moodEmojis[mood.rate] || "❓"}
                                    </Text>
                                    <Text style={styles.moodRate}>{mood.rate}/10</Text>
                                </View>
                                <Text style={styles.moodDate}>
                                    {formatDate(mood.date)}
                                </Text>
                            </View>
                            {index === 0 && (
                                <View style={styles.latestBadge}>
                                    <Text style={styles.latestBadgeText}>Ultima</Text>
                                </View>
                            )}
                        </View>
                    ))
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
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        color: "#6366f1",
        fontSize: 16,
        fontWeight: "600",
    },
    header: {
        marginBottom: 24,
    },
    patientName: {
        fontSize: 28,
        fontWeight: "800",
        color: "#f8fafc",
    },
    patientEmail: {
        fontSize: 16,
        color: "#94a3b8",
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#334155",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#f8fafc",
    },
    statLabel: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 4,
        textAlign: "center",
    },
    statNumber: {
        fontSize: 14,
        color: "#6366f1",
        fontWeight: "600",
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#e2e8f0",
        marginBottom: 16,
    },
    moodCard: {
        flexDirection: "row",
        backgroundColor: "#1e293b",
        borderRadius: 12,
        marginBottom: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#334155",
    },
    moodIndicator: {
        width: 6,
    },
    moodContent: {
        flex: 1,
        padding: 16,
    },
    moodHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    moodEmoji: {
        fontSize: 24,
    },
    moodRate: {
        fontSize: 18,
        fontWeight: "700",
        color: "#f8fafc",
    },
    moodDate: {
        fontSize: 14,
        color: "#94a3b8",
        marginTop: 4,
        textTransform: "capitalize",
    },
    latestBadge: {
        backgroundColor: "#6366f1",
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: "center",
        marginRight: 12,
        borderRadius: 20,
    },
    latestBadgeText: {
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
    errorText: {
        color: "#ef4444",
        fontSize: 16,
        textAlign: "center",
        marginTop: 100,
    },
});
