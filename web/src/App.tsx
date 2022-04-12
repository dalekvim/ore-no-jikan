import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";
import React, { useEffect } from "react";
import { Text } from "react-native";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { getAccessToken, setAccessToken } from "./auth/accessToken";
import { HomeScreen } from "./screens/Home";
import { LoginScreen } from "./screens/Login";
import { RegisterScreen } from "./screens/Register";

// const requestLink = new ApolloLink(
//   (operation, forward) =>
//     new Observable((observer) => {
//       let handle: any;
//       Promise.resolve(operation)
//         .then((operation) => {
//           const accessToken = getAccessToken();
//           if (accessToken) {
//             operation.setContext({
//               headers: {
//                 authorization: `bearer ${accessToken}`,
//               },
//             });
//           }
//         })
//         .then(() => {
//           handle = forward(operation).subscribe({
//             next: observer.next.bind(observer),
//             error: observer.error.bind(observer),
//             complete: observer.complete.bind(observer),
//           });
//         })
//         .catch(observer.error.bind(observer));
//       return () => {
//         if (handle) handle.unsubscribe();
//       };
//     })
// );

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = getAccessToken();
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : "",
    },
  };
});

const tokenRefreshlink = new TokenRefreshLink({
  accessTokenField: "accessToken",
  isTokenValidOrUndefined: () => {
    const token = getAccessToken();

    if (!token) return true;

    try {
      const { exp } = jwtDecode(token) as any;
      if (Date.now() >= exp * 1000) {
        return false;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  },
  fetchAccessToken: () => {
    return fetch("http://localhost:4000/refresh_token", {
      method: "POST",
      credentials: "include",
    });
  },
  handleFetch: (accessToken: string) => {
    setAccessToken(accessToken);
  },
  handleError: (err: Error) => {
    console.warn("Your refresh token is invalid. Try to relogin.");
    console.error(err);
  },
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      // console.log(graphQLErrors);
      // console.log(networkError);
    }),
    tokenRefreshlink,
    authLink,
    httpLink,
  ]),
  cache: new InMemoryCache(),
});

export const App: React.FC = () => {
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/refresh_token", {
      method: "POST",
      credentials: "include",
    }).then(async (res) => {
      const { accessToken } = await res.json();
      setAccessToken(accessToken);
      setLoading(false);
    });
  }, []);

  if (loading) return <Text>Loading...</Text>;

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="login" element={<LoginScreen />} />
          <Route path="register" element={<RegisterScreen />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
};
