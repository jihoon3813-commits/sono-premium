/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // 소노아임레디 브랜드 컬러
                sono: {
                    primary: "#3182f6",      // Toss Blue
                    secondary: "#1b64da",    // Darker Toss Blue
                    accent: "#3182f6",       // Toss Blue
                    gold: "#fedc40",         // Toss Yellow (matching Kakao/Yellow accents)
                    light: "#f2f4f6",        // Toss Background Gray
                    dark: "#191f28",         // Toss Black
                    success: "#00d082",      // Toss Green
                    warning: "#ffbb00",      // Toss Yellow-Orange
                    danger: "#f04452",       // Toss Red
                },
                toss: {
                    blue: "#3182f6",
                    lightBlue: "#e8f3ff",
                    gray: {
                        50: "#f9fafb",
                        100: "#f2f4f6",
                        200: "#e5e8eb",
                        300: "#d1d6db",
                        400: "#adb5bd",
                        500: "#8b95a1",
                        600: "#6b7684",
                        700: "#4e5968",
                        800: "#333d4b",
                        900: "#191f28",
                    }
                },
            },
            fontFamily: {
                sans: ["Pretendard", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "hero-pattern": "linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "slide-down": "slideDown 0.3s ease-out",
                "pulse-slow": "pulse 3s infinite",
                "float": "float 3s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideDown: {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
        },
    },
    plugins: [],
};
