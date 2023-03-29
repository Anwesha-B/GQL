const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLNonNull
} = graphql;

const users = [
    { id: '23', firstName: 'Leon', age: 20 },
    { id: '47', firstName: 'Lyanna', age: 30 },
];

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: {type: GraphQLString},
        name: { type: GraphQLString}, 
        description: { type: GraphQLString },
        users: {
            type: new graphql.GraphQLList(UserType),
            resolve(parentValue, args) {
                console.log(parentValue);
                return fetch(`http://localhost:3000/companies/${parentValue.id}/users`).then(resp => resp.json())
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: {type: GraphQLString},
        firstName: { type: GraphQLString}, 
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return fetch(`http://localhost:3000/companies/${parentValue.companyId}`).then(resp => resp.json())
            }
        }
    }
})



const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return fetch(`http://localhost:3000/users/${args.id}`).then(resp => resp.json()) //users.find(user => user.id === args.id);
                
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return fetch(`http://localhost:3000/companies/${args.id}`).then(resp => resp.json()) //users.find(user => user.id === args.id);
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLInt},
            },
            resolve(parentValue, { firstName, age, companyId}) {
                const response = fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firstName, age, companyId
                    }),
                }).then(resp => {
                    return resp.json()
                });
                return response;
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                userId: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { userId}) {
                const response = fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId
                    }),
                }).then(resp => {
                    return resp.json()
                });
                console.log(response);
                return response;
            }
        },
        editUser: {
            type: UserType,
            args: {
                userId: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: GraphQLString},
                age: { type: GraphQLInt },
                companyId: { type: GraphQLInt },
            },
            resolve(parentValue, { userId, name, age, companyId}) {
                const response = fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: userId, firstName: name, age, companyId
                    }),
                }).then(resp => {
                    return resp.json()
                });
                console.log(response);
                return response;
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});


/* npm run json:server */
/* node server.js */