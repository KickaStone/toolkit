"use client";

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

export default function JsonFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copyLabel, setCopyLabel] = useState('Copy JSON');

    const formatJson = (value: string) => {
        if (!value.trim()) {
            setOutput('');
            setError(null);
            return;
        }
        try {
            const parsed = JSON.parse(value);
            return JSON.stringify(parsed, null, 2);
        } catch (err) {
            throw err;
        }
    };

    const handleFormat = () => {
        try {
            const formatted = formatJson(input);
            if (formatted) setOutput(formatted);
            setError(null);
        } catch (err) {
            setError("Invalid JSON: " + (err as Error).message);
        }
    };

    const handleMinify = () => {
        try {
            if (!input.trim()) return;
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
        } catch (err) {
            setError("Invalid JSON: " + (err as Error).message);
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopyLabel('Copied!');
            setTimeout(() => setCopyLabel('Copy JSON'), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setError(null);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>JSON Beautifier</h1>
                <p className={styles.subtitle}>Format, validate, and minify your JSON data instantly.</p>
            </header>

            <main className={styles.main}>
                <div className={styles.column}>
                    <div className={styles.label}>
                        <span>Input JSON</span>
                        <div className={styles.buttonGroup}>
                            <button onClick={clearAll} className={styles.secondaryButton}>
                                Clear
                            </button>
                            <button onClick={handleMinify} className={styles.secondaryButton}>
                                Minify
                            </button>
                            <button onClick={handleFormat} className={styles.primaryButton}>
                                Beautify
                            </button>
                        </div>
                    </div>
                    <textarea
                        className={`${styles.editor} ${error ? styles.error : ''}`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        spellCheck={false}
                    />
                    {error && <div className={styles.errorMessage}>{error}</div>}
                </div>

                <div className={styles.column}>
                    <div className={styles.label}>
                        <span>Output</span>
                        <button onClick={handleCopy} className={styles.secondaryButton} disabled={!output}>
                            {copyLabel}
                        </button>
                    </div>
                    <textarea
                        className={styles.preview}
                        value={output}
                        readOnly
                        placeholder="Formatted JSON will appear here..."
                        spellCheck={false}
                    />
                </div>
            </main>
        </div>
    );
}
