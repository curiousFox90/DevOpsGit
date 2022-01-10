import { LightningElement, api, track } from "lwc";
import getFieldsAndRecords from "@salesforce/apex/FieldSetControllerCheck.getFieldsLabels";
export default class DynamicFieldsRetriever extends LightningElement 
{
    @api SFDCobjectApiName = "Contact";
    @api fieldSetName = "SearchContactFieldSet";
    fieldObject;
    searchKeyword;
    apiNames=[];
    searchString='{';

    @track field1;
    @track field2;
    @track field3;
    @track field4;
    @track field5;
    @track field6;
    @track field7;
    @track field8;
    @track field9;
    @track field10;

    connectedCallback() {
        getFieldsAndRecords({
            strObjectApiName: this.SFDCobjectApiName,
            strfieldSetName: this.fieldSetName
        }).then((data) => {
            let objStr = JSON.parse(data);
            let listOfFields = JSON.parse(Object.values(objStr)[0]);
            console.log('List of fields is : '+listOfFields);
            this.fieldObject = listOfFields;
            console.log("listOfFields::0", listOfFields);
            listOfFields.forEach(function(element){
                console.log(element.fieldPath);
                this.apiNames.push(element.fieldPath);
                console.log(this.apiNames);
            },this);
        });
    }

    handleUserInput(event){
        this.searchKeyword = event.target.value;
        
    }

    handleSearch(){
        //var inp=this.template.querySelector("lightning-input").value;
        //let name=inp.value;
        //console.log('12123323',inp);
        var inp=this.template.querySelectorAll("lightning-input");
        inp.forEach(function(element){
            console.log('Print elemnt 1: '+element.key);
            console.log('Print elemnt 2: '+element.value);
            console.log('Inside For Each');
            console.log('Element Name : '+element.value);
            if(element.name=="0")
                this.field1=element.value;
                
                
                
            else if(element.name=="1")
                this.field2=element.value;

                else if(element.name=="2")
                this.field3=element.value;
                else if(element.name=="3")
                this.field4=element.value;
                else if(element.name=="4")
                this.field5=element.value;
                else if(element.name=="5")
                this.field6=element.value;
                else if(element.name=="6")
                this.field7=element.value;
                else if(element.name=="7")
                this.field8=element.value;
                else if(element.name=="8")
                this.field9=element.value;
                else if(element.name=="9")
                this.field10=element.value;
                
        },this);
        console.log(this.field1);
        console.log(this.field2);
        console.log(this.field3);
        console.log(this.field4);
        console.log(this.field5);
        console.log(this.field6);
        console.log(this.field7);
        console.log(this.field8);
        console.log(this.field9);
        console.log(this.field10);
        
    }

    handleSearchTest()
    {
        console.log('Inside handlesearchtest method');
        var counter=0;
        var inp=this.template.querySelectorAll("lightning-input");
        inp.forEach(function(element)
        {

            if(element.value !=="")
            {
                console.log(this.apiNames[counter]+'---'+element.value);
                this.searchString = this.searchString+this.apiNames[counter]+': '+element.value+',';
            }
            counter=counter+1;
        },this);
        this.searchString=this.searchString.slice(0, -1);;
        this.searchString=this.searchString+'}';
        console.log('Final search string is : '+this.searchString);
    }
}