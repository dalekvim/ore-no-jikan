import { useFormik } from "formik";
import { observer } from "mobx-react-lite";
import React from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useNavigate } from "react-router-dom";
import { setAccessToken } from "../auth/accessToken";
import { useLoginMutation } from "../generated/graphql";
import { styles } from "../styles";

export const LoginScreen: React.FC = observer(() => {
  const [login] = useLoginMutation();
  const [errorMessage, setErrorMessage] = React.useState("");
  const navigate = useNavigate();

  const { handleChange, handleBlur, handleSubmit, values, isSubmitting } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      onSubmit: async ({ email, password }) => {
        await login({
          variables: {
            loginInput: {
              email,
              password,
            },
          },
        })
          .then(({ data }) => {
            if (data) {
              setAccessToken(data.login.accessToken);
              navigate("/");
            } else {
              setErrorMessage("could not login");
            }
          })
          .catch(({ graphQLErrors }) => {
            setErrorMessage(graphQLErrors[0].message);
          });
      },
    });

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Login</Text>

        {errorMessage ? <Text style={styles.red}>{errorMessage}</Text> : null}

        <View>
          <Text style={styles.bold}>Email</Text>
          <TextInput
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            value={values.email}
            placeholder="example@email.com"
          />
          <Text>{"\n"}</Text>
        </View>

        <View>
          <Text style={styles.bold}>Password</Text>
          <TextInput
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            value={values.password}
            placeholder="password"
            secureTextEntry={true}
          />
          <Text>{"\n"}</Text>
        </View>

        <Button
          onPress={handleSubmit as any}
          disabled={isSubmitting}
          title="Submit"
        />
      </View>
    </View>
  );
});
