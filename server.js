const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
} = require("graphql");

const app = express();

const users = [
  { id: 1, firstName: "Joy", lastName: "Sorkar" },
  { id: 2, firstName: "Ruhul", lastName: "Amin" },
];

const posts = [
  {
    id: 1,
    title: "JavaScript",
    description: "Javascript is a programming language",
    userId: 1,
    country: {
      name: "USA",
      currency: "USD",
    },
  },
  {
    id: 2,
    title: "PHP",
    description: "PHP is a programming language",
    userId: 1,
    country: {
      name: "Bangladesh",
      currency: "BDT",
    },
  },
];

const UserType = new GraphQLObjectType({
  name: "User",
  description: "it represents a single user",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (userObj, args) => {
        return posts.filter((post) => post.userId == userObj.id);
      },
    },
  }),
});

const PostType = new GraphQLObjectType({
  name: "Post",
  description: "it represents a single post",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    country: {
      type: countryType,
    },
    user: {
      type: UserType,
      resolve: (post) => {
        return users.find((user) => user.id == post.userId);
      },
    },
  }),
});

const countryType = new GraphQLObjectType({
  name: "country",
  description: "county details",
  fields: () => ({
    name: { type: GraphQLString },
    currency: { type: GraphQLString },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve: () => {
        return users;
      },
    },
    user: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (_, args) => {
        return users.find((user) => user.id == args.id);
      },
    },
    posts: {
      type: GraphQLList(PostType),
      resolve: () => {
        return posts;
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addUser: {
      type: UserType,
      args: {
        firstName: {
          type: GraphQLString,
        },

        lastName: {
          type: GraphQLString,
        },
      },
      resolve: (_, { firstName, lastName }) => {
        const user = {
          id: users.length + 1,
          firstName,
          lastName,
        };
        users.push(user);
        return user;
      },
    },
    addPost: {
      type: PostType,
      args: {
        title: {
          type: new GraphQLNonNull(GraphQLString),
        },
        description: {
          type: new GraphQLNonNull(GraphQLString),
        },
        userId: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        country: {
          type: new GraphQLInputObjectType({
            name: "CountryInput",
            fields: {
              a: { type: GraphQLString },
              b: { type: GraphQLString },
            },
          }),
        },
      },
      resolve: (_, { title, description, userId, country }) => {
        const post = {
          id: posts.length + 1,
          title,
          description,
          userId,
          country: {
            name: country.a,
            currency: country.b,
          },
        };
        posts.push(post);
        return post;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(3001, console.log("Server is running on port 3001"));
