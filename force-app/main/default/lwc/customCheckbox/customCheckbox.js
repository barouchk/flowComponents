/**
 * Created by bkandov on 05/01/2021.
 */

import { LightningElement, api } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
// import customCheckboxStyle from '@salesforce/resourceUrl/CustomCheckboxStyle';
import { TYPES, MAX_OPTIONS_PER_COLUMN } from "./constants"
export default class CustomCheckbox extends LightningElement {

    // name is required parameter for radio-group
    @api name = 'name';

    // label of component
    @api label;

    @api get value() {
        return this.__value;
    }
    set value(value) {
        this.__value = value ?? (this.type === TYPES.CHECKBOX ? [] : '');
    }
    @api placeholder = '';

    @api options = [];

    @api required = false;
    @api disabled = false;

    @api stringSpliter = ';';

    // type of component default checkbox (options:checkbox/radio/button/dropdown)
    @api type = TYPES.CHECKBOX;

    // return string of selected values delimited by ';'
    @api strSelectedValues;

    // options values as array of string such as ['a', 'b' .... ] 
    @api get listOfStrings() { }
    set listOfStrings(values) {
        this.options = this.generateOptions(values);
    }

    // options values as string values delimited by 'stringSpliter'
    @api get stringOfValues() { }
    set stringOfValues(values) {
        this.options = this.generateOptions(values.split(this.stringSpliter));
    }

    // maximum options in one column for long list of checkbox options  
    @api maxOptionsPerColumn = MAX_OPTIONS_PER_COLUMN;

    @api
    get customLabelClass() {
        return this.__customLabelClass ? 'checkbox-label' : '';
    }
    set customLabelClass(value) {
        this.__customLabelClass = value;
    }
    @api
    get customOptionClass() {
        return this.__customOptionClass ? 'checkbox-option' : '';
    }
    set customOptionClass(value) {
        this.__customOptionClass = value;
    }
    @api
    get customRadioClass() {
        return this.__customRadioClass ? 'radio-option' : '';
    }
    set customRadioClass(value) {
        this.__customRadioClass = value;
    }

    get isOptions() {
        return this.options?.length ?? 0;
    }
    get isCheckbox() {
        return this.isOptions && this.type === TYPES.CHECKBOX;
    }
    get isRadio() {
        return this.isOptions && (this.type === TYPES.RADIO || this.type === TYPES.BUTTON);
    }
    get isDropdown() {
        return this.isOptions && this.type === TYPES.DROPDOWN;
    }
    get longOptionListClass() {
        const { maxOptionsPerColumn, options } = this;
        return maxOptionsPerColumn && maxOptionsPerColumn < (options?.length ?? 0) ? "checkbox-options-grid" : "";
    }
    get checkBoxClasses() {
        return `${this.customLabelClass} ${this.customOptionClass} ${this.longOptionListClass}`;
    }
    get radioClasses() {
        return `${this.customLabelClass} ${this.customRadioClass}`;
    }
    connectedCallback() {
        // loadStyle(this, customCheckboxStyle);
        this.handleMaxGridrows();
    }
    handleMaxGridrows() {
        const style = document.body.style;
        style.setProperty('--max-grid-rows', this.maxOptionsPerColumn)
    }
    generateOptions(arrayOfValues = null) {
        this.value = null;
        return arrayOfValues
            ? [...({
                strOptions: [...arrayOfValues],
                [Symbol.iterator]: function* () {
                    for (let option of this.strOptions) yield { label: option, value: option };
                }
            })]
            : [];
    }
    handleChange({ detail }) {
        const { value } = detail;
        const strSelectedValues = this.isCheckbox ? value.join(this.stringSpliter) : value;

        Object.assign(detail, { strSelectedValues });
        Object.assign(this, { value, strSelectedValues });
    }

    @api
    validate() {
        const isValid = false

        if (this.required) {
            let componentName = ''
            if (this.isCheckbox) {
                componentName = 'lightning-checkbox-group'
            } else if (this.isRadio) {
                componentName = 'lightning-radio-group'
            } else if (this.isDropdown) {
                componentName = 'lightning-combobox'
            }

            if (!componentName) {
                return true;
            }

            isValid = [...this.template.querySelectorAll(componentName)].reduce((validSoFar, field) => {
                return validSoFar && field.checkValidity();
            }, true);
            return { isValid, errorMessage: 'field is required' };
        }
        else {
            return true;
        }
    }

}
export { TYPES }