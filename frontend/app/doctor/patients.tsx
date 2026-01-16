import { doctorAPI } from "@/services/api";
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

type Patient = {
    id: string;
    email: string;
    name: string;
    role: string;
    moodScore: number | null;
    moodCount: number;
};

export default function DoctorPatients() {
    const { user, isDoctor, isLoading: authLoading, isLoggedIn } = useAuth();
    const [myPatients, setMyPatients] = useState<Patient[]>([]);
    const [unassignedPatients, setUnassignedPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPatients = async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const data = await doctorAPI.getPatients();
            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }
            setMyPatients(data.myPatients || []);
            setUnassignedPatients(data.unassignedPatients || []);
        } catch (error: any) {
            Alert.alert("Eroare", "Nu s-au putut încărca pacienții.");
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
            
            fetchPatients();
        }, [authLoading, isLoggedIn])
    );

    const handleAssignPatient = async (patientId: string) => {
        setActionLoading(patientId);
        try {
            const data = await doctorAPI.assignPatient(patientId);
            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }
            Alert.alert("Succes", "Pacientul a fost alocat cu succes.");
            fetchPatients();
        } catch (error: any) {
            Alert.alert("Eroare", "Nu s-a putut aloca pacientul.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnassignPatient = async (patientId: string, patientName: string) => {
        // Use window.confirm on web since Alert.alert with buttons doesn't work
        const confirmed = typeof window !== 'undefined'
            ? window.confirm(`Ești sigur că vrei să dezaloci pacientul ${patientName}?`)
            : true;
        
        if (!confirmed) return;

        setActionLoading(patientId);
        try {
            const data = await doctorAPI.unassignPatient(patientId);
            if (data.error) {
                Alert.alert("Eroare", data.error);
                return;
            }
            Alert.alert("Succes", "Pacientul a fost dezalocat.");
            await fetchPatients();
        } catch (error: any) {
            Alert.alert("Eroare", "Nu s-a putut dezaloca pacientul.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewMoods = (patientId: string, patientName: string) => {
        router.push({
            pathname: "/doctor/patientMoods",
            params: { patientId, patientName },
        });
    };

    const getMoodColor = (score: number | null) => {
        if (score === null) return "#6b7280";
        if (score <= 3) return "#ef4444";
        if (score <= 5) return "#f59e0b";
        if (score <= 7) return "#84cc16";
        return "#22c55e";
    };

    const getMoodEmoji = (score: number | null) => {
        if (score === null) return "❓";
        if (score <= 2) return "😢";
        if (score <= 4) return "😟";
        if (score <= 6) return "😐";
        if (score <= 8) return "😊";
        return "😄";
    };

    const renderPatientCard = (patient: Patient, isMyPatient: boolean) => (
        <View key={patient.id} style={styles.patientCard}>
            <View style={styles.patientInfo}>
                <View style={styles.patientHeader}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <View
                        style={[
                            styles.moodBadge,
                            { backgroundColor: getMoodColor(patient.moodScore) },
                        ]}
                    >
                        <Text style={styles.moodEmoji}>
                            {getMoodEmoji(patient.moodScore)}
                        </Text>
                        <Text style={styles.moodScore}>
                            {patient.moodScore !== null
                                ? patient.moodScore.toFixed(1)
                                : "N/A"}
                        </Text>
                    </View>
                </View>
                <Text style={styles.patientEmail}>{patient.email}</Text>
                <Text style={styles.moodCount}>
                    {patient.moodCount} înregistrări de stare
                </Text>
            </View>

            <View style={styles.patientActions}>
                {isMyPatient ? (
                    <>
                        <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => handleViewMoods(patient.id, patient.name)}
                        >
                            <Text style={styles.viewButtonText}>Vezi istoric</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.unassignButton}
                            onPress={() => handleUnassignPatient(patient.id, patient.name)}
                            disabled={actionLoading === patient.id}
                        >
                            {actionLoading === patient.id ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.unassignButtonText}>Dezalocă</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.assignButton}
                        onPress={() => handleAssignPatient(patient.id)}
                        disabled={actionLoading === patient.id}
                    >
                        {actionLoading === patient.id ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.assignButtonText}>Alocă</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    // Show loading while auth is loading
    if (authLoading || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Se încarcă pacienții...</Text>
            </View>
        );
    }

    if (!isDoctor()) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>
                    Acces restricționat. Doar medicii pot accesa această pagină.
                </Text>
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
                    onRefresh={() => fetchPatients(true)}
                    tintColor="#6366f1"
                />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Pacienții mei</Text>
                <Text style={styles.subtitle}>
                    Bun venit, Dr. {user?.name?.split(" ").pop()}
                </Text>
            </View>

            {/* My Patients Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Pacienți alocați</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{myPatients.length}</Text>
                    </View>
                </View>
                {myPatients.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>👥</Text>
                        <Text style={styles.emptyText}>
                            Nu ai pacienți alocați momentan.
                        </Text>
                    </View>
                ) : (
                    myPatients.map((patient) => renderPatientCard(patient, true))
                )}
            </View>

            {/* Unassigned Patients Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Pacienți disponibili</Text>
                    <View style={[styles.badge, styles.badgeSecondary]}>
                        <Text style={styles.badgeText}>{unassignedPatients.length}</Text>
                    </View>
                </View>
                {unassignedPatients.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>✅</Text>
                        <Text style={styles.emptyText}>
                            Toți pacienții sunt alocați.
                        </Text>
                    </View>
                ) : (
                    unassignedPatients.map((patient) =>
                        renderPatientCard(patient, false)
                    )
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
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#f8fafc",
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "#94a3b8",
        marginTop: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#e2e8f0",
    },
    badge: {
        backgroundColor: "#6366f1",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
    },
    badgeSecondary: {
        backgroundColor: "#475569",
    },
    badgeText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    patientCard: {
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    patientInfo: {
        marginBottom: 16,
    },
    patientHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    patientName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#f8fafc",
        flex: 1,
    },
    moodBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    moodEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    moodScore: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    patientEmail: {
        fontSize: 14,
        color: "#94a3b8",
        marginBottom: 4,
    },
    moodCount: {
        fontSize: 13,
        color: "#64748b",
    },
    patientActions: {
        flexDirection: "row",
        gap: 12,
    },
    viewButton: {
        flex: 1,
        backgroundColor: "#3b82f6",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    viewButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    assignButton: {
        flex: 1,
        backgroundColor: "#22c55e",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    assignButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    unassignButton: {
        flex: 1,
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    unassignButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyState: {
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 32,
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
