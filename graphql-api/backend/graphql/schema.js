const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
  }
  
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type PostsData {
    posts: [Post]!
    totalPosts: Int!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
    fetchPosts(page: Int): PostsData!
    status: String!
    getPost(postId: String!): Post!
  }

  type RootMutation {
    createUser(userInput: UserInputData!): User!
    createPost(postInput: PostInputData!): Post!
    updateStatus(statusText: String!): String!
    updatePost(postId: String!, postInput: PostInputData): Post!
    deletePost(postId: String!): String!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
