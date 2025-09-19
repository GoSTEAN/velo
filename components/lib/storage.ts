export interface UserProfile {
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNo: string;
    defaultCurrency: string;
    enable2FA: boolean;
    transactionNotifications: boolean;
    darkMode: boolean;
    linkedBankAccounts: Array<{
        name: string;
        accNo: string | undefined;
    }>;
}

export const STORAGE_KEYS = {
    USER_PROFILE: 'userProfile',
    WALLET_CONNECTIONS: 'walletConnections',
};

export const getStoredProfile = (): UserProfile | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const saveProfile = (profile: UserProfile): void => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getDefaultProfile = (): UserProfile => ({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNo: '',
    defaultCurrency: 'USD',
    enable2FA: false,
    transactionNotifications: true,
    darkMode: false,
    linkedBankAccounts: [],
});
