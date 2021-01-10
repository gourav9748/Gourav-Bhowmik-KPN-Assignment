/*
* CTS, Inc
* Name            :    orderProductsFromOrder
* Description     :    This is the js file of orderProductsFromOrder LWC component used to show the product associated with a order
* Created Date    :    [10th January , 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
*
* Date Modified        Modified By             Description of the update
   10th-Jan-2021      Gourav Bhowmik          Created
*/
import { LightningElement, wire, api , track} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getProductsRelatedToOrder from '@salesforce/apex/OrderHandler.getProductsRelatedToOrder';
import callExternalServiceToConfirmOrder from '@salesforce/apex/OrderHandler.callExternalServiceToConfirmOrder';
import getOrderDetails from '@salesforce/apex/OrderHandler.getOrderDetails';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import { getRecord ,updateRecord,createRecord } from 'lightning/uiRecordApi';
import SAMPLEMC from '@salesforce/messageChannel/MyMessageChannel__c';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import ORDER_ITEM_OBJECT from '@salesforce/schema/OrderItem';
const FIELDS = ['Order.Status'];
export default class OrderProductsFromOrder extends LightningElement {
    @api
    recordId;//stores the record id
    orderProductData;//stores all the associate product with a order
    diableButtons=false;// use to disable the button after the order confirmation
    showSpinner;// controls the spinner visibility
    @wire(MessageContext)
    messageContext;// message context instance for component communication
    subscription = null;// used to store the callback method and subscribing to the messsagechannel
    receivedMessage; // stores the received message from messsagechannel
    orderInfo;
    orderInfoPriceBook;
    wiredResult1;
    wiredResult2;
    @wire(getProductsRelatedToOrder,{recId:'$recordId'})// fetch all the related orderline items
     orderProduct(result) {
        this.wiredResult1=result;
         if (result.data) {
            this.orderProductData =result.data;
            this.showSpinner=false;
         } else if (result.error) {
             console.log('result.error'+JSON.stringify(result.error));
             this.error = result.error;
             this.showSpinner=false;
         }
     }

     @wire(getOrderDetails,{recId:'$recordId'})// fetch the order details
     orderDetails(result) {
        this.wiredResult2=result;
         if (result.data) {
            this.orderInfo=result.data;
            if(this.orderInfo.Pricebook2Id){
             this.orderInfoPriceBook=this.orderInfo.Pricebook2Id;
             console.log('i am here'+this.orderInfoPriceBook);
            }
            console.log('this.orderInfo'+JSON.stringify(this.orderInfo));
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

     
    connectedCallback(){ // lifecycle method of lWC
        this.subscribeMC();// calling this metthing to suscribe to the messgae channel 
    }

    /*
      this method is used to subscribe to the messagechannel
    */
    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext,
            SAMPLEMC, (message) => {
                this.handleMessage(message);
            });
    }
    
     /*
      this method is used to unsubscribe from the messagechannel
    */
    unsubscribeMC() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
    /*
      callback method when any message is received from the message channel
    */
    handleMessage(message) {
        this.showSpinner=true;
        this.receivedMessage = message ? message : 'no message payload';

        let orderProductAdded=this.orderProductData.find(item =>{ // finding the received product in the orderline item
          return item.Product2Id==this.receivedMessage.recordData.Product2Id ;
        });
        if(orderProductAdded){// if received product is present in orderlineitem update the quntity of existing orderlineitem
            let fields = {
                Id: orderProductAdded.Id,
                Quantity: orderProductAdded.Quantity+1
            }
            const recordInput = { fields };
            updateRecord(recordInput)
            .then(() =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!',
                        message: 'Product Added Successfully',
                        variant: 'success'
                    })
                )
                refreshApex(this.wiredResult1); 
                refreshApex(this.wiredResult2); 
            })
            .catch(error =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: 'Something went wrong while adding product',
                        variant: 'error'
                    })
                )
                this.showSpinner=false;
            })
        }
        else{// if received product is not present in orderlineitem create a new orderlineitem with quantity 1
            let fields = {
                UnitPrice:this.receivedMessage.recordData.UnitPrice,
                OrderId:this.recordId,
                Quantity: 1,
                Product2Id:this.receivedMessage.recordData.Product2Id,
                PricebookEntryId:this.receivedMessage.recordData.Id
            }
            const recordInput = { apiName: ORDER_ITEM_OBJECT.objectApiName, fields };
            createRecord(recordInput)
            .then(() =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!',
                        message: 'Product Added Successfully',
                        variant: 'success'
                    })
                )
                refreshApex(this.wiredResult1); 
                refreshApex(this.wiredResult2); 
            })
            .catch(error =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: 'Something went wrong while adding product',
                        variant: 'error'
                    })
                )
                this.showSpinner=false;
            })

        }

    }
    /*
      called when confirm order button is clicked. this will call the server side apex method to calling to external webservice
    */
    confirmOrder(){
        this.showSpinner=true;
        callExternalServiceToConfirmOrder({recId:this.recordId})
         .then(result => {
             if(result && result=='Success'){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!',
                        message: 'The order is confirmed successfully in the external system ',
                        variant: 'success'
                    })
                )
                this.showSpinner=false;
                window.location.reload();
             }
             else{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: 'Something went while calling the External Service',
                        variant: 'error'
                    })
                )
                this.showSpinner=false;
             }
         })
         .catch(error => {
            this.showSpinner=false;
            console.log('--------'+error.body.message);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error!',
                    message: 'Something went while calling the External Service',
                    variant: 'error'
                })
            )
             
         });
    }

    
}