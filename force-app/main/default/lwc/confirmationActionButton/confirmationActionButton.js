import { LightningElement, api, track } from 'lwc';
import { FlowNavigationNextEvent, FlowNavigationFinishEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';

export default class ConfirmationActionButton extends LightningElement {

    @api availableActions = [];
    // Button
    @api buttonLabel = 'Submit';
    @api buttonVariant = 'brand';

    // Modal
    @api modalHeader = 'Confirmation';
    @api modalMessage = 'Are you sure you want to submit?';

    // Confirmation button
    @api confirmLabel = 'Confirm';
    @api confirmVariant = 'brand';

    // Confirmation button
    @api cancelLabel = 'Cancel';
    @api cancelVariant = 'neutral';

    // Confirmation button
    @api prevLabel = 'Previous';
    @api prevVariant = 'neutral';

    // Flow action output
    @api actionName;
    @api actionTriggered = 'NEXT';

    @track isOpen = false;

    openModal() {
        this.isOpen = true;
    }

    closeModal() {
        this.isOpen = false;
    }

    confirmAction() {
        this.isOpen = false;
        this.fireEvent(this.actionTriggered);
    }

    backButtonClicked() {
        this.fireEvent('BACK');
    }

    fireEvent(action) {
        const { actionTriggered } = this
        if (this.availableActions.find(act => act === action)) {

            let navigateEvent

            if (action === 'NEXT') {
                navigateEvent = new FlowNavigationNextEvent();
            } else if (action === 'BACK') {
                navigateEvent = new FlowNavigationBackEvent();
            } else if (action === 'FINISH') {
                navigateEvent = new FlowNavigationFinishEvent();
            }

            if (navigateEvent) {
                this.dispatchEvent(navigateEvent);
            }
        }
    }
}