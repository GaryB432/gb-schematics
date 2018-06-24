import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { createTestApp } from '../utils/testing';
import { getFileContent } from '@schematics/angular/utility/test';

const collectionPath = join(__dirname, '../collection.json');

xdescribe('angular-format-schematic', () => {
  let runner: SchematicTestRunner;
  const options = {
    name: 'foo',
    path: 'app',
    sourceDir: 'src',
    inlineStyle: false,
    inlineTemplate: false,
    changeDetection: 'Default',
    styleext: 'css',
    spec: true,
    module: undefined,
    export: false,
    prefix: undefined,
    viewEncapsulation: undefined,
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should not blow up', () => {
    const tree = runner.runSchematic(
      'angular-iis-config',
      { ...options },
      createTestApp()
    );

    expect(tree).toBeDefined();

    // const files = tree.files;

    // expect(files).toContain('/src/app/foo/foo.component.css');
    // expect(files).toContain('/src/app/foo/foo.component.html');
    // expect(files).toContain('/src/app/foo/foo.component.spec.ts');
    // expect(files).toContain('/src/app/foo/foo.component.ts');

    // const moduleContent = getFileContent(tree, '/src/app/app.module.ts');
    // expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    // expect(moduleContent).toMatch(
    //   /declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m
    // );
  });

  xit('should add nav imports to module', () => {
    const tree = runner.runSchematic('nav', { ...options }, createTestApp());
    const moduleContent = getFileContent(tree, '/src/app/app.module.ts');

    expect(moduleContent).toContain('LayoutModule');
    expect(moduleContent).toContain('MatToolbarModule');
    expect(moduleContent).toContain('MatButtonModule');
    expect(moduleContent).toContain('MatSidenavModule');
    expect(moduleContent).toContain('MatIconModule');
    expect(moduleContent).toContain('MatListModule');

    expect(moduleContent).toContain(
      `import { LayoutModule } from '@angular/cdk/layout';`
    );
    expect(moduleContent).toContain(
      // tslint:disable-next-line
      `import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule } from '@angular/material';`
    );
  });
});
