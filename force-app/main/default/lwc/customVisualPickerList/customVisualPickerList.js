import { LightningElement, api } from 'lwc';
import { isEmpty } from 'c/dataUtils';
import { PICKER_TYPES, pickerHeadingClass } from 'c/customVisualPicker';

export default class CustomVisualPickerList extends LightningElement {
    @api recordId;
    @api pickerListData;
    @api pickerSize =  "medium";
    @api pickerType =  "radio";
    @api picker; // last selected picker or (in case of type "radio" ) single selected 
    @api pickers; // Collection of selected pickers. Generaly, for "checkbox" type
    @api errorMessage;

    visualPickers;

    connectedCallback() {
        this.buildPickerData(this);
    }
    buildPickerData( { pickerListData } ) {
        const visualPickers = pickerListData?.map( ( item, index) => ({
            id: `visual-picker-${index}`,
            value: JSON.stringify({ label: item.label, title: item.title, apiValue: item.apiValue}),
            icon: item.icon, 
            ...this.buildPickerItem(item, index)
        })) ?? [];

        const pickers = [ ...(visualPickers.filter( item => item.required )?.map( item => JSON.parse(item.value) ) ?? [])];
        Object.assign(this, { visualPickers, pickers });
    }
    handlePicked(e) {
        e.stopPropagation();
        const { pickers = [], pickerType } = this
        const picker = JSON.parse(e.detail.value);
        Object.assign(this, { picker, pickers:[...(pickerType === PICKER_TYPES.CHECKBOX ?pickers:[]), picker] });
    }
    buildPickerItem({label = ' ', title = ' ', disabled = false, required = false, ...item}, index) {
        const labelClass = `${pickerHeadingClass(this)} ${this.pickerAttributes( item.labelColor, item.labelFontSize, 'label-' + index)}`;
        const titleClass = `slds-text-title ${this.pickerAttributes( item.titleColor, item.titleFontSize, 'title-' + index)}`;

        return { 
            label,
            labelClass,
            title,
            titleClass,
            disabled,
            required
        }
    }

    pickerAttributes( color, fontSize, prefix ) {
        if ( isEmpty( color ) && isEmpty( fontSize ) ) return  '';

        const style = document.createElement('style');
        
        const className = `${prefix}-attr`
        const classColor = color ? `color: ${color}!important;` : '';
        const classFontSize = fontSize ? `font-size: ${fontSize}!important;`: '';

        style.innerHTML = `.${className} { ${classColor} ${classFontSize} }`;
        document.body.appendChild(style);

        return className;
    }
    @api validate() {
        const { picker, errorMessage } = this;
        if ( picker ) { 
            return { isValid: true }; 
        } 
        return { isValid: false, errorMessage }; 
    }
}