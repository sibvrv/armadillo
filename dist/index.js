"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var regGroup = /group\s+(\w+)\s*{([^{}]*)}/gm;
var regSubGroups = /\0(\d+)\0/g;
var regFunctions = /^\s*(func|event|abstract)\s+(\w[\w.]*)\s*\((.*)?\)\s*(.*)$/g;
var regParams = /\s*(out)?\s*(\w*)\s*:\s*(\w+)\s*,?/g;
var regExtra = /\s*(as|extends)\s+(\w[\w.]*)/g;
/**
 * Parse Extra params "as", "extends"
 * @param text
 */
var parseExtra = function (text) {
    var result = {};
    text = text && text.replace(regExtra, function (match, action, target) {
        result[action] = target;
        return '';
    });
    return result;
};
/**
 * Parse Function Params
 * @param text
 */
var parseParams = function (text) {
    var result = [];
    text = text && text.replace(regParams, function (match, out, name, type) {
        result.push({
            out: out === 'out',
            name: name,
            type: type
        });
        return '';
    });
    return result;
};
/**
 * Parse Function
 * @param line
 */
var parseFunction = function (line) {
    var func = {};
    line = line.replace(regFunctions, function (match, type, name, params, extra) {
        func = __assign({ type: type,
            name: name, params: parseParams(params) }, parseExtra(extra));
        return '';
    });
    return func;
};
/**
 * Parse Code Block
 * @param text
 */
var parseBlock = function (text) {
    return text
        .split(';')
        .map(function (line) { return line.trim(); })
        .filter(function (line) { return line.length; })
        .map(parseFunction);
};
/**
 * Armadillo Parser
 * @param {string} text
 * @returns {string}
 */
exports.armadillo = function (text) {
    var groups = [];
    text = "group document {" + text + "}";
    var _loop_1 = function (searchGroups) {
        searchGroups = false;
        text = text.replace(regGroup, function (match, name, groupData) {
            searchGroups = true;
            var group = {
                name: name,
                children: [],
                funcs: []
            };
            groupData = groupData.replace(regSubGroups, function (matchData, index) {
                group.children.push(groups[index - 1]);
                return '';
            });
            group.funcs = parseBlock(groupData);
            return "\0" + groups.push(group) + "\0";
        });
        out_searchGroups_1 = searchGroups;
    };
    var out_searchGroups_1;
    // Find resource links
    for (var searchGroups = true; searchGroups;) {
        _loop_1(searchGroups);
        searchGroups = out_searchGroups_1;
    }
    return __assign({}, groups.pop());
};
