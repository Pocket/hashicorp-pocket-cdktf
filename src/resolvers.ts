export const resolvers = {
  Acme: {},
  Query: {
    getAcme: async (_source, { id }, { repositories }): Promise<{}> => {
      return {};
    },
  },
};
