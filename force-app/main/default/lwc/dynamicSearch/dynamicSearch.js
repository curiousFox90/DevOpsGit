import { api, LightningElement,wire } from 'lwc';
import getContaactMeta from '@salesforce/apex/MetadataManager.contactMetadata';
export default class DynamicSearch extends LightningElement 
{
    @api objectApiName;
    @wire(getContaactMeta,{objectName : '$objectApiName'}) accFields;
    connectedCallback() 
    {
        console.log('LWC Component Loaded Successfully');
        
    }
    
}