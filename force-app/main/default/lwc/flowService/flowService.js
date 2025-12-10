/**
 * Created by bkandov.
 *
 * HOW TO USE:
 * 1. import service to your custom component: 
 * import FlowService from 'c/flowService'
 * 
 * 2. declare flow parameter in you custom component: 
 * @api availableActions = [];
 * 
 * 3. call service by .call javascript method to bind this parameter: 
 * FlowService.goNext.call(this);
 */

import {
    FlowNavigationNextEvent, FlowNavigationBackEvent,
    FlowNavigationFinishEvent, FlowNavigationPauseEvent,
    FlowAttributeChangeEvent
} from 'lightning/flowSupport';

class FlowService {

    goNext() {
        console.log('this.availableActions  ', this.availableActions)
        // check if NEXT is allowed on this screen
        if (this.availableActions.find(action => action === 'NEXT')) {

            console.log('flow next action  ', this)
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    goBack() {
        // check if BACK is allowed on this screen
        if (this.availableActions.find(action => action === 'BACK')) {
            // navigate to the back screen
            const navigateBackEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateBackEvent);
        }
    }

    finish() {
        // check if FINISH is allowed on this screen
        if (this.availableActions.find(action => action === 'FINISH')) {
            // navigate to the finish screen
            const navigateFinishEvent = new FlowNavigationFinishEvent();
            this.dispatchEvent(navigateFinishEvent);
        }
    }
}

export default new FlowService();