import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RenamedSymbol } from '@spartacus/schematics';
import { migrateRenamedSymbols } from '../../mechanism/rename-symbol/rename-symbol';

export const RENAMED_SYMBOLS_DATA: RenamedSymbol[] = [];

export function migrate(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return migrateRenamedSymbols(tree, context, RENAMED_SYMBOLS_DATA);
  };
}
