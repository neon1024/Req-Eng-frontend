import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function LoginButton() {
    const { isLoggedIn, isLoading, logout, user } = useAuth();

    if (isLoading) {
        return null;
    }

    const handlePress = () => {
        if (isLoggedIn) {
            logout();
            router.replace("/");
        } else {
            router.push("/login");
        }
    };

    return (
        <View style={styles.container}>
            {isLoggedIn && user && (
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user.name}
                        </Text>
                        <Text style={styles.userRole}>
                            {user.role === "doctor" ? "Medic" : "Pacient"}
                        </Text>
                    </View>
                </View>
            )}
            <TouchableOpacity
                style={[styles.button, isLoggedIn && styles.buttonLogout]}
                onPress={handlePress}
            >
                <Text style={styles.buttonText}>
                    {isLoggedIn ? "Deconectare" : "Autentificare"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#6366f1",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    userDetails: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        color: "#f8fafc",
        fontSize: 15,
        fontWeight: "600",
    },
    userRole: {
        color: "#94a3b8",
        fontSize: 13,
    },
    button: {
        backgroundColor: "#6366f1",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonLogout: {
        backgroundColor: "#475569",
        shadowColor: "#000",
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
