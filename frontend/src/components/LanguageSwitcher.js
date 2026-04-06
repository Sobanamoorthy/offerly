import React, { useState, useEffect } from 'react';

const LanguageSwitcher = ({ theme = 'dark' }) => {
    const [currentLang, setCurrentLang] = useState('en');

    // Read current language from Google Translate cookie on mount
    useEffect(() => {
        const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
        if (match && match[1]) {
            setCurrentLang(match[1]);
        }
    }, []);

    const switchLanguage = (langCode) => {
        setCurrentLang(langCode);

        // Set the Google Translate cookie
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;

        // Trigger the hidden Google Translate select element
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        } else {
            // Fallback: reload with cookie set
            window.location.reload();
        }
    };

    return (
        <>
            <style>{`
                .lang-switcher {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: #F5F3FF;
                    border: 1.5px solid #E8E4FF;
                    border-radius: 999px;
                    padding: 4px;
                    font-family: 'Inter', sans-serif;
                }
                .lang-btn {
                    padding: 6px 14px;
                    border: none;
                    border-radius: 999px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 800;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.2s ease;
                    letter-spacing: 0.05em;
                    white-space: nowrap;
                    text-transform: uppercase;
                }
                .lang-btn.active {
                    background: #7C6FCD;
                    color: #ffffff;
                    box-shadow: 0 4px 10px rgba(124, 111, 205, 0.2);
                }
                .lang-btn.inactive {
                    background: transparent;
                    color: #6B6B8A;
                }
                .lang-btn.inactive:hover {
                    color: #7C6FCD;
                    background: #FFFFFF;
                }

                /* Variant for dark backgrounds (Sidebar) */
                .lang-switcher.dark {
                    background: rgba(0, 0, 0, 0.2);
                    border-color: rgba(124, 111, 205, 0.3);
                }
                .lang-switcher.dark .lang-btn.active {
                    background: #7C6FCD;
                    color: #FFFFFF;
                }
                .lang-switcher.dark .lang-btn.inactive {
                    color: #D4CEEF;
                }
                .lang-switcher.dark .lang-btn.inactive:hover {
                    color: #FFFFFF;
                    background: rgba(124, 111, 205, 0.1);
                }

                /* Minimal Light variant for clean headers (Auth Pages) */
                .lang-switcher.light {
                    background: #EDE9FC;
                    border: 1px solid #C4BFEF;
                    padding: 3px;
                }
                .lang-switcher.light .lang-btn.active {
                    background: #7C6FCD;
                    color: #FFFFFF;
                }
                .lang-switcher.light .lang-btn.inactive {
                    color: #6B63CC;
                }
                .lang-switcher.light .lang-btn.inactive:hover {
                    background: #FFFFFF;
                    color: #7C6FCD;
                }
            `}</style>


            <div className={`lang-switcher ${theme} notranslate`}>
                <button
                    className={`lang-btn ${currentLang === 'en' ? 'active' : 'inactive'}`}
                    onClick={() => switchLanguage('en')}
                    title="English"
                >
                    EN
                </button>
                <button
                    className={`lang-btn ${currentLang === 'ta' ? 'active' : 'inactive'}`}
                    onClick={() => switchLanguage('ta')}
                    title="தமிழ்"
                >
                    TA
                </button>
            </div>
        </>
    );
};

export default LanguageSwitcher;
