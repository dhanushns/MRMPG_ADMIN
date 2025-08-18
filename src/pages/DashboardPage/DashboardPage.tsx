import React from "react";
import layouts from "@/components/layouts";

const DashboardPage: React.FC = () => {

    return (
        <div className="dashboard-page">
            <div className="layout-header-section">
                <layouts.HeaderLayout title="Dashboard" subText="Overview of your account"  />
            </div>

            <div className="dashboard-content-section">
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>Welcome to the Dashboard</h1>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;