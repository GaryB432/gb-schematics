import { Tree } from '@angular-devkit/schematics';

interface TslRules {
  // stuff: any;
  [name: string]: boolean | [boolean, any];
}

interface Tsl {
  extends: string[];
  jsRules: any;
  rules: TslRules;
  rulesDirectory: any[];
}

const demo: Tsl = {
  extends: ['tslint:latest', 'tslint-config-prettier', 'tslint-config-gb'],
  jsRules: {},
  rules: {
    'interface-over-type-literal': true,
    'label-position': true,
    'max-line-length': [true, 140],
    'member-access': false,
    'member-ordering': [
      true,
      {
        order: [
          'static-field-that-i-do-not-want-anymore-thank-you',
          'instance-field',
          'static-method',
          'instance-method',
        ],
      },
    ],
    'no-arg': true,
    'no-bitwise': true,
    // 'no-console': [true, 'debug', 'info', 'time', 'timeEnd', 'trace'],
  },
  rulesDirectory: [],
};

export function addRulesToConfig(
  host: Tree,
  type: string,
  pkg: string,
  version: string
): Tree {
  console.log(demo);
  if (host.exists('tslint.json')) {
    const sourceText = host.read('tslint.json')!.toString('utf-8');
    const json = JSON.parse(sourceText);
    if (!json[type]) {
      json[type] = {};
    }

    if (!json[type][pkg]) {
      json[type][pkg] = version;
    }

    host.overwrite('tslint.json', JSON.stringify(json, null, 2));
  }

  return host;
}
