public with sharing class CalculateDateExcludingHolidays {

    private static Set<Date> holidays;
    
    @InvocableMethod (label='Calculate Date Excluding Holidays') 
    public static List<FlowOutput> calcDateExcludingHolidays(List<FlowInput> inputs) {
        List<FlowOutput> outputs = new List<FlowOutput>();
        for(FlowInput input:inputs) {
            FlowOutput output = new FlowOutput();
            output.endDate = calcDateExcludingHolidays(input.fromDate, input.addDays, new Set<String>(input.weekDaysToExclude), input.isBackward == true);
            outputs.add(output);
        }
        return outputs;
    }

    public static Date calcDateExcludingHolidays(Date fromDate, Integer addDays, Set<String> weekDaysToExclude, Boolean isBackward) {
        Integer dayToAdd = isBackward ? -1 : 1;
        
        if(holidays == null) {
            holidays = new Set<Date>();
            for(Holiday holiday : [SELECT ActivityDate FROM Holiday]) {
                holidays.add(holiday.ActivityDate);
            }
        }

        for(Integer i = 0; i < addDays; i++) {
            fromDate = fromDate.addDays(dayToAdd);
            addDays += weekDaysToExclude.contains(((Datetime)fromDate).format('EEEE')) || holidays.contains(fromDate) ? 1 : 0;
        }

        return fromDate;
    }

    public class FlowInput {
        @InvocableVariable(label='From Date' description='Start date to calculate' required=true)
        public Date fromDate;

        @InvocableVariable(label='Add Days' description='How many days to add' required=true) 
        public Integer addDays; 

        @InvocableVariable(label='Week Days To Exclude' description='Name of days to exclude' required=true) 
        public List<String> weekDaysToExclude; 

        @InvocableVariable(label='Is Backward' description='Is calculate date backward' required=true) 
        public Boolean isBackward; 
    }
    
    public class FlowOutput {
        @InvocableVariable(label='End Date' description='The calculated date')
        public Date endDate;
    }

}