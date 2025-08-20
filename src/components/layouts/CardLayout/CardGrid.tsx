import React from "react";
import CardLayout from "./CardLayout";
import type { types } from "@/types";
import "./CardGrid.scss";

interface ActionButton {
    label: string;
    icon?: types["IconName"];
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "small" | "medium" | "large";
    onClick: () => void;
    disabled?: boolean;
}

interface CardData {
    title: string;
    value: string | number;
    icon: types["IconName"];
    percentage?: number;
    trend?: "up" | "down" | "neutral";
    color?: "primary" | "success" | "warning" | "error" | "info";
    subtitle?: string;
    onClick?: () => void;
    loading?: boolean;
    className?: string;
    style?: React.CSSProperties;
    
    // New enhanced props
    actions?: ActionButton[];
    showActions?: "always" | "hover" | "never";
    customContent?: React.ReactNode;
    footer?: React.ReactNode;
    badge?: {
        text: string;
        color?: "primary" | "success" | "warning" | "error" | "info";
    };
}

interface CardGridProps {
    cards: CardData[];
    loading?: boolean;
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: "sm" | "md" | "lg";
    className?: string;
}

const CardGrid: React.FC<CardGridProps> = ({
    cards,
    loading = false,
    columns = 4,
    gap = "md",
    className = ""
}) => {
    return (
        <div className={`card-grid card-grid--${gap} card-grid--cols-${columns} ${className}`}>
            {cards.map((card, index) => (
                <CardLayout
                    key={index}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    percentage={card.percentage}
                    trend={card.trend}
                    color={card.color}
                    subtitle={card.subtitle}
                    onClick={card.onClick}
                    loading={card.loading || loading}
                    className={card.className}
                    style={card.style}
                    actions={card.actions}
                    showActions={card.showActions}
                    customContent={card.customContent}
                    footer={card.footer}
                    badge={card.badge}
                />
            ))}
        </div>
    );
};

export default CardGrid;
