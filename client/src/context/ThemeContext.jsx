import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Check localStorage or system preference, default to 'dark'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('socialnex-theme');
        if (savedTheme) return savedTheme;
        
        // Optional: Check system preference
        // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        //     return 'light';
        // }
        
        return 'dark';
    });

    useEffect(() => {
        // Apply class to body
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        
        // Save to localStorage
        localStorage.setItem('socialnex-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
