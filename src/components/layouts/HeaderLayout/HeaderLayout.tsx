import React from "react";
import "./HeaderLayout.scss"

interface HeaderLayoutProps {
    title: string;
    subText?: string;
}

const HeaderLayout = ({ title, subText }: HeaderLayoutProps): React.ReactElement => {
    return (
        <header>
            <div className="header-container">
                <div className="header-title">
                    <h1>{title}</h1>
                </div>
                <div className="header-subtext">
                    {subText && <p>{subText}</p>}
                </div>
            </div>
        </header>
    );
}

export default HeaderLayout;
