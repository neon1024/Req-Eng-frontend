import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useAuth } from "../app/context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();

    const handleLogin = () => {
        if (email === "test@example.com" && password === "1234") {
            login();
            router.replace("/");
        } else {
            Alert.alert("Login eșuat", "Email sau parola incorectă");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Autentificare</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Parolă"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f4f8",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    form: {
        width: "100%",
        maxWidth: 450,
        padding: 24,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 32,
        textAlign: "center",
        color: "#1f2937",
    },
    input: {
        backgroundColor: "#f9fafb",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
