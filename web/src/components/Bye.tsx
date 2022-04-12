import React from "react";
import { Button, Text, View } from "react-native";
import { useByeQuery } from "../generated/graphql";

export const Bye: React.FC = () => {
  const { loading, error, data, refetch } = useByeQuery();

  return loading ? (
    <Text>Loading...</Text>
  ) : error ? (
    <Text>{error.graphQLErrors[0].message}</Text>
  ) : data ? (
    <View>
      <Text>{data.bye}</Text>
      <Button title="refetch" onPress={() => refetch()} />
    </View>
  ) : null;
};
