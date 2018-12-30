const regGroup = /group\s+(\w+)\s*{([^{}]*)}/gm;
const regSubGroups = /\0(\d+)\0/g;
const regFunctions = /^\s*(func|event|abstract)\s+(\w[\w.]*)\s*\((.*)?\)\s*(.*)$/g;
const regParams = /\s*(out)?\s*(\w*)\s*:\s*(\w+)\s*,?/g;
const regExtra = /\s*(as|extends)\s+(\w[\w.]*)/g;

/**
 * Parse Extra params "as", "extends"
 * @param text
 */
const parseExtra = (text: string) => {
  const result: any = {};
  text = text && text.replace(regExtra, (match, action, target) => {
    result[action] = target;
    return '';
  });
  return result;
};

/**
 * Parse Function Params
 * @param text
 */
const parseParams = (text: string) => {
  const result: {
    out: boolean;
    name: string;
    type: string;
  }[] = [];
  text = text && text.replace(regParams, (match, out, name, type) => {
    result.push({
      out: out === 'out',
      name,
      type
    });
    return '';
  });
  return result;
};

/**
 * Parse Function
 * @param line
 */
const parseFunction = (line: string) => {
  let func = {};
  line = line.replace(regFunctions, (match, type, name, params, extra) => {
    func = {
      type,
      name,
      params: parseParams(params),
      ...parseExtra(extra)
    };
    return '';
  });
  return func;
};

/**
 * Parse Code Block
 * @param text
 */
const parseBlock = (text: string) => {
  return text
    .split(';')
    .map(line => line.trim())
    .filter(line => line.length)
    .map(parseFunction);
};

/**
 * Armadillo Parser
 * @param {string} text
 * @returns {string}
 */
export const armadillo = (text: string) => {
  const groups: any[] = [];
  text = `group document {${text}}`;

// Find resource links
  for (let searchGroups = true; searchGroups;) {
    searchGroups = false;
    text = text.replace(regGroup, (match, name: string, groupData: string) => {
      searchGroups = true;
      const group = {
        name,
        children: [] as any[],
        funcs: [] as any[]
      };

      groupData = groupData.replace(regSubGroups, (matchData, index) => {
        group.children.push(groups[index - 1]);
        return '';
      });

      group.funcs = parseBlock(groupData);

      return `\0${groups.push(group)}\0`;
    });
  }

  return {
    ...groups.pop()
  };
};
