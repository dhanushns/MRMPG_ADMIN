import React from "react";
import layouts from "@/components/layouts";

const RoomPage = (): React.ReactElement => {
    return (
        <div className="room-page">
            <div className="room-page__header">
                <layouts.HeaderLayout title="Room Details" subText="View detailed information and manage room settings." />
            </div>
            <div className="room-page__content">
                <div className="room-page__cards">
                    
                </div>
                <div className="room-page__filters"></div>
                <div className="room-page__table"></div>
            </div>
        </div>
    );
}

export default RoomPage;