public with sharing class DateFormater {
    
    public class FlowInputs{
        @InvocableVariable
        public String DateTimeFormat;
        @InvocableVariable
        public DateTime DateTimeValue;
    }
    
    @InvocableMethod (label='Format Date')
    public static List<String> getDateTimeWithTZFormat (List<FlowInputs> reqList) {
        List<String> dtToReturn = new List<String>();
        DateTime dtToFormatted;

        for(FlowInputs dt :reqList){
            dtToFormatted = dt.DateTimeValue;
            dtToReturn.add(dtToFormatted.format(dt.DateTimeFormat));
        }
        return dtToReturn;
    }
}