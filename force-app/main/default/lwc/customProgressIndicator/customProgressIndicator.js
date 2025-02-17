/**
 * Created by bkandov on 29/12/2020.
 */

import { LightningElement, api } from 'lwc';
import userLanguage from '@salesforce/i18n/lang';

export default class CustomProgressIndicator extends LightningElement {

    @api currentStep

    @api type = 'base'

    @api hasError = false

    @api steps
    _steps = []

    completePrecent = 0
    markerClass = 'slds-progress__marker'

    connectedCallback() {
        if (userLanguage === 'he') {
            this.markerClass += ' marker__heb'
        }

        if (this.steps) {
            this._steps = this.steps.map((step) => ({
                ...step,
                stepClass: this.currentStep && this.currentStep === step.value ? 'slds-progress__item slds-is-active' : 'slds-progress__item'
            }))
        }

        if (this.currentStep) {
            for (let step of this._steps) {
                if (step.value !== this.currentStep) {
                    step.stepClass += ' slds-is-completed'
                } else {
                    break;
                }
            }
        }
    }

}