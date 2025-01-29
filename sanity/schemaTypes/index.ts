import { type SchemaTypeDefinition } from 'sanity';
import { user } from './user';
import { courtSchedule } from './courtSchedule';
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [user, courtSchedule],
};
