import { LightningElement, api, track } from 'lwc';

export default class CustomFlowActions extends LightningElement {

    @api recordId

    @api jsonActions = []

    @track actions = []

    @track inputVariables = []

    flowApiName = ''

    connectedCallback() {
        try {
            if (this.jsonActions) {
                this.actions = JSON.parse(this.jsonActions).map(item => {
                    return { label: item.label, type: item.type, value: item.value, variant: item.variant };
                })
            }
        } catch (e) {
            console.log(e);
        }
    }

    handleActionClicked(event) {

        const { name } = event.target
        const { recordId } = this

        this.inputVariables.push({
            name: 'recordId',
            type: 'String',
            value: recordId || ''
        })

        this.flowApiName = name
    }

    handleFlowStatusChange(event) {
        const { status } = event.detail

        if (status === 'FINISHED') {
            // set behavior after a finished flow interview
            this.closeModal()
        } else if (status === 'ERROR') {
            // set behavior after a finished flow interview
            console.log('event >> ', event);
        }
    }

    closeModal() {
        this.flowApiName = '';
        this.inputVariables = []
    }


}