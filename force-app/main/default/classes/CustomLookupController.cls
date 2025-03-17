/**
 * Created by bkandov on 27/10/2020.
 */

public with sharing class CustomLookupController {
    private static final Integer MAX_RESULTS_QUANTITY = 10;
    private static  final Set<String> operatorsWithParentheses = new Set<String>{'IN', 'NOT IN', 'INCLUDES', 'EXCLUDES'};

    // Sending random to reset cache
    @AuraEnabled(Cacheable=true)
    public static List<SObjectResult> getResults(String ObjectName, String fieldName, String displayName, 
                                                String value, Boolean showFirst, Map<String, Object> extraParams, 
                                                String distinctByField, String orderBy, Boolean isSosl, Decimal random) {
        Boolean isExternalObject = ObjectName.endsWith('__x');
        List<SObjectResult> sObjectResultList = new List<SObjectResult>();
        if (String.isNotEmpty(value)) {
            String queryCondition = '';
      
            String whereCondition = '';
            if(isExternalObject) {
                whereCondition += ' WHERE Id != NULL'; // something like WHERE 1=1, for the following AND clauses
            } else if(!isSosl){
                whereCondition += (' WHERE ' + String.escapeSingleQuotes(fieldName) + ' LIKE \'%' + String.escapeSingleQuotes(value) + '%\'');
            }

            if (extraParams != null) {
                whereCondition += getConditionsFromExtraParams(extraParams);
            }

            String orderCondition = '';
            if(String.isNotEmpty(orderBy)){
                orderCondition += ' ORDER BY ' + String.escapeSingleQuotes(orderBy);
            }

            String limitCondition = '';
            if(!isExternalObject) {
                limitCondition += (' LIMIT ' + MAX_RESULTS_QUANTITY);
            }
        
            String query = '';
            List<SObject> sObjects = new List<SObject>();

            
            if(isSosl){
                 value = escapeSosl(value);

                 query = 'Find {' + String.escapeSingleQuotes(value) + '} IN ALL FIELDS RETURNING ' 
                                        + String.escapeSingleQuotes(ObjectName) 
                                        + '(' 
                                        + displayName 
                                        + ' WHERE Id != NULL ' + whereCondition 
                                        + orderCondition 
                                        + limitCondition 
                                        +')';

            Search.SearchResults searchResults = Search.find(query);
            List<Search.SearchResult> resultsList = searchResults.get(String.escapeSingleQuotes(ObjectName));
            for(Search.SearchResult res : resultsList){
                sObjects.add(res.getSObject());
            }

            }else{
                query = 'SELECT Id,'    + String.escapeSingleQuotes(displayName) 
                                        + ' FROM ' + String.escapeSingleQuotes(ObjectName)
                                        + whereCondition
                                        + orderCondition
                                        + limitCondition;

                sObjects = Database.query(query);
            }


            System.debug('query: ' + query);
            

            if(isExternalObject) {
                sObjects = filterResultsFromApexInsteadOfLike(sObjects, fieldName, value);
            }

            List<String> fields = displayName.split(',');
            Map<String, Schema.SObjectField> sObjectFieldsMap;
            if (!sObjects.isEmpty()){
                sObjectFieldsMap = sObjects[0].getSobjectType().getDescribe().fields.getMap();
            }

            for (sObject so : sObjects) {
                Map<String, String> fieldDisplayValues = new Map<String, String>();
                String fieldValue;

                if (fields.size() == 1) {
                    fieldValue = sObjectFieldsMap.containsKey(displayName) ?
                                addValueFromObject(displayName, so, fieldDisplayValues) :
                                addValueFromRelatedObject(displayName, so, fieldDisplayValues);
                } else {
                    for (String field : fields) {
                        if (sObjectFieldsMap.containsKey(field)){
                            addValueFromObject(field, so, fieldDisplayValues);
                        } else {
                            addValueFromRelatedObject(field, so, fieldDisplayValues);
                        }
                    }

                    if (showFirst != null && showFirst) {
                        fieldValue = fieldDisplayValues.values()[0];
                    } else {
                        fieldValue = String.join(fieldDisplayValues.values(), ' \u2022 ');
                    }
                }

                sObjectResultList.add(new SObjectResult(so.Id, fieldValue, fieldDisplayValues));
            }
        }

        return String.isEmpty(distinctByField) ? sObjectResultList : applyDistinctDisplayValue(sObjectResultList, distinctByField);
    }

    public static String getConditionsFromExtraParams(Map<String, Object> extraParams) {
        String conditions = '';
        for (String field : extraParams.keySet()) {
            Condition condition;
            Object obj = extraParams.get(field);
            if(obj instanceof Condition) {
                System.debug('instanceof Condition');
                condition = (Condition)obj;
            } else if(obj instanceof Map<Object, Object>) {
                System.debug('instanceof Map<Object, Object>');
                condition = new Condition((Map<Object, Object>)obj);
            } else if(obj instanceof List<Object>) {
                System.debug('instanceof List<Object>');
                List<String> valuesInList = new List<String>();
                for (Object objElement : (List<Object>)obj){
                    valuesInList.add(String.valueOf(objElement));
                }
                condition = new Condition(field, '\'' +String.join(valuesInList, '\',\'') + '\'', 'IN');
            } else {
                System.debug('instanceof text');
                condition = new Condition(field, obj, '=');
            }

            conditions += condition.getSoqlCondition();
        }

        return conditions;
    }

    public class Condition {
        @AuraEnabled public String field, operator, clause;
        @AuraEnabled public Object value;

        public Condition(String field, Object value, String operator, String clause) {
            this.field = field;
            this.value = value;
            this.operator = operator == null ? '=' : operator;
            this.clause = clause == null ? 'AND' : clause;
        }

        public Condition(String field, Object value, String operator) {
            this(field, value, operator, 'AND');
        }

        public Condition(Map<Object, Object> mapObj) {
            this((String)mapObj.get('field'), mapObj.get('value'), (String)mapObj.get('operator'), (String)mapObj.get('clause'));
        }

        public String getSoqlCondition() {
            String strValue;
            if(operatorsWithParentheses.contains(operator)) {
                strValue = '(' + value + ')';
            } else if(value instanceof Boolean) {
                strValue = String.valueOf(Boolean.valueOf(String.escapeSingleQuotes(String.valueOf(value))));
            } else {
                strValue = + '\'' + String.escapeSingleQuotes(String.valueOf(value)) + '\'';
            }

            return String.join(new List<String>{'', clause, field, operator, strValue}, ' ');
        }
    }

    private static List<SObjectResult> applyDistinctDisplayValue(List<SObjectResult> sObjectResultList, String distinctByField) {
        Map<String, SObjectResult> sObjectResultMap = new Map<String, SObjectResult>();

        for(SObjectResult res : sObjectResultList) {
            sObjectResultMap.put(res.FieldsParams.get(distinctByField), res);
        }

        return sObjectResultMap.values();
    }

    // support query style lookup field. For example: UserRole.Name
    private static String addValueFromRelatedObject(String field, sObject so, Map<String, String> fieldDisplayValues){
        String fValue = '';
        if (field.contains('.')) {
            List<String> objectsAndFields = field.split('\\.');
            String objName = objectsAndFields[0];
            String objFieldName = objectsAndFields[1];
            if (so.getSObject(objectsAndFields[0]) != null){
                fValue = String.valueOf(so.getSObject(objName).get(objFieldName));
                fieldDisplayValues.put(field, fValue);
            }
        }

        return fValue;
    }

    private static String addValueFromObject(String field, sObject so, Map<String, String> fieldDisplayValues){
        String fValue = String.valueOf(so.get(field));
        fieldDisplayValues.put(field, fValue);
        return fValue;
    }

    private static List<SObject> filterResultsFromApexInsteadOfLike(List<SObject> records, String fieldName, String value) {
        List<SObject> filteredRecords = new List<SObject>();
        for(SObject record : records) {
            if(((String)record.get(fieldName)).contains(value)) {
                filteredRecords.add(record);
                if(filteredRecords.size() >= MAX_RESULTS_QUANTITY) {
                    break;
                }
            }
        }

        return filteredRecords;
    }

    public static String escapeSosl( String text ) {

        System.debug( 'escaping sosl term: ' + text );

        String escapedText;

        if ( String.isBlank( text ) ) {

            escapedText = null;

        } else {

            // Escaping characters is a bit annoying because
            // we are having to plan for multiple levels of evaluation of the escaped characters:
            //  1. Apex   -- this code requires double slahes (\\) to equate to a single slash (\) in the string literal
            //  2. Regex  -- when the replaceAll method parses the input sequence the apex \\ is read as a single \, so have to double up again in Apex to get \\ in regex land
            //  3. SOSL   -- when Search.query() method parses the query string it expects valid apex string literal, so any \ must be escaped as \\

            // In addition to my below logic, you can check out some other solutions here:
            // http://salesforce.stackexchange.com/questions/64757/function-to-properly-escape-dynamic-sosl-input

            // escape single quotes
            // we do not handle the single quote escaping in the matcher.replaceAll method along with the other escaping because we would end up with incorrect number of slashes
            escapedText = String.escapeSingleQuotes( text ) ;

            // remove special logical operators from the term (case insensitive)
            // these are keywords for SOSL, can't escape them so we exclude them from the search term
            escapedText = escapedText.replaceAll( '(?i)( AND NOT | AND | OR )', ' ' );

            // escape reserved characters
            // note, we handled single quotes above already
            // note, we do not handle \, it ends up being overly escaped
            // ? & | ! { } [ ] ( ) ^ ~ * : \ " ' + -
            Pattern myPattern = Pattern.compile( '(\\?|\\&|\\||\\!|\\{|\\}|\\[|\\]|\\(|\\)|\\^|\\~|\\*|\\:|\\"|\\+|\\-)' );
            Matcher myMatcher = myPattern.matcher( escapedText );

            escapedText = myMatcher.replaceAll( ' ' );

            // collapse repeated whitespace
            escapedText = escapedText.replaceAll( '( )+', ' ' ).trim();

        }

        System.debug( 'escaped sosl term: ' + escapedText );

        return escapedText;
    }

    public class SObjectResult {
        @AuraEnabled
        public String Name;

        @AuraEnabled
        public Id Id;

        @AuraEnabled
        public Map<String, String> FieldsParams;

        public SObjectResult(Id Id, String Name, Map<String, String> FieldsParams) {
            this.Id = Id;
            this.Name = Name;
            this.FieldsParams = FieldsParams;
        }
    }
}