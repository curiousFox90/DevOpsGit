import { LightningElement,  api, track } from 'lwc';
import getContacts from '@salesforce/apex/getSearchData.fetchContacts';

export default class ComponentSearch extends LightningElement {

    
    fName; 
    lName;
    mName;
    pCode;
    bDate;
    phone; 

@api ObjectName;


handleSearch = (event) =>{
    console.log('Handlesearch called');
    let fName= this.template.querySelector('.fName-searchbox').label;
    console.log('fname', fName);
    
    let lName = this.template.querySelector('.lName-searchbox').label;
    console.log('lname', lName);
    let mName = this.template.querySelector('.mName-searchbox').label;
    console.log('mname', mName);
   let pCode = this.template.querySelector('.pCode-searchbox').label;
   console.log('pCode', pCode);
    letbDate = this.template.querySelector('.bDate-searchbox').label;
    console.log('bDate', bDate);
    let phone = this.template.querySelector('.phone-searchbox').label;
    console.log('phone', phone);

    
    


 


}
     firstNameValue = (event) => {
      this.fName = event.target.value;
     }

    middleNameValue = (event) => {
        this.mName = event.target.value;
    }

    lastNameValue = (event) => {
        this.lName = event.target.value;
    }

    postalCodeValue = (event) => {
        this.pCode = event.target.value;
    }
    dateOfBirthValue = (event) => {
        this.bDate = event.target.value;
    }
    phoneValue = (event) => {
        this.phone = event.target.value;
    }



    // handleSearch = () => {
            
    //     // let searchString = [
    //     //     {
    //     //         fName: this.fName,
    //     //         lName: this.lName,
    //     //         mName: this.mName,
    //     //         postCode: this.pCode,
    //     //         phone: this.phone,
    //     //         bdate: this.bDate
    //     //     }
    //     // ];

    //     console.log('searching', searchString);

    //     let stringJSON = JSON.stringify(searchString);
    //     getContacts({  filterValues: stringJSON, objName : objectName  })
    //         .then(result => {
    //             console.log('sucess', result);
    //             //this.contactsRecord = result;
    //         })
    //         .catch(error => {
    //             console.log(JSON.stringify(error));
    //         })
    // }
    

    handleReset() {

        this.template.querySelector('form').reset();
    }

}
    














//         if (this.searchValue !== '') {
//             getContactList({
//                     searchKey: this.searchValue
//                 })
//                 .then(result => {
//                     // set @track contacts variable with return contact list from server  
//                     this.contactsRecord = result;
//                 })
//                 .catch(error => {

//                     const event = new ShowToastEvent({
//                         title: 'Error',
//                         variant: 'error',
//                         message: error.body.message,
//                     });
//                     this.dispatchEvent(event);
//                 });
//             } else {
//                 // fire toast event if input field is blank
//                 const event = new ShowToastEvent({
//                     variant: 'error',
//                     message: 'Search text missing..',
//                 });
//                 this.dispatchEvent(event);
//             }
//         }



// handleReset(){
    //        this.template.querySelectorAll('lightning-input').forEach(element => {
    //            element.value = null;   
    //         });
    //       }
        


//}