import { LightningElement,wire,track,api} from 'lwc';
import pubsub from 'c/pubSub';
import selectOption from '@salesforce/apex/DropDownController.selectedOption';
import { NavigationMixin } from 'lightning/navigation';
const actions = [
    { label: 'View Details', name: 'view_details' },
    { label: 'Delete', name: 'delete' },
];

const columns = [
    { label: 'First Name', fieldName: "FirstName",type: "button",sortable: true,
    typeAttributes: { label: { fieldName: "FirstName" },
    name: "gotoContact", variant: "base" } 
 },
    { label: 'Last Name', fieldName: 'LastName',sortable: "true", type: 'text' },
    { label: 'Mobile', fieldName: 'Phone',sortable: "true", type: 'phone' },
    { label: 'Email', fieldName: 'Email',sortable: true, type: 'email' }
    // { label: 'Account Name', fieldName: 'accountLink', type: 'url',
    //         typeAttributes:{label:{fieldName: 'accountName'},target:'_blank'} },
    // { label: 'Account Number', fieldName: 'accountNumber', type: 'text' },
    // { label: 'Account Rating', fieldName: 'rating', type: 'text', cellAttributes:
    //         { iconName: { fieldName: 'accountRatingIcon' }, iconPosition: 'right' }},
    // { label: 'Industry', fieldName: 'industry', type: 'text' },
    // {
    //     type: 'action',
    //     typeAttributes: { rowActions: actions },
    // },
    
];


export default class CompOutput extends LightningElement {
    @track columns = columns;
    @track data;
    @track contacts;
    @track error;
    @api recordId;
    @api selectedContactIdList=[];
     selectedValue;
    @track messageFromPubs;
    @track sortBy;
    @track sortDirection
 isSearchResults = true;

// For Combobox
    get options() {
        return [
            { label: '0', value: '0' },
            { label: '10', value: '10' },
            { label: '15', value: '15' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
        ];
    }

    connectedCallback(){
        console.log('messageFromPubs in cons : '+this.messageFromPubs);
        this.regiser();
        selectOption({recordSize: '5', lineToQuery: this.messageFromPubs})
            //getContactDetails()
          // getContactDetails({conObj:this.selectedContactIdList})
          .then(result => {
            console.log("in success,",result);
            this.data = result;
            this.error = undefined;
        })
        .catch(error => {
           
            this.error = error;
            this.data = undefined;
        });
}

    regiser(){
        window.console.log('event registered ');
        pubsub.register('response', this.handleEvent.bind(this));
    }

    handleEvent(messageFromEvt){
        window.console.log('event handled ',messageFromEvt);
        this.messageFromPubs = messageFromEvt;
        console.log('messageFromPub: '+this.messageFromPubs);
        console.log('Message from pub is : '+messageFromEvt);
        selectOption({recordSize: this.selectedValue,lineToQuery: this.messageFromPubs}) // calling the apex method for combobox
            .then(result => {
                console.log("in success,",result);
                this.data = result;
                if(this.data.length === 0){
                    this.isSearchResults = false;
                    console.log("no rec to show");
                }else{
                    this.isSearchResults = true;
                }
            })
            
            .catch(error => {
               
                this.error = error;
                    this.data = undefined;
                    console.log("error while getting contacts=>", JSON.stringify(error));
                    this.isSearchResults = true;
                });
    
        }



 /*handleChange(event) {
      //  this.getContactDetails = event.detail.getContactDetails;
      const selectedValue = event.detail.value;
      console.log('Selected value is : '+selectedValue);


   }*/

// calling the apex method for combobox
   
handleChange(event) {
    this.selectedValue = event.detail.value;
    console.log('Selected value is : '+this.selectedValue);

    selectOption({recordSize: this.selectedValue,lineToQuery: this.messageFromPubs}) // calling the apex method for combobox
          .then(result => {
              console.log("in success,",result);
              this.data = result;
              this.error = undefined;
          })
          .catch(error => {
             
              this.error = error;
              this.data = undefined;
          });

  }


    //after clicking  the name it will be show name of the contacts

    handleRowAction(event) {
        console.log('row action is : '+event.detail.action.name);
        console.log('Contact Id is: '+event.detail.row.Id);
        if (event.detail.action.name === "gotoContact") {
            this[NavigationMixin.GenerateUrl]({
                type: "standard__recordPage",
                attributes: {
                    recordId: event.detail.row.Id,
                    actionName: "view"
                }
            }).then((url) => {
                window.open(url, "_blank");
            });
            this[NavigationMixin.Navigate](config);
        } 
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
    let parseData = JSON.parse(JSON.stringify(this.data));

    // Return the value stored in the field
    let keyValue = (a) => {
        return a[fieldname];
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
    this.data = parseData;

}

   
}