/**
 * Created by bkandov on 28/10/2020.
 */

 @IsTest
 public with sharing class CustomLookupControllerTest {
 
     @testSetup
     static void setupData() {

         List<Lead> leads = new List<Lead>();
         leads.add(new Lead(LastName = 'test1', Title = 'test1', Company = 'test Company' ));
         leads.add(new Lead(LastName = 'test2', Title = 'test2', Company = 'test Company'));
 
         insert leads;
     }
 
     @IsTest
     public static void getResultsTest() {
 
         Map<String, Lead> leadsMap = new Map<String, Lead>([SELECT Id,Name,Title FROM Lead]);
 
         Test.setFixedSearchResults(new List<String>(leadsMap.keySet()));
         Test.startTest();
 
         Map<String, Object> extraParams = new Map<String, Object>();
         extraParams.put('LastName', 'test1');
        
         // soql
         List<CustomLookupController.SObjectResult> objects1 = CustomLookupController.getResults
                 ('Lead', 'Title', 'Title,Name', 'test', true, extraParams, 'Title', 'Title',false, 0);
         System.assert(objects1.size() == 1);

         // sosl
         List<CustomLookupController.SObjectResult> objects = CustomLookupController.getResults
         ('Lead', 'Title', 'Title', 'test', true, null, '', '',true, 0);
        System.assert(objects.size() == 2);

         Test.stopTest();
     }
 
 }