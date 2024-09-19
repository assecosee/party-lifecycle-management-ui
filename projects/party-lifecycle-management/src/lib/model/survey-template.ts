
export interface SurveyTemplate {
    surveyId: string,
    dateCreated: Date,
    info: SurveyInformation,
    sections: SurveySection[]
}
export interface SurveySection{
    sectionId: string,
    order: number,
    title: string,
    description: string,
    questions: SurveyQuestion[]
}
export interface SurveyQuestion {

   questionId?: string;
   /**
    * Templates order of question in a survey.
    */
   order?: number;
   /**
    * Templates question title.
    */
   title?: string;
   /**
    * Templates textual description of the question.
    */
   description?: string;
   kind?: AnswerTypeEnum;
   /**
    * Dictionary contains possible drop down values if templates question type is options, multiple-options, currency or unit-of-measure.
    */
   possibleOptions?: { [key: string]: string };
   /**
    * Dictionary contains aditional standard and custom validation rules for template question.
    */
   validationRules?: { [key: string]: string };
/**
    * Contains condition to which this question will be shown.
    */
   conditionVisibility?: {[key: string]: string};
   /**
    * Is template question required or mandatory
    */
   isMandatory?: boolean;
   /**
    * Is collection of answers or one answer
    */
   isCollection?: boolean;
   /**
    * Indicates whether answer should be posted to check for subquestions
    */
   hasSubquestions?: boolean;
   /**
    * List or templates columns the can be a part of question.
    */
   complexColumns?: Array<ComplexTemplateColumn>;
}
export interface Answer {
    /**
     * Question identifier.
     */
    questionId: string;
    /**
     * Contains answer if question type is text.
     */
    textValue?: string;
    /**
     * Contains answer if question type is bool.
     */
    boolValue?: boolean;
    /**
     * Contains answer if question type is numeric.
     */
    numericValue?: number;
    /**
     * Contains answer if question type is date.
     */
    dateValue?: Date;
    /**
     * Contains selected unit-of-measure.
     */
    unitOfMeasure?: string;
    /**
     * Contains answer if question type is options or multiple-options.
     */
    selectedOption?: string;
  }

export type AnswerTypeEnum = 'text' | 'numeric' | 'date' | 'bool' | 'options' | 'multiple-options' | 'currency' | 'unit-of-measure' | 'complex';

export const AnswerTypeEnum = {
    Text: 'text' as AnswerTypeEnum,
    Numeric: 'numeric' as AnswerTypeEnum,
    Date: 'date' as AnswerTypeEnum,
    Bool: 'bool' as AnswerTypeEnum,
    Options: 'options' as AnswerTypeEnum,
    MultipleOptions: 'multiple-options' as AnswerTypeEnum,
    Currency: 'currency' as AnswerTypeEnum,
    UnitOfMeasure: 'unit-of-measure' as AnswerTypeEnum,
    Complex: 'complex' as AnswerTypeEnum
  };


export interface ComplexTemplateColumn {
    /**
     * Order of column in a complex template qustion.
     */
    order?: number;
    /**
     * Column title in template question.
     */
    title?: string;
    kind?: ComplexAnswerTypeEnum;
    /**
     * Dictionary contains possible drop down values if column type is options, multiple-options, currency or unit-of-measure.
     */
    possibleOptions?: { [key: string]: string };
    /**
     * Column value for template question is required
     */
    isMandatory?: boolean;
  }
  export type ComplexAnswerTypeEnum = 'text' | 'numeric' | 'date' | 'bool' | 'options' | 'multiple-options' | 'currency' | 'unit-of-measure';
  export const ComplexAnswerTypeEnum = {
    Text: 'text' as ComplexAnswerTypeEnum,
    Numeric: 'numeric' as ComplexAnswerTypeEnum,
    Date: 'date' as ComplexAnswerTypeEnum,
    Bool: 'bool' as ComplexAnswerTypeEnum,
    Options: 'options' as ComplexAnswerTypeEnum,
    MultipleOptions: 'multiple-options' as ComplexAnswerTypeEnum,
    Currency: 'currency' as ComplexAnswerTypeEnum,
    UnitOfMeasure: 'unit-of-measure' as ComplexAnswerTypeEnum
  };
  

export interface SurveyInformation {
    templateId: string,
    title: string,
    description: string,
    datePublished: Date
}