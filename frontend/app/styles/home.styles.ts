import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f4f8",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },

    greeting: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 8,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 16,
        color: "#4b5563",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 22,
    },

    actions: {
        width: "100%",
        maxWidth: 450,
    },

    buttonPrimary: {
        backgroundColor: "#2563eb",
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },

    buttonSecondary: {
        backgroundColor: "#93c5fd",
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: "center",
    },

    buttonAlert: {
        backgroundColor: "#ef4444",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
        alignItems: "center",
    },

    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
