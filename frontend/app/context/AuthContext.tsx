import { createContext, ReactNode, useContext, useState } from "react";

type AuthContextType = {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
    token: string;
    saveToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = () => setIsLoggedIn(true);
    const logout = () => {
        saveToken("");
        setIsLoggedIn(false);
    };

    // TODO session
    const [token, setToken] = useState("");

    const saveToken = (token: string) => setToken((prev) => token);

    return (
        <AuthContext.Provider
            value={{ isLoggedIn, login, logout, token, saveToken }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
