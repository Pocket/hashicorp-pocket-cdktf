import path from 'path';
import fs from 'fs';
import { gql } from 'apollo-server';

export default gql(
  fs.readFileSync(path.join(__dirname, '..', 'schema.graphql')).toString()
);
