'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _updateMutation = require('./util/updateMutation');

var _updateMutation2 = _interopRequireDefault(_updateMutation);

var _rangeSort = require('./util/rangeSort');

var _rangeSort2 = _interopRequireDefault(_rangeSort);

var _getElementHTML = require('./util/getElementHTML');

var _getElementHTML2 = _interopRequireDefault(_getElementHTML);

var _getElementTagLength = require('./util/getElementTagLength');

var _getElementTagLength2 = _interopRequireDefault(_getElementTagLength);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var converter = function converter() {
  var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var originalText = arguments[1];

  return originalText;
};

exports.default = function (block, entityMap) {
  var entityConverter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : converter;

  var resultText = block.text;

  var getEntityHTML = entityConverter;

  if (entityConverter.__isMiddleware) {
    getEntityHTML = entityConverter(converter);
  }

  if (Object.prototype.hasOwnProperty.call(block, 'entityRanges') && block.entityRanges.length > 0) {
    var entities = block.entityRanges.sort(_rangeSort2.default);

    var styles = block.inlineStyleRanges;

    var _loop = function _loop(index) {
      var entityRange = entities[index];
      var entity = entityMap[entityRange.key];

      var originalText = resultText.substr(entityRange.offset, entityRange.length);

      var entityHTML = getEntityHTML(entity, originalText);
      var converted = (0, _getElementHTML2.default)(entityHTML, originalText) || originalText;

      var prefixLength = (0, _getElementTagLength2.default)(entityHTML, 'start');
      var suffixLength = (0, _getElementTagLength2.default)(entityHTML, 'end');

      var updateLaterMutation = function updateLaterMutation(mutation, mutationIndex) {
        if (mutationIndex > index || Object.prototype.hasOwnProperty.call(mutation, 'style')) {
          return (0, _updateMutation2.default)(mutation, entityRange.offset, entityRange.length, converted.length, prefixLength, suffixLength);
        }
        return mutation;
      };

      var updateLaterMutations = function updateLaterMutations(mutationList) {
        return mutationList.reduce(function (acc, mutation, mutationIndex) {
          var updatedMutation = updateLaterMutation(mutation, mutationIndex);
          if (Array.isArray(updatedMutation)) {
            return acc.concat(updatedMutation);
          }

          return acc.concat([updatedMutation]);
        }, []);
      };

      entities = updateLaterMutations(entities);
      styles = updateLaterMutations(styles);

      resultText = resultText.substring(0, entityRange.offset) + converted + resultText.substring(entityRange.offset + entityRange.length);
    };

    for (var index = 0; index < entities.length; index++) {
      _loop(index);
    }

    return Object.assign({}, block, {
      text: resultText,
      inlineStyleRanges: styles,
      entityRanges: entities
    });
  }

  return block;
};