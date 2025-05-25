/**
 * Created by bkandov on 21/10/2020.
 */

import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord } from 'lightning/uiRecordApi';

import getResults from '@salesforce/apex/CustomLookupController.getResults';

export default class CustomLookup extends LightningElement {
    recordId = '';

    @api get valueId() {
        return this.recordId
    }

    set valueId(value) {
        if (!value && this.recordId != value) {
            this.clearValue()
        }
        this.recordId = value
    }

    @api objName;
    // field to search by
    @api fieldName;
    // field to show in the combobox
    @api fieldNameDisplay;
    @api showFirst = false;
    @api hideHref;
    @api iconName;
    @api labelName;
    @api inputLabel;
    @api variant = "label-hidden";
    @api filter = '';
    @api required;
    @api uniqueId;
    @api placeholder;
    @api extraParams = {};
    @api distinctByField = '';

    _recordTypeId
    @api get recordTypeId() {
        return this._recordTypeId
    }

    set recordTypeId(value) {
        this._recordTypeId = value
    }

    // fix issue hen drop down is inside a modal (going under the modal)
    @api autoAlignment = false

    // when autoAlignment is true, need to assign the right width of the dropdown by the input
    styledWidth = 'width:0';

    // add option to order by records by field
    @api orderBy = ''
    @api isSosl = false
    get _isSosl() {
        return (this.isSosl && this.searchTerm && this.searchTerm.length > 3)
    }
    @api disabled;
    get comboBoxClass() {
        let cls = 'slds-form-element';
        if (this.variant == 'label-inline') {
            cls += ' slds-form-element_horizontal';
        }

        return cls;
    }

    get random() {
        return Math.floor(Math.random() * 10000) / 42.375;
    }

    // will search for record id on init (only once) and fire event to parent to populate the value right after init
    // this must be the last attribute that should be populated on the parent
    @api
    get initValue() { }
    set initValue(value) {
        const { fieldName, stopInitValue, extraParams, distinctByField, objName, uniqueId,
            showFirst, fireValueSelectEvent, fieldNameDisplay: displayName, orderBy, random } = this;
        if (!stopInitValue) {
            this.stopInitValue = true;
            if (value) {
                getResults({ fieldName, displayName, value, extraParams, distinctByField, ObjectName: objName, showFirst, orderBy, random })
                    .then(data => {
                        if (data && data.length) {
                            const matchRecord = data.find(record => record.FieldsParams[this.fieldName] === value);
                            if (matchRecord) {
                                const { FieldsParams: fieldsParams, Id: selectedId } = matchRecord;
                                fireValueSelectEvent({ selectedId, fieldsParams, uniqueId, isInit: true });
                            }
                        }
                    })
                    .catch(error => console.log('error in initValue()', error));
            }
        }
    }

    @api checkValidity() {
        const input = this.getInputElement();
        return input ? input.checkValidity() : true;
    }

    @api reportValidity() {
        const input = this.getInputElement();
        return input ? input.reportValidity() : true;
    }

    @api setCustomValidity(msg) {
        this.getInputElement()?.setCustomValidity(msg);
    }

    getInputElement() {
        return this.template.querySelector('lightning-input');
    }

    fireValueSelectEvent = detail => this.dispatchEvent(new CustomEvent('valueselect', { detail }));

    stopInitValue = false;

    objLabelName;
    @track error;

    get newObjectCreationLabel() {
        return `New ${this.objLabelName}`;
    }

    /*Create Record Start*/
    @api createRecord;
    @track recordTypeOptions;
    @track createRecordOpen;
    @track recordTypeSelector;
    @track mainRecord;
    @track isLoaded = false;

    get isLabelExists() {
        return this.inputLabel != undefined;
    }

    //For Stencil
    @track stencilClass = '';
    @track stencilReplacement = 'slds-hide';
    //css
    @track myPadding = 'slds-modal__content';
    /*Create Record End*/

    searchTerm;
    @track valueObj;
    href;
    @track options = []; //lookup values
    @track isValue;

    blurTimeout;

    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';
    @track dropDownClass = 'slds-dropdown slds-dropdown_length-with-icon-7 slds-dropdown_fluid slds-dropdown_right initial_dropdown'

    showDropDown;

    connectedCallback() {
        if (this.variant == 'label-inline') {
            this.dropDownClass += ' label-inline-dropdown'
        }

        this.dropDownClass += this.autoAlignment ? ' auto-alignment' : '';
    }

    @api
    get queryFields() {
        if (!this.fieldNameDisplay) {
            return [];
        }
        const fieldsArray = this.fieldNameDisplay.split(",");
        const fields = [];

        for (let field of fieldsArray) {
            fields.push(`${this.objName}.${field}`)
        }

        return fields;
    }
    set queryFields(n) { }

    //Used for creating Record Start
    @wire(getObjectInfo, { objectApiName: '$objName' })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            this.objLabelName = data.label;
            let recordTypeInfos = Object.entries(this.record.recordTypeInfos);

            if (this.recordTypeId) { return; }
            else if (recordTypeInfos.length > 1) {
                let temp = [];
                recordTypeInfos.forEach(([key, value]) => {
                    if (value.available === true && value.master !== true) {
                        temp.push({ "label": value.name, "value": value.recordTypeId });
                    }
                });
                this.recordTypeOptions = temp;
            } else {
                this.recordTypeId = this.record.defaultRecordTypeId;
            }
        } else if (error) {
            console.log('error in wire')
            this.error = error;
            this.record = undefined;
            console.log("this.error", this.error);
        }
    }

    @wire(getResults, {
        ObjectName: '$objName',
        fieldName: '$fieldName',
        displayName: '$fieldNameDisplay',
        value: '$searchTerm',
        showFirst: '$showFirst',
        extraParams: '$extraParams',
        distinctByField: '$distinctByField',
        orderBy: '$orderBy',
        isSosl: '$_isSosl',
        random: '$random'
    })
    wiredRecords({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            this.options = this.record;
            this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
            if (this.options.length > 0 || (this.searchTerm && this.createRecord)) {
                this.boxClass = +' slds-is-open';
                this.showDropDown = true;
            }

        } else if (error) {
            this.error = error;
            this.record = undefined;
            this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'
            console.log("wire.error", this.error);
        }
    }

    //To get preselected or selected record
    @wire(getRecord, { recordId: '$valueId', fields: '$queryFields' })
    wiredOptions({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            const fieldsArray = this.fieldNameDisplay.split(",");

            if (fieldsArray.length == 1) {
                this.valueObj = this.record.fields[this.fieldNameDisplay].value;
            } else {
                var values = [];
                for (var fieldName of fieldsArray) {
                    if (this.record.fields[fieldName]) {
                        values.push(this.record.fields[fieldName].value);
                    }
                }

                this.valueObj = this.showFirst ? values[0] : values.join(' \u2022 ');
            }

            this.href = '/' + this.record.id;
            this.isValue = true;
        } else if (error) {
            console.log('error in wire', this.valueId)
            this.error = error;
            this.record = undefined;
            console.log("this.error", this.error);
        }
    }

    handleClick(event) {
        this.handleDropdownPosition(event);

        this.inputClass = 'slds-has-focus';
        this.showDropDown = true;
    }

    handleDropdownPosition(event) {
        const { clientWidth } = event.target;
        // set dropdown items width by parent element
        this.styledWidth = `width:${clientWidth}px`
    }

    handleMouseDown() {
        this.isVisible = true;
    }

    onBlur() {
        if (this.isVisible) {
            this.template.querySelector('lightning-input')?.focus();
            this.isVisible = false;
            return;
        }

        this.blurTimeout = setTimeout(() => {
            this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
            this.showDropDown = false;
            if (!this.valueId) {
                this.searchTerm = '';
            }
        }, 250);
    }

    onSelect(event) {
        let ele = event.currentTarget;
        let selectedId = ele.dataset.id;

        let element = this.options.find(o => o.Id == selectedId)
        let fieldsParams = element.FieldsParams;

        //As a best practice sending selected value to parent and in return parent sends the value to @api valueId
        this.fireValueSelectEvent({ selectedId, fieldsParams, uniqueId: this.uniqueId });

        this.isValue = false;
        this.searchTerm = '';

        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    onChange(event) {
        this.searchTerm = event.target.value;

        this.handleDropdownPosition(event);
        // fire event of current searchTerm
        const searchTermEvent = new CustomEvent('valuechange', {
            detail: { searchTerm: this.searchTerm },
        });
        this.dispatchEvent(searchTermEvent);
    }

    clearValue() {
        this.isValue = false;
        this.recordId = ''
        this.searchTerm = '';
        this.fireValueSelectEvent({ selectedId: '', uniqueId: this.uniqueId });
    }

    createRecordFunc() {

        if (this.recordTypeId) {
            this.recordTypeSelector = false;
            this.mainRecord = true;
            //stencil before getting data
            this.stencilClass = '';
            this.stencilReplacement = 'slds-hide';
        }
        else if (this.recordTypeOptions && this.recordTypeOptions.length > 0) {
            this.recordTypeSelector = true;
        } else {
            this.recordTypeSelector = false;
            this.mainRecord = true;
            //stencil before getting data
            this.stencilClass = '';
            this.stencilReplacement = 'slds-hide';
        }
        this.createRecordOpen = true;
    }

    handleRecTypeChange(event) {
        this.recordTypeId = event.target.value;
    }

    createRecordMain() {
        this.recordTypeSelector = false;
        this.mainRecord = true;
        //stencil before getting data
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';
    }

    handleLoad(event) {
        let details = event.detail;

        if (details) {
            setTimeout(() => {
                this.stencilClass = 'slds-hide';
                this.stencilReplacement = '';
                this.myPadding = 'slds-p-around_medium slds-modal__content';
            }, 1000);
        }
    }

    handleSubmit() {
        this.template.querySelector('lightning-record-form').submit();
    }

    handleSuccess(event) {
        this.createRecordOpen = false;
        this.mainRecord = false;
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';
        const { id, fields } = event.detail;

        let fieldsParams = []
        for (let fieldApiName of Object.getOwnPropertyNames(fields)) {
            fieldsParams[fieldApiName] = fields[fieldApiName]?.value
        }

        this.fireValueSelectEvent({ selectedId: id, fieldsParams, uniqueId: this.uniqueId });

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: `Record saved successfully with id: ${selectedId}`,
                variant: 'success',
            }),
        )
    }

    handleError(event) {
        const { output: { errors } } = event.detail

        for (let error of errors) {
            let errorCode = error?.errorCode;
            let errorMessage = error?.message;

            if (errorCode === 'DUPLICATES_DETECTED') {
                // get duplicate recordIds
                let matchResults = error?.duplicateRecordError?.matchResults || [];
                if (matchResults[0]) {
                    let matchRecordIds = matchResults[0]?.matchRecordIds || []
                    errorMessage += ` ${matchRecordIds.join(", ")}`
                }
            }

            this.dispatchEvent(
                new ShowToastEvent({
                    title: errorCode,
                    message: errorMessage,
                    variant: 'error',
                }),
            )
        }
    }

    closeModal() {
        this.stencilClass = '';
        this.stencilReplacement = 'slds-hide';
        this.createRecordOpen = false;
        this.recordTypeSelector = false;
        this.mainRecord = false;
    }

    labels = {};
}