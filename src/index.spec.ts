import {expect} from 'chai';
import {armadillo} from './index';

const params_1 = [
  {
    name: "param1",
    out: false,
    type: "string"
  },
  {
    name: "param_2",
    out: false,
    type: "flow"
  },
  {
    name: "output_1",
    out: true,
    type: "flow"
  },
  {
    name: "put_2",
    out: true,
    type: "flow"
  }
];

// func function_1 (param1: string, param_2: flow, out output_1: flow, output_2:flow);
const function_1 = {
  type: "func",
  name: "function_1",
  params: params_1
};

describe('Armadillo parser', function () {

  describe('basic', function () {
    it('groups', function () {
      const result = armadillo(`
      group SimpleGroup {     
        func function_1 (param1: string, param_2: flow, out output_1: flow, output_2:flow);
      }
      `);
      expect(result).to.deep.equal(
        {
          name: 'document',
          children: [{
            name: 'SimpleGroup',
            children: [],
            funcs: [function_1]
          }],
          funcs: []
        }
      );
    });
  });

  describe('funcs', function () {
    it('function_1', function () {
      const result = armadillo(`func function_1 (param1: string, param_2: flow, out output_1: flow, output_2:flow);`);
      expect(result).to.deep.equal(
        {
          name: 'document',
          children: [],
          funcs: [function_1]
        }
      );
    });

    it('function_2', function () {
      const result = armadillo(`
      func function_1 (param1: string, param_2: flow, out output_1: flow, output_2:flow) extends BasePrototype;
      func function_2 (param1: string, param_2: flow, out output_1: flow, output_2:flow) as AddValue;
      func function_3 (param1: string, param_2: flow, out output_1: flow, output_2:flow) extends SimpleInterface as ReplaceValue;
`);
      expect(result).to.deep.equal(
        {
          name: 'document',
          children: [],
          funcs: [
            {
              type: "func",
              name: "function_1",
              params: params_1,
              extends: 'BasePrototype'
            },
            {
              type: "func",
              name: "function_2",
              params: params_1,
              as: 'AddValue'
            },
            {
              type: "func",
              name: "function_3",
              params: params_1,
              as: 'ReplaceValue',
              extends: 'SimpleInterface'
            }
          ]
        }
      );
    });
  });

});
