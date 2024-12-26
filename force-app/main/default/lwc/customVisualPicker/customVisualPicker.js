import { LightningElement, api } from 'lwc';
import { PICKER_TYPES, pickerHeadingClass, pickerClass } from './constants';

export default class CustomVisualPicker extends LightningElement {
    @api pickerId;
    @api pickerType = PICKER_TYPES.RADIO;
    @api pickerValue;
    @api pickerSize;

    @api get pickerDisabled () {
        return this.__pickerDisabled || this.pickerRequired;
    };
    set pickerDisabled (value) {
        this.__pickerDisabled = value;
    }

    @api get pickerChecked () { 
        return this.__pickerChecked || this.pickerRequired ; 
    };
    set pickerChecked (value) {
        this.__pickerChecked = value;
    }

    @api get pickerRequired() {
        return this.pickerType === PICKER_TYPES.CHECKBOX && this.__pickerRequired 
    };
    set pickerRequired(value) {
        this.__pickerRequired = value;
    }

    get pickerClass() {
        return pickerClass(this); 
    } 

    handleChange( { target: { value }} ) {
        this.dispatchEvent(
          new CustomEvent("picked", {
            detail: { value },
            bubbles: true,
            composed: true
          })
        );
    }
}
export { PICKER_TYPES, pickerHeadingClass };