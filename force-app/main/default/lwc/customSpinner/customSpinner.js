import { api, LightningElement } from 'lwc';

export default class CustomSpinner extends LightningElement {

    @api helpText = '';
    @api size = 'medium';
    @api variant = 'base';
    @api position = 'fixed';

    sizesList = ['small', 'medium', 'large'];
    positionsList = ['fixed','absolute','relative','static']
    spinnerClass = '';

    get spinnerSize() {
        return this.sizesList.includes(this.size) ? 'spinner-' + this.size : 'spinner-medium';
    }
    get spinnerPosition() {
        return this.positionsList.includes(this.position) ? 'slds-is-' + this.position : 'slds-is-fixed';
    }
    connectedCallback() {
        this.spinnerClass = this.spinnerSize + ' ' + this.spinnerPosition;
    }
}