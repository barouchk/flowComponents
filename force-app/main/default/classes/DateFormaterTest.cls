@isTest
private class DateFormaterTest {

    @IsTest
    public static void getDateTimeWithTZFormatTest() {
        DateFormater.FlowInputs inp = new DateFormater.FlowInputs();
        List<DateFormater.FlowInputs> inpList = new List<DateFormater.FlowInputs>();
        inp.DateTimeFormat = 'yyyy-MM-dd\'T\'HH:mm:ssXXX';
        inp.DateTimeValue = Datetime.newInstance(2008, 12, 1, 12, 30, 2);
        inpList.add(inp);
        Test.startTest();
        List<String> results = DateFormater.getDateTimeWithTZFormat(inpList);
        Test.stopTest();
        System.assertNotEquals(null, results);
    }
}