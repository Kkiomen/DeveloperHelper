import React from 'react';

interface ExternalPageProps {
    url: string;
}

const ExternalPage: React.FC<ExternalPageProps> = ({ url }) => {
    return (
        <div style={{ height: '100vh', overflow: 'hidden' }}>
            <iframe
                src={url}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="External Page"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
};

export default ExternalPage;