public with sharing class FieldSetControllerCheck {

    @AuraEnabled (cacheable=true)
    public static String getFieldsLabels(String strObjectApiName, String strfieldSetName){

        String jsonFieldOptionsString;
        Map<String,String> returnMap=new Map<String,String>();
        if(!String.isEmpty(strObjectApiName) && !String.isEmpty(strfieldSetName))
        {
            SObject sObj = (SObject)(Type.forName('Schema.'+ strObjectApiName).newInstance());
            List<Schema.FieldSetMember> lstFSMember = sObj.getSObjectType().getDescribe().fieldSets.getMap().get(strfieldSetName).getFields();
            JSONGenerator gen = JSON.createGenerator(true);
            
            gen.writeStartArray();
            map<string, string> helpTexts = new map<string, string>();
            Map<String, Schema.SObjectType> sObjectMap = Schema.getGlobalDescribe();
            Schema.SObjectType sObjectTypeInstance = sObjectMap.get(strObjectApiName);
            for(SObjectField field: sObjectTypeInstance.getDescribe().fields.getMap().values())
            {
                DescribeFieldResult des = field.getDescribe();
                if(des.getInlineHelpText()!=null)
                {
                    helpTexts.put(des.getName(), des.getInlineHelpText());
                }
                
            }
            for(Schema.FieldSetMember f : lstFSMember)
            {
                
                gen.writeStartObject();
                gen.writeStringField('fieldPath', f.getFieldPath());
                if(helpTexts.get(f.getFieldPath())!=null)
                {
                    gen.writeStringField('helpcontent', helpTexts.get(f.getFieldPath()));
                }
                gen.writeStringField('label', f.getLabel());
                if(string.valueof(f.getType())== 'Boolean'){
                    gen.writeStringField('type', 'Checkbox');
                }else{
                    gen.writeStringField('type', string.valueof(f.getType()));
                }
                if(string.valueof(f.getType())== 'picklist'){
                    gen.writeBooleanField('IsPicklist', true);
                    
                    //String[] pickListValues = getPicklistValues(objectApiName,f.getFieldPath());
                    //jsonFieldOptionsString = JSON.serialize(pickListValues);
                    //system.debug('--jsonFieldOptionsString--'+jsonFieldOptionsString);
                    //gen.writeStringField('pickListValues',jsonFieldOptionsString);
                }
                else{
                    gen.writeBooleanField('IsPicklist', false); 
                }
                gen.writeBooleanField('dbRequired', f.getDbRequired());
                gen.writeBooleanField('required', f.getRequired());
                gen.writeEndObject();
            }
            gen.writeEndArray();
            
            String pretty = gen.getAsString();
            returnMap.put('FIELD_LIST', pretty);
            return JSON.serialize(returnMap);

        }

        return null;
    }
    @AuraEnabled
    public static Dynamic_Search_Setting__mdt getMetaConfig(String objApiName)
    {
        Dynamic_Search_Setting__mdt dsc=[SELECT Is_Active__c,Max_Records_Too_Display__c,QualifiedApiName,Result_Fieldset__c,search_fieldset__c,Error_Message__c,No_Data_Message__c FROM Dynamic_Search_Setting__mdt WHERE QualifiedApiName = : objApiName LIMIT 1];
        return dsc;
    }

    
}