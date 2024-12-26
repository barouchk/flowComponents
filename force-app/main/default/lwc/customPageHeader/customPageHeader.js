import { LightningElement, api } from 'lwc';

export default class CustomPageHeader extends LightningElement {

    @api icon

    @api title

    @api subTitle
}