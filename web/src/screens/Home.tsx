import React from "react";
import { Button, View } from "react-native";
import { useNavigate } from "react-router-dom";
import { getAccessToken, setAccessToken } from "../auth/accessToken";
import { Bye } from "../components/Bye";
import { Hello } from "../components/Hello";
import { useLogoutMutation } from "../generated/graphql";
import { styles } from "../styles";

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [logout, { client }] = useLogoutMutation();

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Hello />
        <Bye />
        {getAccessToken() ? (
          <Button
            title="logout"
            onPress={async () => {
              await logout();
              setAccessToken("");
              await client.resetStore().catch((err) => {
                console.log(err.graphQLErrors[0].message);
              });
            }}
          />
        ) : (
          <View>
            <Button title="register" onPress={() => navigate("register")} />
            <Button title="login" onPress={() => navigate("login")} />
          </View>
        )}
      </View>
    </View>
  );
};
