/*
* CTS, Inc
* Name            :    OrderHandler
* Description     :    This is the Handler class for the LWC component (orderProductsFromOrder and availableProducts)
* Created Date    :    [10th January , 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
*
* Date Modified        Modified By             Description of the update
   10th-Jan-2021      Gourav Bhowmik          Created
*/
public class OrderHandler {
/*
* Created Date    :    [10th Jan, 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
* Description : This method will fetch all the related order line items
*/
    @AuraEnabled(cacheable=true)
    public static List<OrderItem> getProductsRelatedToOrder(String recId){
        List<OrderItem> orderItemLst=new List<OrderItem>();
        orderItemLst=[select id,ListPrice,UnitPrice,Quantity,TotalPrice,Product2.Name,Product2Id from OrderItem where OrderId =:recId];
        return orderItemLst;
    }
/*
* Created Date    :    [10th Jan, 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
* Description : This method will fetch the order details. 
*/
    @AuraEnabled(cacheable=true)
    public static Order getOrderDetails(String recId){
        return [select id,Status,PriceBook2Id from Order where Id =:recId];
    }
/*
* Created Date    :    [10th Jan, 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
* Description : This method will fetch all the available product , associated with active Pricebook Entry in the Pricebook related to the current order  
*/
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getAvailableProducts(String recId){
        List<PricebookEntry> productLst=new List<PricebookEntry>();
        Map<id,PricebookEntry> prodIdPriceBookEntryMap=new Map<id,PricebookEntry>();
        productLst=[select id,Product2.Name,UnitPrice,Product2Id from PricebookEntry where IsActive =true and Pricebook2Id in (select Pricebook2Id from Order where id=:recId )];
        for(PricebookEntry pe:productLst){
            prodIdPriceBookEntryMap.put(pe.Product2Id,pe);
        }
        return prodIdPriceBookEntryMap.values();
    }
/*
* Created Date    :    [10th Jan, 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
* Description : This method will call the external rest api service to confirm the order
*/      
    @AuraEnabled
    public static String callExternalServiceToConfirmOrder(String recId){
        String response;
        HTTPResponse res = new HTTPResponse();
        OrderExternalService os=new OrderExternalService();
        res=os.orderConfirm();
        if(res.getStatusCode()==200){
            Order o=new Order(Id=recId);
            o.Status='Activated';
            update o;
            response='Success';
        }
        else{
            response='Failed';
        }
        return response;
        
    }
}