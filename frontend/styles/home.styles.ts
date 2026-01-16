import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },

    greeting: {
        fontSize: 28,
        fontWeight: "700",
        color: "#f8fafc",
        marginBottom: 8,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 16,
        color: "#94a3b8",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 22,
    },

    actions: {
        width: "100%",
        maxWidth: 450,
    },

    buttonPrimary: {
        backgroundColor: "#6366f1",
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: "center",
        shadowColor: "#6366f1",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },

    buttonSecondary: {
        backgroundColor: "#334155",
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#475569",
    },

    buttonAlert: {
        backgroundColor: "#7f1d1d",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#991b1b",
    },

    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
