import { LightningElement, api } from 'lwc';

export default class CustomPageHeader extends LightningElement {

    @api icon

    @api title

    @api subTitle

    _fields = []
    @api fields

    connectedCallback() {
        if (this.fields) {
            this._fields = JSON.parse(this.fields);
        }
    }
}