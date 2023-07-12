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
function capitalize(restToLower = true) {
  let string = this;
  if (restToLower) string = this.toLowerCase();
  return string.substr(0, 1).toUpperCase() + string.substr(1);
}

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
function titleCase(restToLower = true) {
  let string = this;
  if (restToLower) string = this.toLowerCase();
  return string.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });
}

String.prototype.capitalize = function capitalize(restToLower = true) {
  let string = this;
  if (restToLower) string = this.toLowerCase();
  return string.substr(0, 1).toUpperCase() + string.substr(1);
};
String.prototype.titleCase = function titleCase(restToLower = true) {
  let string = this;
  if (restToLower) string = this.toLowerCase();
  return string.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });
};
