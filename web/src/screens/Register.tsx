import { useFormik } from "formik";
import React from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useRegisterMutation } from "../generated/graphql";
import { styles } from "../styles";

const validataionSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password should be of minimum 8 characters length")
    .required("Password is required"),
});

export const RegisterScreen: React.FC = () => {
  const [register] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = React.useState("");

  const navigate = useNavigate();

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    touched,
    errors,
    isSubmitting,
  } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validataionSchema,
    onSubmit: async ({ email, password }) => {
      await register({
        variables: {
          registerInput: {
            email,
            password,
          },
        },
      })
        .then(() => navigate("/login"))
        .catch((err) => setErrorMessage(err.graphQLErrors[0].message));
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Register</Text>

        {errorMessage ? <Text style={styles.red}>{errorMessage}</Text> : null}

        <View>
          <Text style={styles.bold}>Email</Text>
          <TextInput
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            value={values.email}
            placeholder="example@email.com"
          />
          {touched.email && errors.email ? (
            <Text style={styles.red}>{errors.email}</Text>
          ) : null}
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
          {touched.password && errors.password ? (
            <Text style={styles.red}>{errors.password}</Text>
          ) : null}
        </View>

        <Button
          onPress={handleSubmit as any}
          disabled={isSubmitting}
          title="Submit"
        />
      </View>
    </View>
  );
};
