import layouts from "@/components/layouts";

const ReviewPage = (): React.ReactElement => {
    return (
        <div className="review-page">
            <div className="review-page__header">
                <layouts.HeaderLayout title="Feedback Management System" subText="Manage user feedback and reviews" />
            </div>
            <div className="review-page__content">
                <div className="review-page__filter-section"></div>
                <div className="review-page__table-section">

                </div>
            </div>
        </div>
    );
};

export default ReviewPage;