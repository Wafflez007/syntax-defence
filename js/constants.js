const API_URL = 'https://script.google.com/macros/s/AKfycbzq9Hcp8u5mPKuQ0X_o7ZdqSwlT1xhxKLoAoAk-2HRRUMfgM7bRb7Db9vXYkt4XdArSzw/exec';

const DEFAULT_SCORES = [
    { name: "C9_BLABER", score: 8500 },
    { name: "DEV_JUNIE", score: 8200 },
    { name: "SUDO_ADMIN", score: 7900 },
    { name: "C9_BERSERKER", score: 7450 },
    { name: "GIT_PUSH_F", score: 6800 }
];

const COLORS = {
    C9_BLUE: 0x00AEEF,
    C9_DARK: 0x005577,
    VCT_MAGENTA: 0xFF0055,
    JUNIE_GREEN: 0x07C3F2,
    TERM_GREEN: 0x23D18B,
    WHITE: 0xFFFFFF
};

const GAME_CONFIG = {
    width: 800,
    height: 600,
    sessionTime: 60, // seconds
    braveModeDuration: 5000, // ms
};