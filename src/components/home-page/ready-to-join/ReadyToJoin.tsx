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
                    <a href="https://teams.microsoft.com/l/team/19%3a6ee0077b3eaa4ce1b7f82e75d4c1e25c%40thread.tacv2/conversations?groupId=9137d38a-db9a-4be8-a7e7-f2b8e2b1c2a3&tenantId=your-tenant-id" target="_blank" rel="noopener noreferrer">
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