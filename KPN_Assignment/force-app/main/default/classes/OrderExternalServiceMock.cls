/*
* CTS, Inc
* Name            :    OrderExternalServiceMock
* Description     :    This class is mock class to create a fake HTTP response for the order external service which will be used in the test class.
* Created Date    :    [10th January , 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
*
* Date Modified        Modified By             Description of the update
   10th-Jan-2021      Gourav Bhowmik          Created
*/
@isTest
public class OrderExternalServiceMock implements HttpCalloutMock  {
    public HTTPResponse respond(HTTPRequest req) {
        
        System.assertEquals('POST', req.getMethod());
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"accountNumber": "","orderNumber": "","type": "order type","status": "order status","orderProducts": [{"name": "product name","code": "product code","unitPrice": 10.00,"quantity": 1}]}');
        res.setStatusCode(200);
       
        return res;
    }

}