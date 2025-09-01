import layouts from "@/components/layouts";

const EnquiryPage = (): React.ReactElement => {
    return (
        <div className="enquiry-page">
            <div className="enquiry-page__header">
                <layouts.HeaderLayout title="Enquiry Management System" subText="Manage user feedback and enquiries" />
            </div>
            <div className="enquiry-page__content">
                <div className="enquiry-page__filter-section"></div>
                <div className="enquiry-page__table-section">

                </div>
            </div>
        </div>
    );
};

export default EnquiryPage;