import { LightningElement,api,track } from 'lwc';
//import getFieldsAndRecords from '@salesforce/apex/FieldSetHelper.getFieldsAndRecords';
import selectOption from '@salesforce/apex/DropDownController.selectedOption';
import getFieldsAndRecords from '@salesforce/apex/DropDownController.getFieldsAndRecords';
export default class DynamicDatatable extends LightningElement {

    
    @api recordId;  // record id from record detail page e.g. ''0012v00002WCUdxAAH'
    @api SFDCobjectApiName; //kind of related list object API Name e.g. 'Contact'
    @api fieldSetName; // FieldSet which is defined on that above object e.g. 'CaseRelatedListFS'
    @api criteriaFieldAPIName; // This field will be used in WHERE condition e.g.'AccountId'
    @api firstColumnAsRecordHyperLink; //if the first column can be displayed as hyperlink

    @track columns;   //columns for List of fields datatable
    @track tableData;   //data for list of fields datatable
    @api selectedContactIdList=[];//for combobox
    selectedValue;//for combobox
    @track error;

    @track sortBy;//for sorting the coloumn
    @track sortDirection//for sorting the coloumn
   // @track sortBy; //for srting the Coontact List
    //@track sortDirection //for srting the Coontact List
    recordCount; //this displays record count inside the ()
    lblobjectName; //this displays the Object Name whose records are getting displayed

    connectedCallback(){
        let firstTimeEntry = false;
        let firstFieldAPI;

        //make an implicit call to fetch records from database
        getFieldsAndRecords({ strObjectApiName: this.SFDCobjectApiName,
                                strfieldSetName: this.fieldSetName,
                                //criteriaField: this.criteriaFieldAPIName,
                                //criteriaFieldValue: this.recordId
                            })
        .then(data=>{        
            //get the entire map
            let objStr = JSON.parse(data);   
            console.log("Object is"+objStr.toString());
            
            /* retrieve listOfFields from the map,
             here order is reverse of the way it has been inserted in the map */
            let listOfFields= JSON.parse(Object.values(objStr)[1]);
            console.log(" list of is "+listOfFields);
            
            //retrieve listOfRecords from the map
            let listOfRecords = JSON.parse(Object.values(objStr)[0]);

            let items = []; //local array to prepare columns

            listOfFields.map(element=>{
                
                if(this.firstColumnAsRecordHyperLink !=null && this.firstColumnAsRecordHyperLink=='Yes'
                                                  && firstTimeEntry==false){
                    firstFieldAPI  = element.fieldPath; 
                                 
                    items = [...items ,
                                    {
                                        label: element.label, 
                                        fieldName: 'URLField',
                                        fixedWidth: 150,
                                        type: 'url', 
                                        typeAttributes: { 
                                            label: {
                                                fieldName: element.fieldPath
                                            },
                                            target: '_blank'
                                        },
                                        sortable: true 
                                    }
                    ];
                    firstTimeEntry = true;
                } else {
                    items = [...items ,{label: element.label, 
                        fieldName: element.fieldPath, sortable: true,hideDefaultActions: "true" }];
                }   
            });
            //finally assigns item array to columns
            this.columns = items; 
            this.tableData = listOfRecords;

            console.log('listOfRecords',listOfRecords);
            /*if user wants to display first column has hyperlink and clicking on the link it will
                naviagte to record detail page. Below code prepare the field value of first column
            */
            if(this.firstColumnAsRecordHyperLink !=null && this.firstColumnAsRecordHyperLink=='Yes'){
                let URLField;
                //retrieve Id, create URL with Id and push it into the array
                this.tableData = listOfRecords.map(item=>{
                    URLField = '/lightning/r/' + this.SFDCobjectApiName + '/' + item.Id + '/view';
                    return {...item,URLField};                     
                });
                
                //now create final array excluding firstFieldAPI
                this.tableData = this.tableData.filter(item => item.fieldPath  != firstFieldAPI);
            }

            //assign values to display Object Name and Record Count on the screen
            this.lblobjectName = this.SFDCobjectApiName;
            this.recordCount = this.tableData.length;
            this.error = undefined;   
        })
        .catch(error =>{
            this.error = error;
            console.log('error',error);
            this.tableData = undefined;
            this.lblobjectName = this.SFDCobjectApiName;
        })        
    }

    // For Combobox
    get options() {
        return [
            //{ label: '0', value: '0' },
            { label: '25', value: '25' },
            { label: '50', value: '50' },
            { label: '75', value: '75' },
            { label: '100', value: '100' },
        ];
    }
    // calling the apex method for combobox
   
    handleChange(event) {
        this.selectedValue = event.detail.value;
        console.log('Selected value is : '+this.selectedValue);
  
        selectOption({recordSize: this.selectedValue}) // calling the apex method for combobox
              .then(result => {
                  console.log("in success,",result);
                  this.tableData = result;
                  this.error = undefined;

                 
              })
              .catch(error => {
                 
                  this.error = error;
                  this.tableData = undefined;
              });
  
      }

      

       //shorting the name of the Contacts here
   handleSortdata(event) {
    // field name
    this.sortBy = event.detail.fieldName;

    // sort direction
    this.sortDirection = event.detail.sortDirection;

    // calling sortdata function to sort the data based on direction and selected field
    this.sortData(event.detail.fieldName, event.detail.sortDirection);
}

sortData(fieldname, direction) {
    // serialize the data before calling sort function
    let parseData = JSON.parse(JSON.stringify(this.tableData));

    // Return the value stored in the field
    let keyValue = (a) => {
        return a[fieldname];;
    };

    // cheking reverse direction 
    let isReverse = direction === 'asc' ? 1: -1;

    // sorting data 
    parseData.sort((x, y) => {
        x = keyValue(x) ? keyValue(x) : ''; // handling null values
        y = keyValue(y) ? keyValue(y) : '';

        // sorting values based on direction
        return isReverse * ((x > y) - (y > x));
    });

    // set the sorted data to data table data
    this.tableData = parseData;

}
      

}