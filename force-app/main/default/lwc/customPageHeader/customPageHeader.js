import { LightningElement, api } from 'lwc';

export default class CustomPageHeader extends LightningElement {

    @api icon

    @api title

    @api subTitle

    _fields = []
    @api fields

    connectedCallback() {
        this.populateFields()
    }

    populateFields() {
        if (this.fields) {
            try {
                this._fields = JSON.parse(this.fields);
            } catch (e) {
                this._fields = ''
            }
        }
    }
}