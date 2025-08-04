import React from 'react';
import './ReadyToJoin.css';

function ReadyToJoin() {
    return (
        <div>
            <div className="line" />
            <div className="ready-to-join-section">
                <h1 className="ready-to-join-title">Ready to Join?</h1>
                <p className="ready-to-join-description">
                    Whether you're new to AI or already building models, there's a place for you here. 
                    Come to our next meeting, connect with our community, or message us with questions!
                </p>
                <div className="ready-to-join-button-container">
                    <a href="https://teams.microsoft.com/l/team/19%3A1910afef1d1d4e3b9bfd5f7938182f0b%40thread.tacv2/conversations?groupId=8f7bf1ac-c9b6-4bf0-b74a-407f088e74cc&tenantId=4046ceac-fdd3-46c9-ac80-b7c4a49bab70" target="_blank" rel="noopener noreferrer">
                        <button className="btn-glass btn-purple ready-to-join-btn">
                            Join Our Teams
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ReadyToJoin;