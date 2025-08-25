import layouts from "@/components/layouts";

const ReportsPage = (): React.ReactElement => {
    return (
        <div className="reports-page">
            <div className="reports-page__header">
                <layouts.HeaderLayout title="Reports" subText="View and generate you weekly and monthly reports" />
            </div>
            <div className="reports-page__content">
                <div className="reports-page__filter-section"></div>
                <div className="reports-page__table-section">

                </div>
            </div>
        </div>
    );
};

export default ReportsPage;