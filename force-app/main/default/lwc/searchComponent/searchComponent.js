import { LightningElement, api } from "lwc";
import getFieldsAndRecords from "@salesforce/apex/SearchComponentController.getFieldsLabels";

export default class SearchComponent extends LightningElement {
    @api SFDCobjectApiName = "Contact";
    @api fieldSetName = "SearchContactFieldSet";
    fieldObject;
    searchKeyword;

    connectedCallback() {
        getFieldsAndRecords({
            strObjectApiName: this.SFDCobjectApiName,
            strfieldSetName: this.fieldSetName
        }).then((data) => {
            let objStr = JSON.parse(data);
            let listOfFields = JSON.parse(Object.values(objStr)[0]);

            this.fieldObject = listOfFields;
            console.log("listOfFields::0", listOfFields);
        });
    }

    handleUserInput(event){
        this.searchKeyword = event.target.value;
        
    }

    handleSearch(){
        var inp=this.template.querySelector("lightning-input").value;
        //let name=inp.value;
        console.log('12123323',inp);
    }
}