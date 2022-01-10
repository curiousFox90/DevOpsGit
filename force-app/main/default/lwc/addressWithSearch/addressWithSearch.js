import { LightningElement, api } from 'lwc';

export default class AddressWithSearch extends LightningElement {

    @api serachAddressLabel ='Address';
    @api streetLabel;
    @api cityLabel;
    @api stateLabel;
    @api postalCodeLabel = 'Post Code';
    @api countryLabel;
    
    @api street;
    @api city;
    @api state;
    @api postalCode;
    @api country;

    handleChange = (event) => {
        this.street = event.detail.street;
        this.city = event.detail.city;
        this.state = event.detail.state;
        this.postalCode = event.detail.postalCode;
        this.country = event.detail.country;
        console.log('DS');
    }
       
}