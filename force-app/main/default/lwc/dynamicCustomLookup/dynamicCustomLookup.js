import { LightningElement, api, track } from 'lwc';

export default class DynamicCustomLookup extends LightningElement {

    @api recordId;
    @api objectName
    @api fieldName;    // field to search by
    @api fieldNameDisplay    // field to show in the combobox
    @api showFirst = false
    @api hideHref = false
    @api variant = "label-hidden";
    @api showLabel = false;
    @api returnFieldValue;
    @api returnField;
    @api initValue;
    @api errMsg;
    @api iconName;
    @api label;
    @api name;
    @api placeholder;
    @api multiSelect;
    @api required;
    @api extraParams
    @api returnSelectedList;
    @api limit; 
    @api isSosl = false   
    // fix issue when drop down is inside a modal (going under the modal)
    @api autoAlignment = false

    _extraParams = {}
    _requiredConditioned;
    @track _selectedRecords = [];
    _selectedItemsMap = new Map();
    _disable = false;
    
    connectedCallback(){
        if(this.extraParams){
            this._extraParams = JSON.parse(this.extraParams);
        }
        this._requiredConditioned = this.required;
    }
    
    handleValueSelected({ detail: { selectedId, fieldsParams }}){
        this.recordId = this.multiSelect ? '' : selectedId;

        if(this.multiSelect && fieldsParams){
            let selectedName = fieldsParams[this.fieldNameDisplay.split(',')[0]];
            this._selectedItemsMap.set(selectedId,this.createPill(selectedId, selectedName));
            this._requiredConditioned = false;
            this.returnFieldValue = null;
            this.updateSelection();
        }
        else if(fieldsParams){
            if(this.returnField){
                this.returnFieldValue = fieldsParams[this.returnField];
            }
        }else{
            this.returnFieldValue = null;
        }
    }

    @api
    validate() {
        let isValid = true;
        if(this._requiredConditioned){
            if(this.multiSelect && this._selectedRecords.length == 0){
                isValid = false;
            }
            else if(this.isEmpty(this.recordId)){
                isValid = false;
            }
        }
        return { isValid, errorMessage: this.errMsg };
    }

    handleItemRemove(event) {
        const id = event.detail.item.id;
        this._selectedItemsMap.delete(id);
        this._requiredConditioned = this.required && this._selectedRecords.length == 0;
        this.updateSelection();
    }

    updateSelection(){
        this._selectedRecords = [...this._selectedItemsMap.values()];
        const selectedIds = [...this._selectedItemsMap.keys()];
        this.returnSelectedList = selectedIds;
        this.disableByLimit(selectedIds.length);
        this.fireListSelectedEvent({selectedIds});
    }

    disableByLimit(count){
        if(this.limit && this.limit > 0){
            this._disable = count >= this.limit;
        }
    }

    createPill(id, label){
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

    isEmpty(data){
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