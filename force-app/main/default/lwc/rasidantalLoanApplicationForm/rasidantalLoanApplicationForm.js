import { LightningElement, api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/ResidentialLoanApplication.Name';
import REVENUE_FIELD from '@salesforce/schema/ResidentialLoanApplication.AccountId';
import INDUSTRY_FIELD from '@salesforce/schema/ResidentialLoanApplication.OpportunityId';

export default class RasidantalLoanApplicationForm extends LightningElement {
    @api recordId;
    @api objectApiName = 'ResidentialLoanApplication';

    fields = [NAME_FIELD, REVENUE_FIELD, INDUSTRY_FIELD];

    handleSubmit(event){
        console.log('Handle Submit');
        /*event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        fields.LastName = 'My Custom Last Name'; // modify a field
        this.template.querySelector('lightning-record-form').submit(fields);*/
     }
}