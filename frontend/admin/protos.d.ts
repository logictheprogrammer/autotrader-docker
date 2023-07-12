export {};

declare global {
  interface String {
    /**
     * Converts the first character of `subject` to upper case. If `restToLower` is `true`, convert the rest of
     * `subject` to lower case.
     *
     * @function capitalize
     * @static
     * @since 1.0.0
     * @memberOf Case
     * @param  {boolean} [restToLower=true] Convert the rest of `subject` to lower case.
     * @return {string}                      Returns the capitalized string.
     * @example
     * v.capitalize('apple');
     * // => 'Apple'
     *
     * v.capitalize('aPPle', true);
     * // => 'Apple'
     */
    capitalize(restToLower: boolean = true): string;

    /**
     * Converts the subject to title case.
     *
     * @function titleCase
     * @static
     * @since 1.0.0
     * @memberOf Case
     * @param  {boolean} [restToLower=true] Convert the rest of `subject` to lower case.
     * @return {string}                      Returns the titleCased string.
     * @example
     * v.titleCase('hEllo woRld AppLE');
     * // => 'HEllo WoRld AppLE'
     *
     * v.titleCase('hEllo woRld AppLE', true);
     * // => 'Hello World Apple'
     */
    titleCase(restToLower: boolean = true): string;
  }
}
