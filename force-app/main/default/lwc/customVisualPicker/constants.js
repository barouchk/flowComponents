const PICKER_SIZE = {
    SMALL: "small",
    MEDIUM: "medium",
    LARGE: "large",
    'X-LARGE': "x-large",
    'XX-LARGE': "xx-large",
    DEFAULT: "medium",
};
const HEADING_SIZE = {
    SMALL: "x-small",
    MEDIUM: "medium",
    LARGE: "medium",
    'X-LARGE': "large",
    'XX-LARGE': "large",
    DEFAULT: "medium",
};

const PICKER_TYPES = {
    RADIO: "radio",
    CHECKBOX: "checkbox"
}
const PICKER_VARIANTS = {
    REQUIRED: "error",
    DEFAULT: "inverse",
}

const pickerClass = ({ pickerSize }) => `slds-visual-picker slds-visual-picker_${PICKER_SIZE[pickerSize.toUpperCase()] ?? PICKER_SIZE.DEFAULT}`;
const pickerHeadingClass = ({ pickerSize }) => `slds-text-heading_${HEADING_SIZE[pickerSize.toUpperCase()] ?? PICKER_SIZE.DEFAULT}`;

export { PICKER_TYPES, pickerClass, pickerHeadingClass };