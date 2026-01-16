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

import axios from "axios";
import { useAuth } from "../app/context/AuthContext";

import { User } from "@/models/User";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, saveToken } = useAuth();

    const handleLogin = async () => {
        const data = { email, password };

        try {
            const response = await axios.post(
                "http://localhost:3000/api/auth/login",
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseData = response.data;

            const error = responseData.error;

            if (error) {
                const message = responseData.message;
                Alert.alert("Login eșuat", message);
            } else {
                const token = responseData.token;

                saveToken(token);

                // TODO save user in db
                const user = new User({
                    id: responseData.user.id,
                    email: responseData.user.email,
                    name: responseData.user.name,
                    role: responseData.user.role,
                    createdAt: responseData.user.createdAt,
                    updatedAt: responseData.user.updatedAt,
                });

                login();

                router.replace("/");
            }
        } catch (error: any) {
            Alert.alert("Login eșuat", error);
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
