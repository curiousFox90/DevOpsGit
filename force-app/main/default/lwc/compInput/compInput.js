import { LightningElement,track } from 'lwc';
import searchContacts from '@salesforce/apex/Dynamicquery.fetchContacts';
import pubsub from 'c/pubSub';


export default class CompInput extends LightningElement {
    fName; 
    lName;
    email;
    pCode;
    bDate;
    phone; 
    
    isSearchResults=true;
    @track results;
    @track errors;
    firstNameValue = (event) => {
        this.fName = event.target.value;
       }
  
      emailValue = (event) => {
          this.email = event.target.value;
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

      handleReset() {

        this.template.querySelector('form').reset();
    }
    // handleReset(){
    //        this.template.querySelectorAll('lightning-input').forEach(element => {
    //               element.value = null;   
    //           });
    //           }
    handleSearch()
    {
        

        let searchString = 
            {
                FirstName: this.fName,
                LastName: this.lName,
                MailingPostalCode: this.pCode,
                Email: this.email,
                Phone: this.phone,
                Birthdate: this.bDate

          };

      let builtString = JSON.stringify(searchString);
      console.log(builtString);

      searchContacts({ filterValues: builtString,objectName : 'Contact' })
      .then((result) => {
          this.results = result;
          this.errors = undefined;
          console.log('Result is : '+this.results);
          pubsub.fire("response" ,this.results);
          console.log('pubsub fired');
      })
      .catch((error) => {
          this.errors = error;
          this.results = undefined;
      });

            //let returnedQuery={dynamicQuery : this.results};
            //pubsub.fire("response" ,returnedQuery);

        

    }

}