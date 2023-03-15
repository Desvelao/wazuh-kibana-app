import React from 'react';
import { EuiButtonEmpty, EuiPopover, EuiText, EuiCode } from '@elastic/eui';
import { tokenizer as tokenizerUQL } from './aql';
import { pluginPlatform } from '../../../../package.json';

/* UI Query language
https://documentation.wazuh.com/current/user-manual/api/queries.html

// Example of another query language definition
*/

type ITokenType =
  | 'field'
  | 'operator_compare'
  | 'operator_group'
  | 'value'
  | 'conjunction'
  | 'whitespace';
type IToken = { type: ITokenType; value: string };
type ITokens = IToken[];

/* API Query Language
Define the API Query Language to use in the search bar.
It is based in the language used by the q query parameter.
https://documentation.wazuh.com/current/user-manual/api/queries.html

Use the regular expression of API with some modifications to allow the decomposition of
input in entities that doesn't compose a valid query. It allows get not-completed queries.

API schema:
<operator_group>?<field><operator_compare><value><operator_conjunction>?<operator_group>?

Implemented schema:
<operator_group>?<whitespace>?<field>?<whitespace>?<operator_compare>?<whitespace>?<value>?<whitespace>?<operator_conjunction>?<whitespace>?<operator_group>?<whitespace>?
*/

// Language definition
const language = {
  // Tokens
  tokens: {
    // eslint-disable-next-line camelcase
    operator_compare: {
      literal: {
        '=': 'equality',
        '!=': 'not equality',
        '>': 'bigger',
        '<': 'smaller',
        '~': 'like as',
      },
    },
    conjunction: {
      literal: {
        'and': 'and',
        'or': 'or',
      },
    },
    // eslint-disable-next-line camelcase
    operator_group: {
      literal: {
        '(': 'open group',
        ')': 'close group',
      },
    },
  },
  equivalencesToUQL:{
    conjunction:{
      literal:{
        'and': ';',
        'or': ',',
      }
    }
  }
};

// Suggestion mapper by language token type
const suggestionMappingLanguageTokenType = {
  field: { iconType: 'kqlField', color: 'tint4' },
  // eslint-disable-next-line camelcase
  operator_compare: { iconType: 'kqlOperand', color: 'tint1' },
  value: { iconType: 'kqlValue', color: 'tint0' },
  conjunction: { iconType: 'kqlSelector', color: 'tint3' },
  // eslint-disable-next-line camelcase
  operator_group: { iconType: 'tokenDenseVector', color: 'tint3' },
  // eslint-disable-next-line camelcase
  function_search: { iconType: 'search', color: 'tint5' },
};

/**
 * Creator of intermediate interface of EuiSuggestItem
 * @param type 
 * @returns 
 */
function mapSuggestionCreator(type: ITokenType ){
  return function({...params}){
    return {
      type,
      ...params
    };
  };
};

const mapSuggestionCreatorField = mapSuggestionCreator('field');
const mapSuggestionCreatorValue = mapSuggestionCreator('value');

/**
 * Transform the conjunction to the query language syntax
 * @param conjunction 
 * @returns 
 */
function transformQLConjunction(conjunction: string): string{
  // If the value has a whitespace or comma, then
  return conjunction === language.equivalencesToUQL.conjunction.literal['and']
    ? ` ${language.tokens.conjunction.literal['and']} `
    : ` ${language.tokens.conjunction.literal['or']} `;
};

/**
 * Transform the value to the query language syntax
 * @param value 
 * @returns 
 */
function transformQLValue(value: string): string{
  // If the value has a whitespace or comma, then
  return /[\s|"]/.test(value)
    // Escape the commas (") => (\") and wraps the string with commas ("<string>")
    ? `"${value.replace(/"/, '\\"')}"`
    // Raw value
    : value;
};

/**
 * Tokenize the input string. Returns an array with the tokens.
 * @param input
 * @returns
 */
export function tokenizer(input: string): ITokens{
  const re = new RegExp(
    // A ( character.
    '(?<operator_group_open>\\()?' +
    // Whitespace
    '(?<whitespace_1>\\s+)?' +
    // Field name: name of the field to look on DB.
    '(?<field>[\\w.]+)?' + // Added an optional find
    // Whitespace
    '(?<whitespace_2>\\s+)?' +
    // Operator: looks for '=', '!=', '<', '>' or '~'.
    // This seems to be a bug because is not searching the literal valid operators.
    // I guess the operator is validated after the regular expression matches
    `(?<operator_compare>[${Object.keys(language.tokens.operator_compare.literal)}]{1,2})?` + // Added an optional find 
    // Whitespace
    '(?<whitespace_3>\\s+)?' +
    // Value: A string.
    // Simple value
    // Quoted ", "value, "value", "escaped \"quote"
    // Escape quoted string with escaping quotes: https://stackoverflow.com/questions/249791/regex-for-quoted-string-with-escaping-quotes
    // '(?<value>(?:(?:[^"\\s]+|(?:"(?:[^"\\\\]|\\\\")*"))))?' +
    '(?<value>(?:(?:[^"\\s]+|(?:"(?:[^"\\\\]|\\\\")*")|(?:"(?:[^"\\\\]|\\\\")*)|")))?' +
    // Whitespace
    '(?<whitespace_4>\\s+)?' +
    // A ) character.
    '(?<operator_group_close>\\))?' +
    // Whitespace
    '(?<whitespace_5>\\s+)?' +
    `(?<conjunction>${Object.keys(language.tokens.conjunction.literal).join('|')})?` +
    // Whitespace
    '(?<whitespace_6>\\s+)?',
    'g'
  );

  return [
    ...input.matchAll(re)]
      .map(
        ({groups}) => Object.entries(groups)
          .map(([key, value]) => ({
            type: key.startsWith('operator_group') // Transform operator_group group match
              ? 'operator_group'
              : (key.startsWith('whitespace') // Transform whitespace group match
                ? 'whitespace'
                : key),
            value})
          )
      ).flat();
};

type QLOptionSuggestionEntityItem = {
  description?: string
  label: string
};

type QLOptionSuggestionEntityItemTyped =
  QLOptionSuggestionEntityItem
  & { type: 'operator_group'|'field'|'operator_compare'|'value'|'conjunction' };

type SuggestItem = QLOptionSuggestionEntityItem & {
  type: { iconType: string, color: string }
};

type QLOptionSuggestionHandler = (
  currentValue: string | undefined,
  {
    previousField,
    previousOperatorCompare,
  }: { previousField: string; previousOperatorCompare: string },
) => Promise<QLOptionSuggestionEntityItem[]>;

type optionsQL = {
  suggestions: {
    field: QLOptionSuggestionHandler;
    value: QLOptionSuggestionHandler;
  };
};

/**
 * Get the last token with value
 * @param tokens Tokens
 * @param tokenType token type to search
 * @returns
 */
function getLastTokenWithValue(
  tokens: ITokens
): IToken | undefined {
  // Reverse the tokens array and use the Array.protorype.find method
  const shallowCopyArray = Array.from([...tokens]);
  const shallowCopyArrayReversed = shallowCopyArray.reverse();
  const tokenFound = shallowCopyArrayReversed.find(
    ({ type, value }) => type !== 'whitespace' && value,
  );
  return tokenFound;
}

/**
 * Get the last token with value by type
 * @param tokens Tokens
 * @param tokenType token type to search
 * @returns
 */
function getLastTokenWithValueByType(
  tokens: ITokens,
  tokenType: ITokenType,
): IToken | undefined {
  // Find the last token by type
  // Reverse the tokens array and use the Array.protorype.find method
  const shallowCopyArray = Array.from([...tokens]);
  const shallowCopyArrayReversed = shallowCopyArray.reverse();
  const tokenFound = shallowCopyArrayReversed.find(
    ({ type, value }) => type === tokenType && value,
  );
  return tokenFound;
}

/**
 * Get the suggestions from the tokens
 * @param tokens
 * @param language
 * @param options
 * @returns
 */
export async function getSuggestions(tokens: ITokens, options: optionsQL): Promise<QLOptionSuggestionEntityItemTyped[]> {
  if (!tokens.length) {
    return [];
  }

  // Get last token
  const lastToken = getLastTokenWithValue(tokens);

  // If it can't get a token with value, then returns fields and open operator group
  if(!lastToken?.type){
    return  [
      // fields
      ...(await options.suggestions.field()).map(mapSuggestionCreatorField),
      {
        type: 'operator_group',
        label: '(',
        description: language.tokens.operator_group.literal['('],
      }
    ];
  };

  switch (lastToken.type) {
    case 'field':
      return [
        // fields that starts with the input but is not equals
        ...(await options.suggestions.field()).filter(
          ({ label }) =>
            label.startsWith(lastToken.value) && label !== lastToken.value,
        ).map(mapSuggestionCreatorField),
        // operators if the input field is exact
        ...((await options.suggestions.field()).some(
          ({ label }) => label === lastToken.value,
        )
          ? [
            ...Object.keys(language.tokens.operator_compare.literal).map(
              operator => ({
                type: 'operator_compare',
                label: operator,
                description:
                  language.tokens.operator_compare.literal[operator],
              }),
            ),
          ]
          : []),
      ];
      break;
    case 'operator_compare':{
      const previousField = getLastTokenWithValueByType(tokens, 'field')?.value;
      const previousOperatorCompare = getLastTokenWithValueByType(
        tokens,
        'operator_compare',
      )?.value;

      // If there is no a previous field, then no return suggestions because it would be an syntax
      // error
      if(!previousField){
        return [];
      };

      return [
        ...Object.keys(language.tokens.operator_compare.literal)
          .filter(
            operator =>
              operator.startsWith(lastToken.value) &&
              operator !== lastToken.value,
          )
          .map(operator => ({
            type: 'operator_compare',
            label: operator,
            description: language.tokens.operator_compare.literal[operator],
          })),
        ...(Object.keys(language.tokens.operator_compare.literal).some(
          operator => operator === lastToken.value,
        )
          ? [
            ...(await options.suggestions.value(undefined, {
              previousField,
              previousOperatorCompare,
            })).map(mapSuggestionCreatorValue),
          ]
          : []),
      ];
      break;
    }
    case 'value':{
      const previousField = getLastTokenWithValueByType(tokens, 'field')?.value;
      const previousOperatorCompare = getLastTokenWithValueByType(
        tokens,
        'operator_compare',
      )?.value;

      // If there is no a previous field or operator_compar, then no return suggestions because
      //it would be an syntax error
      if(!previousField || !previousOperatorCompare){
        return [];
      };

      return [
        ...(lastToken.value
          ? [
            {
              type: 'function_search',
              label: 'Search',
              description: 'Run the search query',
            },
          ]
          : []),
        ...(await options.suggestions.value(lastToken.value, {
          previousField,
          previousOperatorCompare,
        })).map(mapSuggestionCreatorValue),
        ...Object.entries(language.tokens.conjunction.literal).map(
          ([ conjunction, description]) => ({
            type: 'conjunction',
            label: conjunction,
            description,
          }),
        ),
        {
          type: 'operator_group',
          label: ')',
          description: language.tokens.operator_group.literal[')'],
        },
      ];
      break;
    }
    case 'conjunction':
      return [
        ...Object.keys(language.tokens.conjunction.literal)
          .filter(
            conjunction =>
              conjunction.startsWith(lastToken.value) &&
              conjunction !== lastToken.value,
          )
          .map(conjunction => ({
            type: 'conjunction',
            label: conjunction,
            description: language.tokens.conjunction.literal[conjunction],
          })),
        // fields if the input field is exact
        ...(Object.keys(language.tokens.conjunction.literal).some(
          conjunction => conjunction === lastToken.value,
        )
          ? [
            ...(await options.suggestions.field()).map(mapSuggestionCreatorField),
          ]
          : []),
        {
          type: 'operator_group',
          label: '(',
          description: language.tokens.operator_group.literal['('],
        },
      ];
      break;
    case 'operator_group':
      if (lastToken.value === '(') {
        return [
          // fields
          ...(await options.suggestions.field()).map(mapSuggestionCreatorField),
        ];
      } else if (lastToken.value === ')') {
        return [
          // conjunction
          ...Object.keys(language.tokens.conjunction.literal).map(
            conjunction => ({
              type: 'conjunction',
              label: conjunction,
              description: language.tokens.conjunction.literal[conjunction],
            }),
          ),
        ];
      }
      break;
    default:
      return [];
      break;
  }

  return [];
}

/**
 * Transform the suggestion object to the expected object by EuiSuggestItem
 * @param param0 
 * @returns 
 */
export function transformSuggestionToEuiSuggestItem(suggestion: QLOptionSuggestionEntityItemTyped): SuggestItem{
  const { type, ...rest} = suggestion;
  return {
    type: { ...suggestionMappingLanguageTokenType[type] },
    ...rest
  };
};

/**
 * Transform the suggestion object to the expected object by EuiSuggestItem
 * @param suggestions
 * @returns
 */
function transformSuggestionsToEuiSuggestItem(
  suggestions: QLOptionSuggestionEntityItemTyped[]
): SuggestItem[] {
  return suggestions.map(transformSuggestionToEuiSuggestItem);
};

/**
 * Transform the UQL (Unified Query Language) to SpecificQueryLanguage
 * @param input 
 * @returns 
 */
export function transformUnifiedQueryToSpecificQueryLanguage(input: string){
  const tokens = tokenizerUQL(input);
  return tokens
    .filter(({value}) => value)
    .map(({type, value}) => {
      switch (type) {
        case 'conjunction':
          return transformQLConjunction(value);
          break;
        case 'value':
          return transformQLValue(value);
          break;
        default:
          return value;
          break;
      }
    }
    ).join('');
};

/**
 * Transform the input in SpecificQueryLanguage to UQL (Unified Query Language)
 * @param input 
 * @returns 
 */
export function transformSpecificQLToUnifiedQL(input: string){
  const tokens = tokenizer(input);
  return tokens
    .filter(({type, value}) => type !== 'whitespace' && value)
    .map(({type, value}) => {
      switch (type) {
        case 'value':{
          // Value is wrapped with "
          let [ _, extractedValue ] = value.match(/^"(.+)"$/) || [ null, null ];
          // Replace the escaped comma (\") by comma (")
          // WARN: This could cause a problem with value that contains this sequence \"
          extractedValue && (extractedValue = extractedValue.replace(/\\"/g, '"'));
          return extractedValue || value;
          break;
        }
        case 'conjunction':
          return value === 'and'
            ? language.equivalencesToUQL.conjunction.literal['and']
            : language.equivalencesToUQL.conjunction.literal['or'];
          break;
        default:
          return value;
          break;
      }
    }
    ).join('');
};

/**
 * Get the output from the input
 * @param input
 * @returns
 */
function getOutput(input: string, options: {implicitQuery?: string} = {}) {
  const query = `${transformUnifiedQueryToSpecificQueryLanguage(options?.implicitQuery ?? '')}${input}`;
  return {
    language: WQL.id,
    unifiedQuery: transformSpecificQLToUnifiedQL(query),
    query
  };
};

export const WQL = {
  id: 'wql',
  label: 'WQL',
  description: 'WQL (Wazuh Query language) allows to do queries.',
  documentationLink: `https://github.com/wazuh/wazuh-kibana-app/blob/v${pluginPlatform.version.split('.').splice(0,2).join('.')}/public/components/search-bar/query-language/wql.md`,
  getConfiguration() {
    return {
      isOpenPopoverImplicitFilter: false,
    };
  },
  async run(input, params) {
    // Get the tokens from the input
    const tokens: ITokens = tokenizer(input);

    //
    const implicitQueryAsSpecificQueryLanguage = params.queryLanguage.parameters.implicitQuery
      ? transformUnifiedQueryToSpecificQueryLanguage(params.queryLanguage.parameters.implicitQuery)
      : '';

    return {
      searchBarProps: {
        // Props that will be used by the EuiSuggest component
        // Suggestions
        suggestions: transformSuggestionsToEuiSuggestItem(
          await getSuggestions(tokens, params.queryLanguage.parameters)
        ),
        // Handler to manage when clicking in a suggestion item
        onItemClick: item => {
          // When the clicked item has the `search` iconType, run the `onSearch` function
          if (item.type.iconType === 'search') {
            // Execute the search action
            params.onSearch(getOutput(input, params.queryLanguage.parameters));
          } else {
            // When the clicked item has another iconType
            const lastToken: IToken | undefined = getLastTokenWithValue(tokens);
            // if the clicked suggestion is of same type of last token
            if (
              lastToken && suggestionMappingLanguageTokenType[lastToken.type].iconType ===
              item.type.iconType
            ) {
              // replace the value of last token
              lastToken.value = item.label;
            } else {
              // add a whitespace for conjunction <whitespace><conjunction>
              !(/\s$/.test(input))
              && item.type.iconType === suggestionMappingLanguageTokenType.conjunction.iconType
              && tokens.push({
                type: 'whitespace',
                value: ' '
              });

              // add a new token of the selected type and value
              tokens.push({
                type: Object.entries(suggestionMappingLanguageTokenType).find(
                  ([, { iconType }]) => iconType === item.type.iconType,
                )[0],
                value: item.type.iconType === suggestionMappingLanguageTokenType.value.iconType
                  ? transformQLValue(item.label)
                  : item.label,
              });

              // add a whitespace for conjunction <conjunction><whitespace>
              item.type.iconType === suggestionMappingLanguageTokenType.conjunction.iconType
              && tokens.push({
                type: 'whitespace',
                value: ' '
              });
            };

            // Change the input
            params.setInput(tokens
              .filter(value => value) // Ensure the input is rebuilt using tokens with value.
              // The input tokenization can contain tokens with no value due to the used
              // regular expression.
              .map(({ value }) => value)
              .join(''));
          }
        },
        prepend: implicitQueryAsSpecificQueryLanguage ? (
          <EuiPopover
            button={
              <EuiButtonEmpty
                onClick={() =>
                  params.setQueryLanguageConfiguration(state => ({
                    ...state,
                    isOpenPopoverImplicitFilter:
                      !state.isOpenPopoverImplicitFilter,
                  }))
                }
                iconType='filter'
              >
                <EuiCode>
                  {implicitQueryAsSpecificQueryLanguage}
                </EuiCode>
              </EuiButtonEmpty>
            }
            isOpen={
              params.queryLanguage.configuration.isOpenPopoverImplicitFilter
            }
            closePopover={() =>
              params.setQueryLanguageConfiguration(state => ({
                ...state,
                isOpenPopoverImplicitFilter: false,
              }))
            }
          >
            <EuiText>
              Implicit query:{' '}
              <EuiCode>{implicitQueryAsSpecificQueryLanguage}</EuiCode>
            </EuiText>
            <EuiText color='subdued'>This query is added to the input.</EuiText>
          </EuiPopover>
        ) : null,
        // Disable the focus trap in the EuiInputPopover.
        // This causes when using the Search suggestion, the suggestion popover can be closed.
        // If this is disabled, then the suggestion popover is open after a short time for this
        // use case.
        disableFocusTrap: true
      },
      output: getOutput(input, params.queryLanguage.parameters),
    };
  },
  transformUnifiedQuery: transformUnifiedQueryToSpecificQueryLanguage,
};