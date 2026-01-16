import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

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
    const [token, setToken] = useState("");

    useEffect(() => {
        const loadToken = async () => {
            const savedToken = await AsyncStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                setIsLoggedIn(true);
            }
        };
        loadToken();
    }, []);

    const login = () => setIsLoggedIn(true);

    const logout = async () => {
        await AsyncStorage.removeItem("token");
        setToken("");
        setIsLoggedIn(false);
    };

    const saveToken = async (newToken: string) => {
        setToken(newToken);
        await AsyncStorage.setItem("token", newToken);
    };

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
