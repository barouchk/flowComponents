import { LightningElement, api } from 'lwc';

export default class CustomTile extends LightningElement {
    
    @api title
    @api icon
    @api lines
    @api inverse;
    @api titleClass;
    @api label;
    @api labelClass;
    @api type;
    @api variant

    _detailClass
    @api 
    get detailClass() {
        return `slds-tile__detail ${this._detailClass ?? ''}`
    }
    set detailClass(value) {
        this._detailClass = value;
    }
    
    get bgClass() { 
        return `lgc-bg${this.inverse? '-inverse':''}` 
    }

    get isMedia() {
        return this.type === "media";
    }
    get bodyMediaClass() {
        return `slds-media__body ${this.icon ? 'slds-border_left slds-p-around_small' : ''}`;
    }

    setMediaClass() {
        this.isMedia && this.classList.add("slds-media");
    }

    connectedCallback() {
        this.classList.add('slds-tile');
        this.setMediaClass();
    }

}