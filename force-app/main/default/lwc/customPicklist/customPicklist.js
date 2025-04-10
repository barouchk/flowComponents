import { LightningElement, api, wire, track } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import { TYPES } from "./constants"

export default class CustomPicklist extends LightningElement {
    @api recordTypeId;
    @api objectApiName;
    @api fieldApiName;
    @api selectedValue;
    @api selectedLabel;
    @api fieldLabel;
    @api required;
    @api validationMessage;
    @api searchable;
    @api dependentValue;
    @api isDependentField;
    @api sortable;
    @api type = TYPES.DROPDOWN;
    name = 'checkbox'
    @api autoAlignment = false

    disabled = false

    objectName;
    options = [];

    @track _selectedValues = []
    @api get selectedValues() {
        return this._selectedValues
    }

    set selectedValues(value) {
        if (value) {
            this._selectedValues = [...value]
        }
    }

    @api
    validate() {
        // the component is required only when there is values in picklist
        if (!this.disabled && this.required) {
            const isValid = this.isValueSelected;
            return { isValid, errorMessage: this.validationMessageByValidity[isValid] };
        }
        else {
            return true;
        }
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: '$objectName', recordTypeId: '$recordTypeId', dependentValue: '$dependentValue' })
    propertyOrFunction({ error, data }) {
        if (data) {
            const { values, controllerValues } = data.picklistFieldValues[this.fieldApiName];

            this.selectedValue = (this.selectedValue == null ? '' : this.selectedValue);

            if (this.isDependentField) {
                let key = controllerValues[this.dependentValue];
                this.options = [...values.filter(option => option.validFor.includes(key))];
            } else {
                this.options = [...values];
            }
            if (this.sortable) {
                this.options.sort((op1, op2) => { return op1.label.localeCompare(op2.label) });
            }
        }
    }

    @wire(getObjectInfo, { objectApiName: '$objectName' })
    loadLabels({ error, data }) {
        if (data) {
            if (!this.recordTypeId) {
                this.recordTypeId = data.defaultRecordTypeId;
            }
            if (!this.fieldLabel) {
                this.fieldLabel = data.fields[this.fieldApiName].label;
            }
        }
    }

    get isOptions() {
        return this.options?.length ?? 0;
    }
    get isCheckbox() {
        return this.type === TYPES.CHECKBOX;
    }
    get isRadio() {
        return (this.type === TYPES.RADIO);
    }
    get isDropdown() {
        return this.type === TYPES.DROPDOWN;
    }
    get isInput() {
        return this.isCheckbox || this.isRadio
    }

    get isValueSelected() {
        if ((this.isCheckbox || this.isDropdown) && this.selectedValue) {
            return true;
        } else if (this.isCheckbox && this.selectedValues.length > 0) {
            return true;
        }
        return false;
    }

    connectedCallback() {
        this.validationMessageByValidity = { false: this.validationMessage };
        this.objectName = { objectApiName: this.objectApiName };
    }

    handleChange(event) {
        event.stopPropagation();

        const { value } = event.target;

        this.selectedValues = value
        if (this.isRadio || this.isDropdown) {
            this.selectedValue = value
            this.selectedLabel = this.options.find(x => x.value === value)?.label;
        }

        let isValidate = this.validate();

        const pickListEvent = new CustomEvent('custompicklistevent', {
            detail: {
                isValidate: isValidate,
                selectedValue: value
            }
            , bubbles: true
            , composed: true
        });
        this.dispatchEvent(pickListEvent);

        this.flowChangeAttribute();

    }

    flowChangeAttribute() {
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedValue', this.selectedValue));
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedValues', this.selectedValues));

    }
}