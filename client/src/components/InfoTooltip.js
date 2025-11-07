import React, { useState } from 'react';
import './InfoTooltip.css';

function InfoTooltip() {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="info-tooltip-container">
            <button 
                className="info-icon"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                aria-label="About Sensus"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
            </button>
            
            {showTooltip && (
                <div className="tooltip-content">
                    <h3>What is Sensus?</h3>
                    <p>
                        <strong>Share your raw emotion</strong> — text, image, or audio — 
                        and receive someone else's in return.
                    </p>
                    <p>
                        An AI matches you with another person experiencing a <em>similar feeling</em>, 
                        creating anonymous moments of genuine human connection.
                    </p>
                    <p className="tooltip-philosophy">
                        No profiles. No likes. No tracking. Just fleeting exchanges that remind us 
                        we're not alone in what we feel.
                    </p>
                    <p className="tooltip-footer">
                        Part of the <a href="https://yargnad.github.io/sensus-app/" target="_blank" rel="noopener noreferrer">Whetstone Framework</a>
                    </p>
                </div>
            )}
        </div>
    );
}

export default InfoTooltip;
