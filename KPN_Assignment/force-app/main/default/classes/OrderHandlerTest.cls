/*
* CTS, Inc
* Name            :    OrderHandlerTest
* Description     :    This class is the test class for OrderHandler and OrderExternalService
* Created Date    :    [10th January , 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
*
* Date Modified        Modified By             Description of the update
   10th-Jan-2021      Gourav Bhowmik          Created
*/
@isTest()
public class OrderHandlerTest {
    private static User admUser1= TestUtility.createUser('System Administrator', true);
        @testSetup 
        /*
         * test data setup method
         */
        static void setup() {
            Account acc=TestUtility.createAccount(true);
            List<Product2> prodLst=TestUtility.createProduct(true,100);
            Pricebook2 standardPb = new Pricebook2(Id = System.Test.getStandardPricebookId(),IsActive = true);
            List<PricebookEntry> pbEntryLst=TestUtility.createPriceBookEntry(100,standardPb);
            Integer i=0;
            for(PricebookEntry pe:pbEntryLst){
                pe.Product2Id = prodLst.get(i).Id;
                i++;
            }
            insert pbEntryLst;
            List<Order> lstOrder=TestUtility.createOrder(true,1,acc,standardPb);
            OrderItem oi = new OrderItem();
            oi.OrderId = lstOrder.get(0).id;
            oi.Quantity = 24;
            oi.UnitPrice = 240;
            oi.Product2id = prodLst.get(0).id;
            oi.PricebookEntryId=pbEntryLst.get(0).id;
            insert oi;
        }
        static testmethod void getProductsRelatedToOrderTest() {
            Order o=[select id from order limit 1];
            List<OrderItem> orderItemLst=new List<OrderItem>();
            orderItemLst=[select id from OrderItem where OrderId =:o.Id];
            List<OrderItem> orderItemAfterTest=new List<OrderItem>();
            System.runAs(admUser1){
                System.Test.startTest();
                orderItemAfterTest=OrderHandler.getProductsRelatedToOrder(o.id);
                System.Test.stopTest();
                System.assertEquals(orderItemLst.size(),orderItemAfterTest.size());
            }
        }
    
       static testmethod void getOrderDetailsTest() {
            Order o=[select id from order limit 1];
            Order orderAfterTest=new Order();
            System.runAs(admUser1){
                System.Test.startTest();
                orderAfterTest=OrderHandler.getOrderDetails(o.id);
                System.Test.stopTest();
                System.assertEquals(String.isBlank(orderAfterTest.id),false);
            }
        }
    
        static testmethod void getAvailableProductsTest() {
            Order o=[select id from order limit 1];
            List<PricebookEntry> productLst=new List<PricebookEntry>();
            System.runAs(admUser1){
                System.Test.startTest();
                productLst=OrderHandler.getAvailableProducts(o.id);
                System.Test.stopTest();
                System.assertEquals(productLst.isEmpty(),false);
            }
        }
    
        static testmethod void callExternalServiceToConfirmOrderTest() {
            Order o=[select id from order limit 1];
            List<PricebookEntry> productLst=new List<PricebookEntry>();
            System.runAs(admUser1){
                System.Test.setMock(HttpCalloutMock.class, new OrderExternalServiceMock());
                System.Test.startTest();
                String message=OrderHandler.callExternalServiceToConfirmOrder(o.id);
                System.Test.stopTest();
                System.assertEquals(message,'Success');
                o=[select id,status from order where id=:o.id];
                System.assertEquals(o.Status,'Activated');
            }
        }
}