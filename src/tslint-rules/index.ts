import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';

interface TslRules {
  [name: string]: boolean | [boolean, ...any[]];
}

interface Tsl {
  extends: string[];
  jsRules: any;
  rules: TslRules;
  rulesDirectory: string[];
}

function updateTsLintConfig(): Rule {
  return (host: Tree, _context: SchematicContext) => {
    const tsLintPath = '/tslint.json';
    const buffer = host.read(tsLintPath);
    if (!buffer) {
      return host;
    }
    const config = JSON.parse(buffer.toString()) as Tsl;
    config.rules['interface-name'] = [true, 'always-prefix'];
    config.rules['member-access'] = true;
    config.rules['member-ordering'] = [true, { order: 'instance-sandwich' }];
    config.rules['object-literal-sort-keys'] = true;
    config.rules['variable-name'] = [
      true,
      'ban-keywords',
      'check-format',
      'allow-leading-underscore',
    ];

    host.overwrite('/tslint.json', JSON.stringify(config, null, 2));
    return host;
  };
}

export function tslintRules(_options: any): Rule {
  return (_host: Tree, _context: SchematicContext) => {
    return chain([updateTsLintConfig()]);
  };
}
