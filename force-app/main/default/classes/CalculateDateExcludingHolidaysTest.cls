@isTest
global class CalculateDateExcludingHolidaysTest {
    
    @isTest
    private static void test1() {

        Test.startTest();
        CalculateDateExcludingHolidays.FlowInput input = new CalculateDateExcludingHolidays.FlowInput();
        input.fromDate = System.today();
        input.addDays = 2;
        input.weekDaysToExclude = new List<String> {'Friday','Saturday'};
        input.isBackward = true;

        List<CalculateDateExcludingHolidays.FlowOutput> outputs = CalculateDateExcludingHolidays.calcDateExcludingHolidays(new List<CalculateDateExcludingHolidays.FlowInput> {input});
        Test.stopTest();
        System.assertEquals(1, outputs.size());
        System.assert(outputs[0].endDate <= System.today());
    }

}