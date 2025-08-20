import React from "react";
import "./HeaderLayout.scss"

interface HeaderLayoutProps {
    title: string;
    subText?: string;
    pageInfo?: string;
}

const HeaderLayout = ({ title, subText, pageInfo }: HeaderLayoutProps): React.ReactElement => {
    return (
        <header>
            <div className="header-container">
                <div className="header-title">
                    <h1>{title}</h1>
                </div>
                <div className="header-subtext">
                    {subText && <p>{subText}</p>}
                </div>
                {pageInfo && (
                    <div className="header-page-info">
                        <span className="page-info-text">{pageInfo}</span>
                    </div>
                )}
            </div>
        </header>
    );
}

export default HeaderLayout;
