import { LightningElement, api } from 'lwc';
import { showToast } from 'c/toastService';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
export default class FlowToast extends LightningElement {

    @api message;
    @api title;
    @api mode;
    @api variant;

    connectedCallback() {
      if(this.message) this.showToast();
    }

    showToast() {
        const {title, message, variant, mode} = this

        showToast.call(this, title, message, variant, mode);
        const attributeChangeEvent = new FlowAttributeChangeEvent(
            'message',
            ''
        );
        this.dispatchEvent(attributeChangeEvent);
    }
}