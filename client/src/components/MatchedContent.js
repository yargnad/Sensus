import React, { useState } from 'react';

const MatchedContent = ({ content, apiUrl }) => {
    const [imageError, setImageError] = useState(false);
    
    const getFileUrl = (filePath) => {
        // The server is configured to serve static files from the 'uploads' directory
        const url = `${apiUrl}/${filePath}`;
        console.log('Loading file from:', url);
        return url;
    };

    const handleImageError = (e) => {
        console.error('Image failed to load:', {
            src: e.target.src,
            content: content.content,
            apiUrl: apiUrl
        });
        setImageError(true);
    };

    return (
        <div className="content-frame">
            <div className="matched-content">
                {content.contentType === 'text' && <p>{content.content}</p>}
                {content.contentType === 'image' && (
                    <>
                        {imageError && (
                            <div style={{ color: 'red', marginBottom: '10px' }}>
                                Failed to load image. Path: {content.content}
                            </div>
                        )}
                        <img 
                            src={getFileUrl(content.content)} 
                            alt="A feeling from another"
                            onError={handleImageError}
                            style={imageError ? { border: '2px solid red' } : {}}
                        />
                    </>
                )}
                {content.contentType === 'audio' && (
                    <audio controls src={getFileUrl(content.content)} />
                )}
            </div>
        </div>
    );
};

export default MatchedContent;