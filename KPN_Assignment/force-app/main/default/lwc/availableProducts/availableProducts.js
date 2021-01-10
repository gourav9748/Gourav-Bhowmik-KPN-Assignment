/*
* CTS, Inc
* Name            :    AvailableProducts
* Description     :    This is the html file of availableProducts LWC component used to show the avilable product , associated with active Pricebook Entry in the Pricebook related to the current order 
* Created Date    :    [10th January , 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
*
* Date Modified        Modified By             Description of the update
   10th-Jan-2021      Gourav Bhowmik          Created
*/
import { LightningElement, wire, api , track} from 'lwc';
import getAvailableProducts from '@salesforce/apex/OrderHandler.getAvailableProducts';
import { publish, MessageContext } from 'lightning/messageService';
import SAMPLEMC from '@salesforce/messageChannel/MyMessageChannel__c';
import getOrderDetails from '@salesforce/apex/OrderHandler.getOrderDetails';
export default class AvailableProducts extends LightningElement {
    @api
    recordId;//stores the record id
    availableProductsData;//stores all the product with associated active Pricebook Entry in the Pricebook related to the current order
    showSpinner;// controls the spinner visibility
    addedProduct;//stores the product which user wants to add
    diableButtons=false;// use to disable the button after the order confirmation

    page;// page cursor
    totalRecountCount ;//total count of record received from all retrieved records
    totalPage ; //total number of page is needed to display all records 
    startingRecord ; //start record position per page 
    endingRecord ; //end record position per page
    pageSize ; //10 records display per page
    data;// stores the display data 
    orderInfo;
    orderInfoPriceBook;
    @wire(MessageContext)
    messageContext;// message context instance for component communication
    @wire(getAvailableProducts,{recId:'$recordId'})// fetch all the product
    availableProduct(result) {
         if (result.data) {
            this.availableProductsData =result.data;
            this.prepareTableData();
            this.showSpinner=false;
         } else if (result.error) {
             console.log('result.error'+JSON.stringify(result.error));
             this.error = result.error;
             this.data = undefined;
             this.showSpinner=false;
         }
     }
     
     @wire(getOrderDetails,{recId:'$recordId'})// fetch the order details
     orderDetails(result) {
         if (result.data) {
            this.orderInfo=result.data;
            if(this.orderInfo.Pricebook2Id){
             this.orderInfoPriceBook=this.orderInfo.Pricebook2Id;
            }
            if(result.data.Status=='Activated'){
                this.diableButtons=true;
             }
             else{
               this.diableButtons=false;
             }
             this.showSpinner=false;
         } else if (result.error) {
             console.log('result.error'+JSON.stringify(result.error));
             this.error = result.error;
             this.showSpinner=false;
         }
     }
     
    

     /*
      prepare the table to show the records
     */
     prepareTableData(){
        this.page = 1;
        this.totalRecountCount = 0;
        this.totalPage = 0; 
        this.startingRecord = 1; 
        this.endingRecord = 0; 
        this.pageSize = 5; 
        this.totalRecountCount = this.availableProductsData.length; 
                    this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
                    
                    this.data = this.availableProductsData.slice(0,this.pageSize); 
                    if(this.totalRecountCount > this.pageSize){
                    this.endingRecord = this.pageSize;
                    }
                    else{
                        this.endingRecord = this.totalRecountCount;
                    }
    }
    /*
    this method is called when you clicked on the previous button 
    */
    previousHandler() {
        this.showSpinner=true;
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
        this.showSpinner=false;
    }
    /*
    this method is called when you clicked on the next button 
    */
    nextHandler() {
        this.showSpinner=true;
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }  
        this.showSpinner=false;           
    }
    /*
    this method displays records page by page
    */
    displayRecordPerPage(page){
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = 
    (this.endingRecord > this.totalRecountCount) ?   this.totalRecountCount : this.endingRecord; 
    this.data = this.availableProductsData.slice(this.startingRecord,   this.endingRecord);
    this.startingRecord = this.startingRecord + 1;
    }
    /*
     this method will be called when add product button is clicked
    */
     addProduct(event){
        this.showSpinner=true;
        let index=event.target.dataset.id;
        this.addedProduct=this.data[index];
        const message = {
            recordData: this.addedProduct
        };
        publish(this.messageContext, SAMPLEMC, message);// publishing the message using messagechannel
        this.showSpinner=false;

     }
}