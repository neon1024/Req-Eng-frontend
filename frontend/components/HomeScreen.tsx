import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
    const { isLoggedIn, isLoading, user, isDoctor, isPatient } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (!isLoggedIn) {
        return (
            <View style={styles.container}>
                <View style={styles.welcomeSection}>
                    <Text style={styles.logo}>🧠</Text>
                    <Text style={styles.appTitle}>MindTrack</Text>
                    <Text style={styles.appSubtitle}>
                        Monitorizează-ți sănătatea emoțională
                    </Text>
                </View>

                <View style={styles.featuresSection}>
                    <View style={styles.featureCard}>
                        <Text style={styles.featureEmoji}>📊</Text>
                        <Text style={styles.featureTitle}>Urmărire zilnică</Text>
                        <Text style={styles.featureText}>
                            Înregistrează starea ta zilnic și observă tendințele
                        </Text>
                    </View>

                    <View style={styles.featureCard}>
                        <Text style={styles.featureEmoji}>👨‍⚕️</Text>
                        <Text style={styles.featureTitle}>Conexiune cu doctorul</Text>
                        <Text style={styles.featureText}>
                            Medicul tău poate vedea evoluția ta în timp
                        </Text>
                    </View>

                    <View style={styles.featureCard}>
                        <Text style={styles.featureEmoji}>🔒</Text>
                        <Text style={styles.featureTitle}>Confidențial</Text>
                        <Text style={styles.featureText}>
                            Datele tale sunt protejate și private
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push("/login")}
                >
                    <Text style={styles.loginButtonText}>Autentificare</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Logged in - show role-based content
    if (isDoctor()) {
        return <DoctorHome userName={user?.name || ""} />;
    }

    return <PatientHome userName={user?.name || ""} />;
}

// Patient Home Component
function PatientHome({ userName }: { userName: string }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    Bună, {userName.split(" ")[0]}! 👋
                </Text>
                <Text style={styles.subtitle}>
                    Cum te simți astăzi?
                </Text>
            </View>

            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => router.push("/dailyMood")}
                >
                    <Text style={styles.primaryActionEmoji}>😊</Text>
                    <Text style={styles.primaryActionTitle}>Starea zilnică</Text>
                    <Text style={styles.primaryActionText}>
                        Înregistrează cum te simți
                    </Text>
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                    <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => Alert.alert("În curând", "Această funcție va fi disponibilă în curând.")}
                    >
                        <Text style={styles.secondaryEmoji}>📔</Text>
                        <Text style={styles.secondaryTitle}>Jurnal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => Alert.alert("În curând", "Această funcție va fi disponibilă în curând.")}
                    >
                        <Text style={styles.secondaryEmoji}>🧘</Text>
                        <Text style={styles.secondaryTitle}>Exerciții</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.emergencyButton}
                onPress={() => Alert.alert("Ajutor de urgență", "Dacă ai nevoie de ajutor urgent, contactează serviciile de urgență sau linia de criză.")}
            >
                <Text style={styles.emergencyEmoji}>🆘</Text>
                <Text style={styles.emergencyText}>Ajutor de urgență</Text>
            </TouchableOpacity>
        </View>
    );
}

// Doctor Home Component
function DoctorHome({ userName }: { userName: string }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    Bună ziua, Dr. {userName.split(" ").pop()}! 👋
                </Text>
                <Text style={styles.subtitle}>
                    Monitorizează pacienții tăi
                </Text>
            </View>

            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => router.push("/doctor/patients")}
                >
                    <Text style={styles.primaryActionEmoji}>👥</Text>
                    <Text style={styles.primaryActionTitle}>Pacienții mei</Text>
                    <Text style={styles.primaryActionText}>
                        Vezi și gestionează pacienții
                    </Text>
                </TouchableOpacity>

                <View style={styles.doctorStats}>
                    <View style={styles.statBox}>
                        <Text style={styles.statEmoji}>📋</Text>
                        <Text style={styles.statLabel}>
                            Gestionează alocare pacienți
                        </Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statEmoji}>📈</Text>
                        <Text style={styles.statLabel}>
                            Vezi istoricul de stări
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

// Need to import Alert for the placeholder buttons
import { Alert } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        padding: 24,
        justifyContent: "center",
    },
    welcomeSection: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        fontSize: 72,
        marginBottom: 16,
    },
    appTitle: {
        fontSize: 36,
        fontWeight: "800",
        color: "#f8fafc",
        letterSpacing: 1,
    },
    appSubtitle: {
        fontSize: 16,
        color: "#94a3b8",
        marginTop: 8,
        textAlign: "center",
    },
    featuresSection: {
        gap: 16,
        marginBottom: 40,
    },
    featureCard: {
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#334155",
    },
    featureEmoji: {
        fontSize: 32,
        marginRight: 16,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#f8fafc",
        flex: 1,
    },
    featureText: {
        display: "none",
    },
    loginButton: {
        backgroundColor: "#6366f1",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    // Logged in styles
    header: {
        marginBottom: 32,
    },
    greeting: {
        fontSize: 28,
        fontWeight: "800",
        color: "#f8fafc",
    },
    subtitle: {
        fontSize: 16,
        color: "#94a3b8",
        marginTop: 4,
    },
    quickActions: {
        gap: 16,
    },
    primaryAction: {
        backgroundColor: "#6366f1",
        borderRadius: 20,
        padding: 28,
        alignItems: "center",
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryActionEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    primaryActionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
    },
    primaryActionText: {
        fontSize: 14,
        color: "#c7d2fe",
        marginTop: 4,
    },
    secondaryActions: {
        flexDirection: "row",
        gap: 12,
    },
    secondaryAction: {
        flex: 1,
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#334155",
    },
    secondaryEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    secondaryTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#f8fafc",
    },
    emergencyButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7f1d1d",
        borderRadius: 16,
        padding: 18,
        marginTop: 32,
        borderWidth: 1,
        borderColor: "#991b1b",
    },
    emergencyEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    emergencyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fecaca",
    },
    doctorStats: {
        gap: 12,
    },
    statBox: {
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#334155",
    },
    statEmoji: {
        fontSize: 28,
        marginRight: 16,
    },
    statLabel: {
        fontSize: 15,
        color: "#94a3b8",
        flex: 1,
    },
});
