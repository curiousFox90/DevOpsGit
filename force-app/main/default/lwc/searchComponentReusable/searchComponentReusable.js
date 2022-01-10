import { api,LightningElement,track,wire } from 'lwc';
import searchContent from '@salesforce/apex/Dynamicquery.fetchQueryString';
import getFieldsAndRecords from "@salesforce/apex/FieldSetControllerCheck.getFieldsLabels";
import getMetaConfigs from "@salesforce/apex/FieldSetControllerCheck.getMetaConfig";
import labelGetter from "@salesforce/apex/FieldSetFieldsGetter.getObjectLabel";
import pubsub from 'c/pubSub';
import defaultObj from '@salesforce/label/c.Dynamic_Search_Default_Value';

export default class SearchComponentReusable extends LightningElement 
{
    
    label = {
        defaultObj,
    };
    
    
    @api objectApiName;
    fieldObject;
    searchKeyword;
    apiNames=[];
    searchString;
    @track objectInfo;
    @track maxRecordsCount;
    @track isActive;
    @track searchSetName;
    @track resultSetName;
    @track objInfoHolder;
    @track results;
    @track errors;
    @track metResult;
    @track metError;
    @track componentHeader;
    @track limitMessage;
    @track noDataMessage;
    @track labelMessage;
    @track labelError;
    @track buttonDisabled=true;
    @track validationMessage;
    @track clearCols=false;
    @track isclear=true;
    handleReset() 
    {

        this.template.querySelector('form').reset();

        var inp=this.template.querySelectorAll("lightning-input");
        inp.forEach(function(element)
        {
            if(!element.required)
            {
                element.value='';
                element.setCustomValidity('');
                element.reportValidity(); 
            }
            if(element.required)
            {
                element.value='';
            }
            
        },this);

        this.refreshTable=true;
        this.clearCols=true;
        this.isclear=false;
        console.log('clear cals in handle reset : '+this.clearCols);
        this.buttonValidator();
        this.handleSearch();
        
    }

    @wire(labelGetter,{objApiName: '$objectApiName'})
    getLabelOfObject({ error, data })
    {
        
        if(data)
        {
            this.labelMessage=data;
            this.componentHeader= 'Search '+this.labelMessage;
            this.labelError=undefined;

        }
        else if(error)
        {
            this.labelError=error;
            this.labelMessage=undefined;
        }
    }
    

    connectedCallback() {
        
        
        console.log('Object API name : '+this.objectApiName);
        if(this.objectApiName == 'undefined' || this.objectApiName == null || this.objectApiName =='')
        {
            console.log('inside object checking  ');
            this.objectApiName=this.label.defaultObj;
            console.log('After label object name update : '+this.objectApiName);
        }
        getMetaConfigs({ objApiName: this.objectApiName })
            .then((results) => {
                this.metResult = results;
                this.errors = undefined;
                console.log('Result in meta : '+this.metResult.Is_Active__c);
                
                if(this.metResult.length !== 0)
                {
                    this.maxRecordsCount=this.metResult.Max_Records_Too_Display__c;
                    this.isActive = this.metResult.Is_Active__c;
                    this.searchSetName = this.metResult.search_fieldset__c;
                    this.resultSetName = this.metResult.Result_Fieldset__c;
                    this.limitMessage= this.metResult.Error_Message__c;
                    this.noDataMessage= this.metResult.No_Data_Message__c;
                    getFieldsAndRecords({
                        strObjectApiName: this.objectApiName,
                        strfieldSetName: this.searchSetName
                    }).then((data) => {
                        let objStr = JSON.parse(data);
                        let listOfFields = JSON.parse(Object.values(objStr)[0]);
                        console.log('List of fields is : '+listOfFields);
                        this.fieldObject = listOfFields;
                        console.log("listOfFields::0", listOfFields);
                        listOfFields.forEach(function(element){
                            console.log('Field type is : '+element.type);
                            console.log(element.fieldPath);
                            this.apiNames.push(element.fieldPath);
                            console.log(this.apiNames);
                            console.log(this.inlineHelpText);
                        },this);
                    });
                }
                else
                {
                    this.isActive = false;
                }
                console.log('Component AActive Status is '+this.isActive);
                console.log('Field set name before calling : '+this.searchSetName);
                
            })
            .catch((errors) => {
                this.metError = errors;
                this.results = undefined;
            });



            


        
    }

    buttonValidator()
    {
        console.log('In button validator');
        var inp=this.template.querySelectorAll("lightning-input");
        var breakIt=true;
        inp.forEach(function(element)
        {
            console.log('element in button validator : '+element.value);
            if(element.value !== '')
            {
                this.buttonDisabled=false;
                breakIt=false;
                return
            }
           
        },this);
        if(breakIt)
        {
            this.buttonDisabled=true;
        }
        
        
    }

    handleSearch()
    {
        var regex = /^[A-Za-z0-9 ]+$/
        console.log('Object API name is : '+this.objectApiName);
        console.log('Max records : '+this.maxRecordsCount);
        console.log('search set name : '+this.searchSetName);
        console.log('result set name : '+this.resultSetName);
        
        this.searchString='{';
        console.log('Inside handlesearchtest method');
        var counter=0;
        var inp=this.template.querySelectorAll("lightning-input");
       
        inp.forEach(function(element)
        {
            console.log('Element type debug : '+element.type);
            if(element.value !=="")
            {
                if(element.type != 'email' && element.type != 'phone' && element.type !='date' && element.type !='datetime-local')
                {
                    var isValid= regex.test(element.value);
                    if(!isValid)
                    {
                        
                        element.setCustomValidity('Special charecter not allowed in field : '+element.label);
                        element.reportValidity();

                        
                    }
                    else{
                        element.setCustomValidity('');
                        element.reportValidity();
                    }
                }
            }
            
            
            if(element.value !=="")
            {
                
                console.log(this.apiNames[counter]+'---'+element.value);
                
                this.searchString = this.searchString+'"'+this.apiNames[counter]+'": '+'"'+element.value+'",';
            }
            if(element.required )
            { 
                if(element.value == '' && this.isclear == true)
                {
                    element.reportValidity();
                    this.searchString='';
                    this.clearCols=true;
                }
                this.isclear = true;
                
            }
            counter=counter+1;
        },this);
        
        this.searchString=this.searchString.slice(0, -1);;
        if(this.searchString !=='')
        {
            this.searchString=this.searchString+'}';
        }
        
        console.log('Final search string is : '+this.searchString);
        let builtString= this.searchString;
        
      
      console.log('After stringifying : '+builtString);
      console.log('Clear cols in pub : '+this.clearCols);

        searchContent({ filterValues: builtString,objectName : this.objectApiName })
            .then((result) => {
                this.results = result;
                this.errors = undefined;
                let subMessage={
                    "objectAPIName": this.objectApiName,
                    "builtQuery" : this.results,
                    "maxRecords" : this.maxRecordsCount,
                    "searchSet" : this.searchSetName,
                    "resultSet" : this.resultSetName,
                    "limitMessage" : this.limitMessage,
                    "noDataMessage" : this.noDataMessage,
                    "clearHead" : this.clearCols,
                    
                }
                console.log('Result is : '+this.results);
                pubsub.fire("response" ,subMessage);
                console.log('pubsub fired: ',subMessage);
                
            })
            .catch((error) => {
                this.errors = error;
                this.results = undefined;
                
            });
            this.searchString='';
            builtString='';
            

        

    }

}