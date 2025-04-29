import { LightningElement, api } from 'lwc';
import { isEmpty } from 'c/dataUtils';
import { PICKER_TYPES, pickerHeadingClass } from 'c/customVisualPicker';

export default class CustomVisualPickerList extends LightningElement {
    @api recordId;
    @api pickerListData;
    @api pickerSize = "medium";
    @api pickerType = "radio";
    @api picker = {}; // last selected picker or (in case of type "radio" ) single selected 
    @api pickers = []; // Collection of selected pickers. Generaly, for "checkbox" type
    @api errorMessage;
    @api pickerListDataOutput = []; // collection of all visual picker with update checked status

    visualPickers;

    connectedCallback() {
        this.buildPickerData(this);
    }
    buildPickerData({ pickerListData }) {
        const visualPickers = pickerListData?.map((item, index) => ({
            id: `visual-picker-${index}`,
            value: item.value,
            icon: item.icon,
            checked: this.setPickerChecked(item.value),
            ...this.buildPickerItem(item, index)
        })) ?? [];

        Object.assign(this, { visualPickers });
    }

    setPickerChecked(value) {
        if (this.pickerType == PICKER_TYPES.CHECKBOX) {
            const element = this.pickers.find(item => item.value === value)
            if (element) {
                return true
            }
        } else if (this.picker.value === value) {
            return true
        }
        return false
    }

    handlePicked(e) {
        e.stopPropagation();

        const value = e.detail.value;
        const picker = this.pickerListData.find(item => item.value === value);

        let visualPickers = []

        if (this.pickerType == PICKER_TYPES.CHECKBOX) {
            visualPickers = this.visualPickers.map(item => (item.value === value ? { ...item, checked: !item.checked } : item));
        } else {
            visualPickers = this.visualPickers.map(item => ({ ...item, checked: item.value === value }));
        }

        this.visualPickers = visualPickers || []

        let pickers = this.visualPickers.filter(item => item.checked === true).map((item) => ({
            value: item.value,
            icon: item.icon,
            checked: item.checked,
            label: item.label,
            title: item.title
        }));

        Object.assign(this, { picker, pickers });
    }

    buildPickerItem({ label = ' ', title = ' ', disabled = false, required = false, ...item }, index) {
        const labelClass = `${pickerHeadingClass(this)} ${this.pickerAttributes(item.labelColor, item.labelFontSize, 'label-' + index)}`;
        const titleClass = `slds-text-title ${this.pickerAttributes(item.titleColor, item.titleFontSize, 'title-' + index)}`;

        return {
            label,
            labelClass,
            title,
            titleClass,
            disabled,
            required
        }
    }

    pickerAttributes(color, fontSize, prefix) {
        if (isEmpty(color) && isEmpty(fontSize)) return '';

        const style = document.createElement('style');

        const className = `${prefix}-attr`
        const classColor = color ? `color: ${color}!important;` : '';
        const classFontSize = fontSize ? `font-size: ${fontSize}!important;` : '';

        style.innerHTML = `.${className} { ${classColor} ${classFontSize} }`;
        document.body.appendChild(style);

        return className;
    }
    @api validate() {
        const { picker, errorMessage } = this;
        if (picker) {
            return { isValid: true };
        }
        return { isValid: false, errorMessage };
    }
}