import React from "react";
import { Text } from "react-native";
import { useHelloQuery } from "../generated/graphql";

export const Hello: React.FC = () => {
  const { loading, error, data } = useHelloQuery();

  return loading ? (
    <Text>Loading...</Text>
  ) : error ? (
    <Text>{error.graphQLErrors[0].message}</Text>
  ) : data ? (
    <Text>{data.hello}</Text>
  ) : null;
};
