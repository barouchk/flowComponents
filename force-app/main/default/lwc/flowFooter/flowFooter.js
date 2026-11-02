import { LightningElement, api } from 'lwc';
import {
    FlowNavigationNextEvent,
    FlowNavigationBackEvent,
    FlowNavigationFinishEvent
} from 'lightning/flowSupport';
import { showError, reduceErrors } from 'c/toastService';

const FOOTER_BASE_CLASS = 'slds-size_1-of-1 slds-card__footer actionButtonBar slds-grid';

export default class FlowFooter extends LightningElement {
    @api availableActions = [];
    @api hideBack = false;
    @api hidePause = false;
    @api hideNext = false;
    @api disableBack;
    @api disablePause;
    @api disableNext;
    @api nextLabel = 'Next';
    @api backLabel = 'Back';
    @api finishLabel;

    // Return a promise that resolves to true to proceed with the flow event
    @api backCallback;
    @api pauseCallback;
    @api nextCallback;

    @api buttonsSpread;

    constructor() {
        super();
        eval("$A.get('e.force:refreshView').fire();"); // update record page with recent field values
    }

    get buttonsSpreadClass() {
        const alignmentClass = this.buttonsSpread === 'standard'
            ? 'slds-grid_align-end'
            : 'slds-grid_align-spread';
        return `${FOOTER_BASE_CLASS} ${alignmentClass}`;
    }

    get nextButtonLabel() {
        return this.isNextAvailable
            ? this.nextLabel
            : (this.finishLabel || this.nextLabel);
    }

    get isNextAvailable() {
        return this.hasAction('NEXT');
    }

    hasAction(actionName) {
        return (this.availableActions || []).includes(actionName);
    }

    async handleBack() {
        const canProceed = await this.runCallback('back');
        if (!canProceed) {
            return;
        }
        this.dispatchEvent(new FlowNavigationBackEvent());
    }

    async handleNext() {
        const canProceed = await this.runCallback('next');
        if (!canProceed) {
            return;
        }

        if (this.isNextAvailable) {
            this.dispatchEvent(new FlowNavigationNextEvent());
            return;
        }

        this.dispatchEvent(new FlowNavigationFinishEvent());
    }

    async runCallback(actionName) {
        try {
            const callback = this[`${actionName}Callback`];
            if (!callback) {
                return true;
            }
            return (await callback(actionName)) === true;
        } catch (error) {
            console.error(JSON.stringify(error), error.stack);
            showError.call(this, reduceErrors(error)[0]);
            return false;
        }
    }
}
