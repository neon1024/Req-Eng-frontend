import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/services/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Eroare", "Te rog completează toate câmpurile.");
            return;
        }

        setIsLoading(true);

        try {
            const responseData = await authAPI.login(email, password);

            if (responseData.error) {
                Alert.alert("Autentificare eșuată", responseData.message || "Eroare necunoscută");
                return;
            }

            const userData = {
                id: responseData.user.id,
                email: responseData.user.email,
                name: responseData.user.name,
                role: responseData.user.role,
            };

            await login(responseData.token, userData);

            router.replace("/");
        } catch (error: any) {
            const message = error.response?.data?.message || "A apărut o eroare la autentificare.";
            Alert.alert("Autentificare eșuată", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.formContainer}>
                <View style={styles.header}>
                    <Text style={styles.logo}>🧠</Text>
                    <Text style={styles.title}>MindTrack</Text>
                    <Text style={styles.subtitle}>
                        Monitorizează-ți starea emoțională
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="exemplu@email.com"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Parolă</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                            editable={!isLoading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Autentificare</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Aplicație pentru monitorizarea sănătății mentale
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    formContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#f8fafc",
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: "#94a3b8",
        marginTop: 8,
    },
    form: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#1e293b",
        borderRadius: 20,
        padding: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#cbd5e1",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#334155",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 16,
        color: "#f8fafc",
        borderWidth: 1,
        borderColor: "#475569",
    },
    button: {
        backgroundColor: "#6366f1",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 12,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: "#4f46e5",
        opacity: 0.7,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    footer: {
        marginTop: 32,
    },
    footerText: {
        color: "#64748b",
        fontSize: 14,
        textAlign: "center",
    },
});
