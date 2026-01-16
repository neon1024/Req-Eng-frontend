import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../app/context/AuthContext";

export default function LoginButton() {
    const { isLoggedIn, logout } = useAuth();

    const handlePress = () => {
        if (isLoggedIn) {
            logout();
            router.replace("/");
        } else {
            router.push("/login");
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>
                {isLoggedIn ? "Logout" : "Login"}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        top: 40,
        right: 20,
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
