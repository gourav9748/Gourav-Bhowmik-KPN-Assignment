/*
* CTS, Inc
* Name            :    OrderExternalService
* Description     :    This class is used to call the External Http service for Order.
* Created Date    :    [10th January , 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
*
* Date Modified        Modified By             Description of the update
   10th-Jan-2021      Gourav Bhowmik          Created
*/
public class OrderExternalService {
/*
* Created Date    :    [10th Jan, 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
* Description : This method will do the rest api callout to the external service
*/
  public HttpResponse orderConfirm(){  
        HTTPResponse res = new HTTPResponse();
        try{
                       
            HttpRequest req = new HttpRequest(); 
            req.setEndpoint('https://orderconfirm.requestcatcher.com');
            req.setBody('{"accountNumber": "","orderNumber": "","type": "order type","status": "order status","orderProducts": [{"name": "product name","code": "product code","unitPrice": 10.00,"quantity": 1}]}');
            req.setMethod('POST');
            req.setHeader('Content-Type','application/json');
            Http http = new Http();
            res = http.send(req);            
        }
        catch(Exception ex){System.debug('ex'+ex);}
        return res;
    }
}