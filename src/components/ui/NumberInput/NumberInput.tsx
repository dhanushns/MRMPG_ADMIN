import React from "react";
import "./NumberInput.scss";

interface NumberInputProps {
    id: string;
    value: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({
    id,
    value,
    placeholder,
    disabled = false,
    className = "",
    style,
    min,
    max,
    step = 1,
    onChange
}) => {
    return (
        <div className={`number-input-wrapper ${className}`} style={style}>
            <input
                id={id}
                type="number"
                value={value || ""}
                placeholder={placeholder}
                disabled={disabled}
                className={`number-input ${disabled ? "disabled" : ""}`}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
};

export default NumberInput;
