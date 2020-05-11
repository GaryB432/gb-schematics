# gb-schematics

Some schematics for features I like

## Add my favorite lint rules to your Angular Workspace

```
cd your-app
schematics gb-schematics:eslint
```

## Add prettier formatting to your Project

```
cd your-app
schematics gb-schematics:prettier [--skipInstall]
```

## Add Typescript to your project

```
cd your-app
schematics gb-schematics:typescript
```

see 

* [Angular Schematics](https://github.com/angular/angular-cli/tree/master/packages/schematics/angular)
* [Schematics README](https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics/README.md)
* [Angular Blog](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)

```powershell
npx json2ts .\src\workspace\schema.json .\src\workspace\schema.d.ts
npx json2ts .\src\application\schema.json .\src\application\schema.d.ts
npx json2ts .\src\ng-new\schema.json .\src\ng-new\schema.d.ts
npx json2ts .\src\app-shell\schema.json .\src\app-shell\schema.d.ts

npx tsc;node .\src\util\schema2ts
```