/*
* CTS, Inc
* Name            :    TestUtility
* Description     :    This class is used as a utility class for creating test data in test class.
* Created Date    :    [10th January , 2021]
* Created By      :    [Gourav Bhowmik] (CTS)
*
* Date Modified        Modified By             Description of the update
   10th-Jan-2021      Gourav Bhowmik          Created
*/
public class TestUtility {
  public static User createUser(String profileName, Boolean isInsert){
        Profile p;

        list<Profile> listProfile = [SELECT Id FROM profile WHERE Name = :profileName];
        
        if(listProfile.size() > 0) {
            p = listProfile[0];
        } else {
            return null;
        }

        User testUser = new User(alias = 'testUser', email='standarduser' + Math.random()  + '@testorg.com',
                                emailencodingkey='UTF-8', lastname='Test', languagelocalekey='en_US',
                                localesidkey='en_US', profileid = p.Id, timezonesidkey='America/New_York',
                                username='teststandarduser' + Math.random() + '@testorg.com', IsActive=true,
                                Extension='1234', CompanyName = 'test Company');
        if(isInsert){
            insert testUser;
        }

        
        system.assert(true);

        return testUser;
    }
    public static Account createAccount(Boolean isInsert) {
        Account account = new Account(Name = 'Test Account');

        if(isInsert) {
          insert account;
        }
        system.assert(true);

        return account;
    }
    
    
    
    public static List<Product2> createProduct(Boolean isInsert,Integer num) {
        List<Product2> prodLst=new List<Product2>();
        for(Integer i=0;i<=num;i++){
            Product2 p = new Product2();
            p.Name = ' Test Product'+i;
            p.Description='Test Product Entry '+i;
            p.productCode = 'ABC'+i;
            p.isActive = true;
            prodLst.add(p);
        }
        

        if(isInsert) {
          insert prodLst;
        }
        system.assert(true);

        return prodLst;
    }
    
    public static List<Order> createOrder(Boolean isInsert,Integer num,Account a,Pricebook2 pb) {
        List<Order> orderLst=new List<Order>();
        for(Integer i=0;i<=num;i++){
            Order o = new Order();
            o.Name = 'Test Order '+i;
            o.Status = 'Draft';
            o.EffectiveDate = system.today();
            o.EndDate = system.today() + 4;
            o.AccountId = a.id;
            o.Pricebook2Id =  pb.Id ;
            orderLst.add(o);
        }
        

        if(isInsert) {
          insert orderLst;
        }
        system.assert(true);

        return orderLst;
    }
    public static List<PricebookEntry> createPriceBookEntry(Integer num,Pricebook2  pb) {
        List<PricebookEntry> pLst=new List<PricebookEntry>();
        for(Integer i=0;i<=num;i++){
            PricebookEntry  standardPrice  = new PricebookEntry();
            standardPrice.Pricebook2Id = pb.Id;
            //standardPrice.Product2Id = p.Id;
            standardPrice.UnitPrice = 1;
            standardPrice.IsActive = true;
            standardPrice.UseStandardPrice = false;
            pLst.add(standardPrice);
        }

        return pLst;
    }
    
}