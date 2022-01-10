import { LightningElement, wire, track, api } from 'lwc';
import pubsub from 'c/pubSub';
import selectOption from '@salesforce/apex/DropDownController.selectedOption';
import recordsValidator from '@salesforce/apex/DropDownController.searchController';
import labelGetter from "@salesforce/apex/FieldSetFieldsGetter.getObjectLabel";
import colsAndData from '@salesforce/apex/DropDownController.getColunnsAndData';
import { NavigationMixin } from 'lightning/navigation';
import defaultObj from '@salesforce/label/c.Dynamic_Search_Default_Value';
import getMetaConfigs from "@salesforce/apex/FieldSetControllerCheck.getMetaConfig";
export default class SearchComponentForDataTable extends NavigationMixin(LightningElement) {
    label = {
        defaultObj,
    };
    @api objectApiName;
    @track columns;
    @track data;
    @track contacts;
    @track error;
    @api recordId;
    @api selectedContactIdList = [];
    @track selectedValue = 10;
    @track messageFromPubs;
    @track sortBy;
    @track sortDirection
    @track isSearchResult = true;
    @track isMoreData = true;
    @track isMoreDataMessage;
    @track firstColumnAsRecordHyperLink = 'Yes';
    @track cardTitle;
    @track firstFieldAPI;
    @track loadingSpinner;
    @track noDataMessage;
    @track displayPick;
    @track labelMessage;
    @track labelError;
    @track comboOptions = [];
    @track sizeofList;
    @track isActive;
    @track metResult;
    @track metError;



    connectedCallback() {
        console.log('Object API name : ' + this.objectApiName);
        if (this.objectApiName == 'undefined' || this.objectApiName == null || this.objectApiName == '') {
            console.log('inside object checking  ');
            this.objectApiName = this.label.defaultObj;
            console.log('After label object name update : ' + this.objectApiName);
        }
        getMetaConfigs({ objApiName: this.objectApiName })
            .then((results) => {
                this.metResult = results;
                this.errors = undefined;
                console.log('Result in meta : ' + this.metResult.Is_Active__c);
                if (this.metResult.length !== 0) {
                    this.isActive = this.metResult.Is_Active__c;
                }
                else {
                    this.isActive = false;
                }
                console.log('Component AActive Status is ' + this.isActive);
            })
            .catch((errors) => {
                this.metError = errors;
                this.results = undefined;

            });
        this.displayPick = false;
        this.regiser();


    }
    @wire(labelGetter, { objApiName: '$objectApiName' })
    getLabelOfObject({ error, data }) {

        if (data) {
            this.labelMessage = data;
            this.cardTitle = this.labelMessage + ' Search';
            this.labelError = undefined;

        }
        else if (error) {
            this.labelError = error;
            this.labelMessage = undefined;
        }
    }

    roundVal(x) {
        return Math.ceil(x / 10) * 10;
    }
    regiser() {
        window.console.log('event registered ');
        pubsub.register('response', this.handleEvent.bind(this));
    }

    handleEvent(messageFromEvt) {
        this.loadingSpinner = true;
        window.console.log('event handled ', messageFromEvt);
        this.messageFromPubs = messageFromEvt;
        console.log('messageFromPub: ' + this.messageFromPubs);
        console.log('Message from pub is : ' + messageFromEvt);

        recordsValidator({ query: this.messageFromPubs.builtQuery, maxRecords: this.messageFromPubs.maxRecords }) // calling the apex method
            .then(result => {
                console.log("in success,", result);

                console.log('morethan 100 records ' + JSON.stringify(result));
                console.log('morethan 100 records ' + result.success);
                this.sizeofList = result.listSize;
                if (result.success == true) {

                    this.isSearchResult = true;
                    this.displayPick = false;
                    this.loadingSpinner = false;
                }
                if (result.success == false) {
                    this.displayPick = false;
                    this.isSearchResult = true;
                    this.isMoreData = result.success;
                    this.data = undefined;
                    this.isMoreDataMessage = this.messageFromPubs.limitMessage;
                    this.loadingSpinner = false;
                    this.error = undefined;
                }
                else {
                    this.isMoreData = true;
                    let firstTimeEntry = false;

                    console.log('Record number size is : ' + this.selectedValue);
                    this.selectedValue = 10;
                    console.log('clear columns? : ' + this.messageFromPubs.clearHead);
                    if (this.messageFromPubs.clearHead == true) {
                        this.columns = undefined;
                    }
                    colsAndData({ currentObjectName: this. objectApiName, searchQuery: this.messageFromPubs.builtQuery, recordSize: this.selectedValue }) // calling the apex method for combobox
                        .then(results => {
                            let objStr = JSON.parse(results);
                            let listOfFields = JSON.parse(Object.values(objStr)[1]);
                            let listOfRecords = JSON.parse(Object.values(objStr)[0]);
                            let items = []; //local array to prepare columns
                            listOfFields.map(element => {

                                if (this.firstColumnAsRecordHyperLink != null && this.firstColumnAsRecordHyperLink == 'Yes'
                                    && firstTimeEntry == false) {
                                    console.log('Inside First Field as navigation');
                                    this.firstFieldAPI = element.fieldPath;

                                    items = [...items,
                                    {
                                        label: element.label,
                                        fieldName: 'URLField',

                                        type: 'url',
                                        typeAttributes: {
                                            label: {
                                                fieldName: element.fieldPath
                                            },
                                            target: '_blank'
                                        },
                                        sortable: true,
                                        hideDefaultActions: true
                                    }
                                    ];
                                    firstTimeEntry = true;
                                } else {
                                    items = [...items, {
                                        label: element.label,
                                        fieldName: element.fieldPath, sortable: true, hideDefaultActions: true
                                    }];
                                }
                            });
                            this.columns = items;
                            console.log('List response length : ' + listOfRecords.length);
                            console.log('List response items : ', listOfRecords);
                            if (listOfRecords.length === 0) {
                                this.displayPick = false;
                                this.noDataMessage = this.messageFromPubs.noDataMessage;
                                this.isSearchResult = false;
                                this.loadingSpinner = false;
                            }
                            else {
                                this.comboOptions = [];
                                var limitNumber = this.messageFromPubs.maxRecords;
                                console.log('limitNumber : ' + limitNumber);
                                //console.log('list length : '+limitNumber);
                                var loopLimit = this.roundVal(this.sizeofList);
                                console.log('loopLimit : ' + loopLimit);
                                for (let i = 10; i <= loopLimit; i = i + 10) {
                                    const opt = {
                                        label: i,
                                        value: i
                                    };
                                    this.comboOptions = [...this.comboOptions, opt];
                                }


                                this.displayPick = true;
                                this.isSearchResult = true;
                                this.data = listOfRecords;
                                console.log('Size of the records : ' + this.data.length);
                                this.selectedValue = 10;

                            }

                            if (this.firstColumnAsRecordHyperLink != null && this.firstColumnAsRecordHyperLink == 'Yes') {
                                let URLField;
                                this.data = listOfRecords.map(item => {
                                    URLField = '/lightning/r/' + this.SFDCobjectApiName + '/' + item.Id + '/view';
                                    return { ...item, URLField };
                                });
                                this.data = this.data.filter(item => item.fieldPath != this.firstFieldAPI);
                                this.loadingSpinner = false;
                                this.error = undefined;
                            }

                        })
                        .catch(errors => {

                            this.error = errors;
                            this.data = undefined;
                            this.isSearchResults = true;
                        });
                }



            })
            .catch(error => {
                this.error = error;
                this.data = undefined;

            });


    }





    handleChange(event) {
        this.loadingSpinner = true;
        this.selectedValue = +event.detail.value;
        console.log('Selected value is : ' + this.selectedValue);
        console.log('Query after onchange is : ', this.messageFromPubs.builtQuery);

        selectOption({ recordSize: this.selectedValue, lineToQuery: this.messageFromPubs.builtQuery }) // calling the apex method for combobox
            .then(result => {
                console.log("in success,", result);

                console.log('Response after value change : ', this.data);
                if (this.firstColumnAsRecordHyperLink != null && this.firstColumnAsRecordHyperLink == 'Yes') {
                    let URLField;
                    this.data = result.map(item => {
                        URLField = '/lightning/r/' + this.SFDCobjectApiName + '/' + item.Id + '/view';
                        return { ...item, URLField };
                    });
                    this.data = this.data.filter(item => item.fieldPath != this.firstFieldAPI);
                    this.loadingSpinner = false;
                    this.error = undefined;
                }
                this.error = undefined;
            })
            .catch(error => {

                this.error = error;
                this.data = undefined;
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
        let parseData = JSON.parse(JSON.stringify(this.data));

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1 : -1;

        // sorting data 
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });

        // set the sorted data to data table data
        this.data = parseData;

    }


}