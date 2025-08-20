import React from "react";
import layouts from "@/components/layouts";

const ApprovalManagementPage = (): React.ReactElement => {
    return (
        <div className="app-mng-page">
            <div className="app-mng-page__header">
                <layouts.HeaderLayout title="Approval Management" subText="Manage member registration approvals and Payment approvals" />
            </div>
            <div className="app-mng-page__content">
                
            </div>
        </div>
    );
}

export default ApprovalManagementPage;
