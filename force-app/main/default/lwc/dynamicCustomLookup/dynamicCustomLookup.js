import { LightningElement, api, track } from 'lwc';
import {
    FlowAttributeChangeEvent,
} from 'lightning/flowSupport';

const REQUIRED_FIELD = 'field is required'

export default class DynamicCustomLookup extends LightningElement {

    @api recordId;
    @api objectName
    @api fieldName;    // field to search by
    @api fieldNameDisplay    // field to show in the combobox
    @api showFirst = false
    @api hideHref = false
    @api variant = "label-hidden";
    @api returnFieldValue;
    @api returnField;
    @api initValue;
    @api errMsg;
    @api iconName;
    @api label;
    @api name;
    @api placeholder;
    @api required;
    _requiredConditioned;

    @track _extraParams = {}
    @api set extraParams(value) {

        if (value != JSON.stringify(this._extraParams)) {
            this.fireRecordIdChanged('');
        }

        if (value) {
            this._extraParams = JSON.parse(value);
        }
    }

    get extraParams() {
        return this._extraParams;
    }

    @api returnSelectedList;
    @api limit;
    @api isSosl = false
    // fix issue when drop down is inside a modal (going under the modal)
    @api autoAlignment = false

    @track _selectedRecords = [];
    _selectedItemsMap = new Map();
    _disable = false;

    get isMultiSelect() {
        return this.limit && (this.limit > 0)
    }

    connectedCallback() {
        this._requiredConditioned = this.required;
    }

    handleValueSelected(event) {
        event.stopPropagation();
        const { detail: { selectedId, fieldsParams } } = event
        this.recordId = this.isMultiSelect ? '' : selectedId;
        this.fireRecordIdChanged(this.recordId);

        if (this.isMultiSelect && fieldsParams) {
            let selectedName = fieldsParams[this.fieldNameDisplay.split(',')[0]];
            this._selectedItemsMap.set(selectedId, this.createPill(selectedId, selectedName));
            this._requiredConditioned = false;
            this.returnFieldValue = null;
            this.updateSelection();
        }
        else if (fieldsParams) {
            if (this.returnField) {
                this.returnFieldValue = fieldsParams[this.returnField];
            }
        } else {
            this.returnFieldValue = null;
        }
    }

    @api
    validate() {
        let isValid = true;
        if (this._requiredConditioned) {
            isValid = [...this.template.querySelectorAll('c-custom-lookup')]
                .reduce((validSoFar, field) => {
                    field.reportValidity();
                    return validSoFar && field.checkValidity();
                }, true);
        }
        return { isValid, errorMessage: this.errMsg || REQUIRED_FIELD };
    }

    handleItemRemove(event) {
        event.stopPropagation();
        const id = event.detail.item.id;
        this._selectedItemsMap.delete(id);
        this._requiredConditioned = this.required && this._selectedRecords.length == 0;
        this.updateSelection();
    }

    updateSelection() {
        this._selectedRecords = [...this._selectedItemsMap.values()];
        const selectedIds = [...this._selectedItemsMap.keys()];
        this.returnSelectedList = selectedIds;
        this.disableByLimit(selectedIds.length);
        this.fireListSelectedEvent({ selectedIds });
    }

    disableByLimit(count) {
        if (this.isMultiSelect) {
            this._disable = count >= this.limit;
        }
    }

    createPill(id, label) {
        return {
            type: 'icon',
            href: '/' + id,
            label: label,
            name: '',
            id: id,
            iconName: this.iconName,
            alternativeText: '',
        };

    }

    fireListSelectedEvent = detail => this.dispatchEvent(new CustomEvent('listselect', { detail }));

    fireRecordIdChanged = recordId => this.dispatchEvent(new FlowAttributeChangeEvent(
        'recordId', recordId
    ));

    isEmpty(data) {
        const typeOfData = typeof data;
        if (typeOfData === "number" || typeOfData === "boolean") {
            return false;
        }
        if (typeOfData === "undefined" || data === null) {
            return true;
        }
        if (typeOfData !== "undefined") {
            if (typeOfData === "object") {
                return Object.keys(data).length === 0;
            }
            return data.length === 0;
        }

        let count = 0;
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                count++;
            }
        }

        return count === 0;
    };

}