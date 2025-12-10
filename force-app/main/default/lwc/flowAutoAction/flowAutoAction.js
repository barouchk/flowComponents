import { LightningElement, api } from 'lwc';
import {
    FlowNavigationNextEvent, FlowNavigationBackEvent,
    FlowNavigationFinishEvent, FlowNavigationPauseEvent
} from 'lightning/flowSupport';

export default class FlowAutoAction extends LightningElement {

    @api availableActions = [];
    @api action
    @api timeout

    connectedCallback() {
        const { action, timeout } = this
        if (timeout && action) {
            setTimeout(() => {
                this.fireEvent(action);
            }, timeout);

        } else if (action) {
            this.fireEvent(action);
        }
    }

    fireEvent(action) {
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